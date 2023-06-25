// -*- mode: web; web-mode-code-indent-offset: 4; -*-

import autobahn from 'autobahn';

let ac = require('./access');

let ocs_bundle;

export function init(ocs_bundle_) {
    ocs_bundle = ocs_bundle_;
}

export function OCSConnection(url_func, realm_func, addr_root_func)
{
    this.url_func = url_func;
    this.realm_func = realm_func;
    this.addr_root_func = addr_root_func;

    // Hooks; assign handlers with .on(trigger, func).
    this.handlers = {
        'connected': null,
        'try_connect': null,
        'disconnected': null,
    };

    this.feeds = {};

    this.connection = null;

    this._reconnection = {
        timer: null,
        delay: 5.0,
        count: 0,
        requested: false };

    this.agent_list = new AgentList(this);
    this.passwords = new ac.PasswordManager();

    this.ready_defer = new autobahn.when.defer();
}

OCSConnection.prototype = {
    connect : function()
    {
        if (this.connection)
            this.connection.close();

        var this_ocs = this;
        var url = this.url_func();
        var realm = this.realm_func();
        var addr_root = 'observatory';
        if (this.addr_root_func)
            addr_root = this.addr_root_func();

        // See connection options at...
        // https://github.com/crossbario/autobahn-js/blob/master/packages/autobahn/lib/connection.js
        //
        // We set max_retries=0 and manage retries ourself, so that
        // retries always go to address in the input boxes.
        var c = new autobahn.Connection({
            url: url,
            realm: realm,
            max_retries: 0,
        });

        c.onopen = function(_session, details) { // eslint-disable-line
            ocs_bundle.util.log('connected.');
            this_ocs._reconnection.count = 0;

            if (this_ocs.handlers.connected)
                this_ocs.handlers.connected();

            // Monitor heartbeat feeds to see what Agents are online.
            c.session.subscribe(addr_root + '..feeds.heartbeat',
                                function (args, kwargs, details) { // eslint-disable-line
                                    var info = args[0][1];
                                    this_ocs.agent_list._heartbeat(info);
                                }, {'match': 'wildcard'});

            // Subscribe for all registered feed handlers.
            for (const [feed_name, handler] of Object.entries(this_ocs.feeds))
                c.session.subscribe(feed_name, handler);

            // Waken waiters.
            this_ocs.ready_defer.resolve();
        };

        c.onclose = function(reason, details) {
            // Reasons observed:
            // - "lost" - crossbar dropped out.
            // - "closed" - app has called close() -- but this also occurs
            //   if the realm could not be joined.
            // - "unreachable" - failed to connect (onopen never called)
            ocs_bundle.util.log('closed because: ' + reason + ' : ' + details.message);

            if (this_ocs.handlers.disconnected)
                this_ocs.handlers.disconnected();

            // Flush each feed handler.
            for (const [feed_name, handler] of Object.entries(this_ocs.feeds)) // eslint-disable-line
                handler(null, null, null);

            this_ocs.connection = null;

            // If this looks like an orderly deliberate shutdown, do an
            // immediate reconnect.  Otherwise, keep the pace low...
            if (reason == 'closed' && this_ocs._reconnection.requested) {
                this_ocs.connect();
            } else if (this_ocs._reconnection.count++ < 1000) {
                this_ocs._reconnection.timer = setInterval(
                    function() {this_ocs.connect()},
                    this_ocs._reconnection.delay*1000.0);
            }
            this_ocs._reconnection.requested = false;
        };

        ocs_bundle.util.log('Trying connection to "' + url + '", realm "' + realm + '"...');
        if (this_ocs.handlers.try_connect)
            this_ocs.handlers.try_connect();

        if (this_ocs._reconnection.timer)
            clearInterval(this_ocs._reconnection.timer);

        this.connection = c;
        c.open();
    },

    start: function() {
        this.connect();
    },

    on: function(action, handler) {
        this.handlers[action] = handler;
    },

    // Temporary single feed registration system.
    set_feed: function(feed_name, handler) {
        this.feeds = {};
        this.feeds[feed_name] = handler;
        this._reconnection.requested = true;
        this.connection.close();
    },

    get_client: function(agent_address) {
        return new AgentClient(this, agent_address);
    },
}

/** AgentList
 *
 *  Helps OCSConnection to monitor heartbeat feeds and track which
 *  agents are up.
 */

function AgentList (connection) {
    // This is a map from agent_address to info block.
    this._data = {};

    // Map from agent_address to map from subscriber to callback.
    // Callback is invoked with (agent_addr, heartbeat_ok).
    this._callbacks = {};

    this.connection = connection;

    // Occasional updates
    setInterval(() => {
        this._update_states();
    }, 3000);
}

AgentList.prototype = {
    subscribe: function(subscriber, agent_addr, callback) {
        if (!this._callbacks[agent_addr])
            this._callbacks[agent_addr] = {};
        this._callbacks[agent_addr][subscriber] = callback;
        if (agent_addr == '*') {
            Object.entries(this._data).map(([name, info]) => {
                callback(name, info.ok, info);
            });
        } else if (this._data[agent_addr])
            callback(agent_addr, this._data[agent_addr].ok);
    },

    unsubscribe: function (subscriber) {
        Object.values(this._callbacks).forEach( (cbs) => {
            delete cbs[subscriber];
        });
    },

    _heartbeat: function(info) {
        var addr = info.agent_address;
        var now = ocs_bundle.util.timestamp_now();
        if (!this._data[addr]) {
            // Query the agent's API and only then add it as data.
            var client = new AgentClient(this.connection, addr);
            //var dest = this._data[addr];
            client.scan().then(() => {
                this._data[addr] = {
                    agent_class: client.agent_class,
                    last_update: now,
                }
                this._update_states();
            });
        } else
            this._data[addr]['last_update'] = now;
    },

    _update_states: function() {
        var AL = this;
        let key_order = Object.keys(AL._data);
        key_order.sort();

        key_order.forEach((k) => {
            let info = AL._data[k];
            let is_now_ok = (ocs_bundle.util.timestamp_now() - info['last_update'] <= 5);
            // Callbacks on change.
            if (is_now_ok != info.ok) {
                info.ok = is_now_ok;
                if (AL._callbacks[k]) {
                    Object.entries(AL._callbacks[k]).forEach(
                        ([, func]) => func(k, is_now_ok, info));
                }
                if (AL._callbacks['*']) {
                    Object.entries(AL._callbacks['*']).forEach(
                        ([, func]) => func(k, is_now_ok, info));
                }
            }
        });
    },
}


/* AgentClient
 *
 * Tracks the status of a client.  Instantiate with an OCSConnection
 * (will will maintain an autobahn.Connection internally), and the
 * agent address.
 */

export function AgentClient(_ocs, address) {
    this.ocs = _ocs;
    this.address = address;
    this.tasks = null;
    this.procs = null;
    this.feeds = null;
    this.agent_class = null;
    this.watchers = {};
    this.connection_ok = true;
    [this.instance_id] = address.split('.').slice(-1);
    this._index = Object.getPrototypeOf(this).counter++;
}

AgentClient.prototype = {
    counter: 0,

    // scan
    //
    // Uses the "get_api" method to get the lists of all tasks,
    // processes, and feeds of the Agent.  The task and process items
    // include session status information, as well.

    scan : function(callback) {
        // Try first on the "new" API; fall back to the old one (now
        // deprecated).
        var client = this;
        return this.ocs.connection.session.call(this.address, ['get_api'])
            .then( function(result) {
                // Calling an invalid method address seems to return
                // null result, rather than raise a catchable.
                if (!result) {
                    console.log('Warning, ' + this.address + ' did not respond to "get_api" call.');
                    return;
                }
                // New API.
                client.tasks = result.tasks;
                client.procs = result.processes;
                client.feeds = result.feeds;
                client.agent_class = result.agent_class;
                client.access_control = result.access_control;
                if (callback != null)
                    callback();
                return client;
            });
    },

    // dispatch
    //
    // Issue a request on the Agent's task/proc API.  This API always
    // returns a response of the form (code, message, session).
    //
    // @param method      API request: start, wait, stop, abort, status.
    // @param op_name     Name of the Task or Process.
    // @param params      Object with key-value parameters for the method.

    dispatch : function(method, op_name, params) {
        // Wrap all API calls to call our onSession handler before
        // returning to the invoking agent.
        var d = new autobahn.when.defer();
        if (!this.ocs.connection) {
            d.reject();
            return d.promise;
        }

        var _p = [method, op_name, params];
        let _kw = {};

        // Transitional -- don't provide a password unless API supports it.
        if (this.access_control && ocs_bundle.get_password_settings().escalation) {
            _kw.password =
                this.ocs.passwords.get_pass(this.agent_class, this.instance_id, 3);
        }

        let client = this;
        client.ocs.connection.session.call(client.address + '.ops', _p, _kw).then(
            function (args) {
                // OCS responds with a simple list, args = [exit_code,
                // message, session].
                if (client.watchers[op_name])
                    client.watchers[op_name].handlers.forEach(h =>
                        { h.f(op_name, method, args[0], args[1], args[2]) });
                d.resolve(args);
            });
        return d.promise;
    },

    // task/proc API
    //
    // These functions should be used when working with the task/proc API.
    //

    start_task : function(task_name, params) {
        return this.dispatch('start', task_name, params);
    },

    wait_task : function(task_name, params) {
        return this.dispatch('wait', task_name, params);
    },

    // run_task is the equivalent of start_task followed by wait_task.
    // It returns a promise that will resolve once the Task has
    // completed, and will reject if the start fails.
    run_task : function(task_name, params) {
        let client = this;
        var d = new autobahn.when.defer();
        client.start_task(task_name, params).then(
            function (result) {
                // Reply from start()
                if (result[0] == 0) {
                    client.wait_task(task_name, params).then(
                        // wait: success?
                        function (result) {
                            d.resolve(result[1]);
                        },
                        function () {
                            d.reject('Could not complete wait() request');
                        }
                    );
                } else
                    d.reject(result[1]);
            },
            // start: failure?
            function () {
                d.reject('Could not issue start() request.')
            }
        );
        return d.promise;
    },

    abort_task : function(task_name) {
        return this.dispatch('abort', task_name, []);
    },

    start_proc : function(proc_name, params) {
        return this.dispatch('start', proc_name, params);
    },

    stop_proc : function(proc_name) {
        return this.dispatch('stop', proc_name, []);
    },

    status : function(op_name) {
        return this.dispatch('status', op_name, []);
    },

    // API for attaching session information handlers.
    add_watcher: function(op_name, span, handler) {
        // op_name: Name of operation to handle.
        // span: Interval at which to poll the operation (if 0, do not poll).
        // handler: function to call on each status reply.
        //
        // The signature of handler should be (op_name, method_name,
        // exit_code, message, session).
        if (!this.watchers[op_name]) {
            this.watchers[op_name] = {
                last_update: 0.,
                timer: null,
                span: 0,
                handlers: [],
            };
        }
        var current_span = this.watchers[op_name].span;
        if (span > 0 && (current_span == 0 || current_span > span)) {
            this.watchers[op_name].span = span;
            clearInterval(this.watchers[op_name].timer);
            var client = this;
            this.watchers[op_name].timer = setInterval(function () {
                if (client.connection_ok)
                    client.status(op_name);
            }, span * 1000.0);
            // If ~slow update, trigger one immediately too.
            if (span >= 1.)
                client.status(op_name);
        }
        this.watchers[op_name].handlers.push({f: handler, span: span});
    },

    clear_watchers: function(op_name) {
        // If op_name is not set, clears all watchers.
        if (!op_name)
            return Object.keys(this.watchers).map(k => this.clear_watchers(k));
        if (this.watchers[op_name]) {
            clearInterval(this.watchers[op_name].timer);
            delete this.watchers[op_name];
        }
    },

    destroy: function() {
        // Stop all timers.  No more callbacks.
        this.clear_watchers();
    },
}

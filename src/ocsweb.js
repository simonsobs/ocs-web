/** register_panel(comp, dest)
 *
 *  Establish an OCSClient for an agent panel; scan the API using the
 *  client; add session watchers for all operations listed in
 *  comp.ops; subscribe to AgentList so that connection issues with
 *  the agent get propagated into comp.connection_ok.
 *
 *  Args:
 *    comp: the component (this) for an Agent panel.
 *    dest: an object where to store the OCSClient (optional).
 *
 *  Returns:
 *    promise of the OCSClient.
 *
 */
export
function register_panel(comp, dest) {
  return window.ocs.ready_defer.promise.then( () => {

    // Get (and stow) an OCSClient.
    let client = window.ocs.get_client(comp.address);
    if (dest)
      dest.client = client;
    
    // Subscribe to heartbeat info updates.
    window.ocs.agent_list.subscribe(comp.address, comp.address, (addr, conn_ok) => {
      client.connection_ok = conn_ok;
      comp.connection_ok = conn_ok;
    });

    // Scan for API ... this will run in background; returns a promise.
    let p = client.scan().then(client => {

      // Update comp.ops with any tasks / processes that weren't
      // already mentioned; mark them as auto: true.
      client.tasks.map(([name, , cfg]) => {
        if (!comp.ops[name] || comp.ops[name].auto)
          comp.ops[name] = {
            name: name,
            type: 'task',
            auto: true,
            params: {},
            session: friendlyize_session(),
            show_abort: cfg.abortable};
      });
      client.procs.map(([name]) => {
        if (!comp.ops[name] || comp.ops[name].auto)
          comp.ops[name] = {
            name: name,
            type: 'proc',
            auto: true,
            params: {},
            session: friendlyize_session(),
          };
      });

      // Monitor every operation for session updates.
      Object.keys(comp.ops).forEach(k => {
        client.add_watcher(k, 1.0, (op_name, method, stat, msg, session) => {
          if(!comp.ops)
            return;
          comp.ops[k].session = friendlyize_session(session);
        });
      });

      return client;
    });

    return p;
  });
}

/** unregister_panel(comp, client)
  *
  * Undo the registrations done by register_panel, namely to unscribe
  * from AgentList and clear the session watchers.
  *
  * The "comp" should be the same component passed to register_panel;
  * the client should be the client returned by it.
  */
export
function unregister_panel(comp, client) {
  client.clear_watchers();
  window.ocs.agent_list.unsubscribe(comp.address, comp.address);
}

export
function friendlyize_session(session) {
  if (!session)
    session = {};
  if (!session.data)
    session.data = {};
  if (!session.status)
    session.status = 'unknown';
  return session;
}

export
function ops_data_init(params) {
  Object.entries(params).map(([key, val]) => {
    if (!val.name)
      val.name = key;
    if (!val.params)
      val.params = {};
    val.session = friendlyize_session(val.session);
  });
  return params;
}

export
function get_status_string(session) {
    let util = window.ocs_bundle.util;
    let ago = util.timestamp_now() - session.start_time;
    var t = '(unknown)';
    switch(session.status) {
        case 'idle':
        case 'starting':
        case 'running':
        case 'stopping':
            t = session.status + ' (' + util.human_timespan(ago, 1) + ')';
            break;
        case 'done':
            ago = util.timestamp_now() - session.end_time;
            var success = {true: 'OK', false: 'ERROR'}[session.success];
        t = `${session.status} - ${success} - ` + util.human_timespan(ago, 1) + ' ago';
            break;
        }
    return t;
}

function clean_config(item) {
  /** For a crossbar config block, fill in realm and addr_root, if
   * missing. */
  if (!item.realm)
    item.realm = 'test_realm';
  if (!item.addr_root)
    item.addr_root = 'observatory';
  return item;
}

export
function setup_configs() {
  let configs = [];

  // Decode environment var ... expecting format
  //   "name1,url1,realm1,addr_root1;name2,url2,realm2,addr_root2;..."
  // Ok if missing realm or realm and addr_root.
  let addrs = process.env.VUE_APP_OCS_ADDRS;
  if (addrs) {
    addrs.split(';').map(addr => {
      let item = {};
      [item.name, item.url, item.realm, item.addr_root] = addr.split(',');
      configs.push(clean_config(item));
    });
  }

  // Parse entries in the config.json file.
  if (window.config.crossbars) {
    window.config.crossbars.map((item) => {
      configs.push(clean_config(item))
    });
  }

  // Push an editable item with default dev config.
  configs.push(
    clean_config({'name': 'custom',
                  'url': 'ws://localhost:8001/ws',
                  'edit': true})
  );

  return [configs, 0];
}

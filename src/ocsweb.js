export
function register_panel(comp, callback, dest) {
  // register a promise that will populate comp.client, then add
  // watchers for every op, then call callback.

  window.ocs.ready_defer.promise.then( () => {
    let client = window.ocs.get_client(comp.address);
    
    Object.keys(comp.ops).forEach(k => {
      client.add_watcher(k, 1.0, (op_name, method, stat, msg, session) => {
        if(!comp.ops)
          return;
        comp.ops[k].session = friendlyize_session(session);
      });
    });

    // Subscribe to heartbeat, identify self with agent address.
    window.ocs.agent_list.subscribe(comp.address, comp.address, (addr, conn_ok) => {
      client.connection_ok = conn_ok;
      comp.connection_ok = conn_ok;
    });

    // Scan for API ... this will run in background; returns a promise.
    client.scan();
    //  .then((client) => {console.log('done scan client is', client)});

    if (callback)
      callback(client);
    if (dest)
      dest.client = client;
  });
}

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

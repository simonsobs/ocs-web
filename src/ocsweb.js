export
function register_panel(comp, callback, dest) {
  // register a promise that will populate comp.client, then add
  // watchers for every op, then call callback.

  window.ocs.ready_defer.promise.then( () => {
    let client = window.ocs.get_client(comp.address);
    
    Object.keys(comp.ops).forEach(k => {
      client.add_watcher(k, 1.0, (op_name, method, stat, msg, session) => {
        if(!comp.ops || !session)
          return;
        comp.ops[k].session = session;
        if (session.status)
          comp.ops[k].status = session.status;
        if (session.data)
          comp.ops[k].data = session.data;
      });
    });

    // Subscribe to heartbeat, identify self with agent address.
    window.ocs.agent_list.subscribe(comp.address, comp.address, (addr, conn_ok) => {
      comp.connection_ok = conn_ok;
    });

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
function ops_data_init(params) {
  Object.entries(params).map(([key, val]) => {
    if (!val.name)
      val.name = key;
    if (!val.params)
      val.params = {};
    if (!val.status)
      val.status = 'unknown';
    if (!val.data)
      val.data = {};
    if (!val.session)
      val.session = {};
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

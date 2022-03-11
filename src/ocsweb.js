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

export
function get_default_url() {
  let url = process.env.VUE_APP_OCS_URL;
  if (!url)
    url = 'ws://localhost:8001/ws';
  return url;
}

export
function get_default_realm() {
  let realm = process.env.VUE_APP_OCS_REALM;
  if (!realm)
    realm = 'test_realm';
  return realm;
}

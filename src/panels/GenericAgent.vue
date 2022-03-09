/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Generic Agent</h1>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          v-bind:value="address">
        </OpReading>
        <OpReading
          caption="Connection"
          mode="ok"
          v-bind:value="connection_ok">
        </OpReading>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsTask v-for="op in ops_task" v-bind:key="op"
               :address="address"
               :op_data="op"
               :op_name="op.name" />
      <OcsProcess v-for="op in ops_proc" v-bind:key="op"
               :address="address"
               :op_data="op"
               :op_name="op.name" />
    </div>

  </div>
</template>

<script>
  let ocs_reg = {};

  export default {
    name: 'GenericAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        connection_ok: false,
        ops_task: {},
        ops_proc: {},
      }
    },
    computed: {
      ops() {
        // Some stuff expects this.ops instead of separate ones ...
        let result = {};
        Object.entries(this.ops_task).forEach(([k, v]) =>
          result[k] = v);
        Object.entries(this.ops_proc).forEach(([k, v]) =>
          result[k] = v);
        return result;
      },
    },
    mounted() {
      window.ocs_bundle.web.register_panel(
        this,
        client => {
          // Query the API, and use the result to set the task and
          // process lists
          client.scan(() => {
            client.tasks.map(([name]) => {
              this.ops_task[name] = {};
            });
            client.procs.map(([name]) => {
              this.ops_proc[name] = {};
            });

            // Add watchers; this is normally handled in
            // register_panel, but before this callback (when ops are not
            // yet known.
            [this.ops_task, this.ops_proc].forEach(ops => {
              window.ocs_bundle.web.ops_data_init(ops);
              Object.keys(ops).forEach(k => {
                client.add_watcher(k, 1.0, (op_name, method, stat, msg, session) => {
                  if(!ops)
                    return;
                  ops[k].session =
                    window.ocs_bundle.web.friendlyize_session(session);
                })
              })
            });
          })
        },
        ocs_reg);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, ocs_reg.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

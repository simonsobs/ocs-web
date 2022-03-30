/* eslint-disable */
<template>
  <div class="ocs_ui">
    <i v-if="warn_about_auto">Operations widgets below are automatically instantiated,
    without any parameter fields.  Some may be usable without
    parameters while others are not.</i>
    <OcsTask v-for="op in ops_task" v-bind:key="op"
             class="autofilled"
             :address="address"
             :op_data="op" />
    <OcsProcess v-for="op in ops_proc" v-bind:key="op"
                :address="address"
                :op_data="op" />
  </div>
</template>

<script>
  let ocs_reg = {};

  export default {
    name: 'OcsOpAutofill',
    props: {
      address: String,
      ops_parent: Object,
      warn_about_auto: {
        Type: Boolean,
        default: true,
      },
    },
    data: function () {
      return {
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
              if (!this.ops_parent[name])
                this.ops_task[name] = {};
            });
            client.procs.map(([name]) => {
              if (!this.ops_parent[name])
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
  .autofilled >> label{
    color: #888;
  }

</style>

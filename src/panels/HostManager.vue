/* eslint-disable */
<template>
  <AgentPanelBase @clientConnected="startListening()"/>

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader>Host Manager</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading caption="Address"
                 v-bind:value="address">
        </OpReading>
        <OpReading caption="Connection"
                 mode="ok"
                 v-bind:value="panel.connection_ok">
        </OpReading>
        <form v-on:submit.prevent>
          <div class="ocs_row">
            <label>Refresh config</label>
            <button
              :disabled="accessLevel < 1"
              @click="refresh_config">Go</button>
          </div>
        </form>
        <h2>Managed Agents</h2>

        <form class="hm_kids" v-on:submit.prevent>
          <div class="hm_row hm_header">
            <span>instance-id</span>
            <span>agent-class</span>
            <span class="hm_center">current</span>
            <span class="hm_center">target</span>
            <span class="ocs_double hm_center">set-target</span>
          </div>
          <div v-for="item in children" :key="item.instance_id" class="hm_row">
            <span>{{ item.instance_id }}</span>
            <span>{{ item.agent_class }}</span>
            <span class="hm_center">{{ item.next_action }}</span>
            <span class="hm_center">{{ item.target_state }}</span>
            <button :disabled="accessLevel < 1" @click="set_target(item.instance_id, 'up')">up</button>
            <button :disabled="accessLevel < 1" @click="set_target(item.instance_id, 'down')">down</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsProcess
        :op_data="ops.manager">
      </OcsProcess>

      <OcsTask
        :op_data="ops.update">
        <div class="ocs_row">
          <label>Reload Config</label>
          <input type="checkbox" id="checkbox" v-model="ops.update.params.reload_config"
                 class="ocs_double" />
        </div>
      </OcsTask>

      <OcsTask
        :op_data="ops.die">
      </OcsTask>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'HostManager',
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        children: {},
        ops: window.ocs_bundle.web.ops_data_init({
          'manager': {},
          'update': {
            params: {reload_config: false},
          },
          'die': {},
        }),
      }
    },
    props: {
      address: String,
    },
    methods: {
      update_child_states(op_name, method, stat, msg, session) {
        if (!session.data || session.status != 'running')
          return;
        let new_info = {};
        session.data.child_states.map(
          state => {
            new_info[state.instance_id] = state;
        });
        this.children = new_info;
      },
      set_target(instance_id, updn) {
        this.children[instance_id].target_state = '(' + updn + ')';
        this.panel.client.run_task('update', {
            requests:  [[instance_id, updn]]
        });
      },
      refresh_config() {
          window.ocs_bundle.ui_start_proc(this.address, 'update',
                                          {'reload_config': true});
      },
      startListening() {
        this.panel.client.add_watcher('manager', 5., this.update_child_states);
      },
    },
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .hm_kids > div:nth-child(3n+1) {
    background-color: #fff;
  }
  .hm_kids > div:nth-child(3n+3) {
    background-color: #f0f0f0;
  }
  .hm_kids > div:nth-child(3n+2) {
    background-color: #f8f8f8;
  }
  .hm_row {
    display: grid;
    grid-template-columns: 3fr 3fr 1fr 1fr 1fr 1fr ;
  }
  .hm_row > div, button, span {
    font-size: 9pt;
    padding: 10px 0px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hm_header {
    border-bottom: 1px solid black;
  }
  .hm_header > span {
    font-weight: bold;
    padding: 10px 0px;
  }
  .hm_center {
    text-align: center;
  }
</style>

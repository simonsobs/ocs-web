<template>
  <AgentPanelBase @clientConnected="startListening()"/>

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Devantech dS378 Agent</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading caption="Address"
                 v-bind:value="address">
        </OpReading>
        <OcsLightLine caption="Status">
          <OcsLight
            caption="OCS"
            tip="Status of the connection between ocs-web and OCS crossbar."
            :value="getIndicator('ocs')"
          />
          <OcsLight
            caption="AGT"
            tip="Status of the connection between ocs-web and the Agent."
            :value="panel.connection_ok"
          />
          <OcsLight
            caption="ACQ"
            tip="Indicates that the acq appears to be acquiring data properly."
            :value="getIndicator('acq')"
          />
        </OcsLightLine>

        <h2>relays</h2>

        <div v-if="panel.connection_ok">
          <span id="relay_warning" v-if="relay_warning"><b>{{ relay_warning }}</b></span>
          <form class="ds_kids" v-on:submit.prevent>
            <div class="ds_row ds_header">
              <span>name</span>
              <span class="ds_center">state</span>
              <span />
              <span class="ocs_double ds_center">set</span>
            </div>
            <div v-for="item in relays" :key="item.name" class="ds_row">
              <span :class="{
                    ds_on: item.state==1,
                    ds_off: item.state==0,
                    }"
              >{{ item.name }}</span>
              <span class="ds_center"
                    :class="{
                      ds_on: item.state==1,
                      ds_off: item.state==0,
                    }"
              >
                <span v-if="item.locked">&#128274;</span>
                {{ item.state == 1 ? 'on' : 'off' }}
                <span v-if="item.locked">&#128274;</span>              </span>
              <span />
              <button :disabled="accessLevel < 1 || item.locked" @click="set_target(item.idx, 1)">on</button>
              <button :disabled="accessLevel < 1 || item.locked" @click="set_target(item.idx, 0)">off</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsProcess
        :op_data="ops.acq">
      </OcsProcess>

      <OcsTask
        :op_data="ops.set_relay">
        <OpParam
          caption="relay (1-8)"
          v-model.number="ops.set_relay.params.relay_number" />
        <OpDropdown
          caption="on(1) / off(0)"
          :options="[1, 0]"
          v-model.number="ops.set_relay.params.on_off" />
      </OcsTask>

    </div>
  </div>
</template>

<script>
  export default {
    name: 'DS378Agent',
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        relay_warning: null,
        relays: {},
        ops: window.ocs_bundle.web.ops_data_init({
          'acq': {},
          'set_relay': {params: {on_off: 0}},
        }),
      }
    },
    props: {
      address: String,
    },
    methods: {
      update_relay_states(op_name, method, stat, msg, session) {
        if (!this.panel.connection_ok) {
          this.relays = {};
          this.relay_warning = 'No connection to agent!';
          return;
        }
        if (!session.data || (session.status != 'running' && session.status != 'starting')) {
          this.relays = {};
          this.relay_warning = 'No relay data -- is acq process running?';
          return;
        }

        if (window.ocs_bundle.util.timestamp_now() - session.data.timestamp > 120) {
          this.relays = {};
          this.relay_warning = 'relay data are stale -- check acq process?';
          return;
        }

        let new_info = {};
        [1,2,3,4,5,6,7,8].map( idx => {
          let k = 'Relay_' + idx;
          new_info[idx] = {'name': k, 'state': session.data[k]};
          new_info[idx].idx = idx;
        });
        this.relays = new_info;
        this.relay_warning = null;
      },
      set_target(idx, state) {
        this.panel.client.run_task('set_relay', {
          relay_number: idx,
          on_off: state});
      },
      getIndicator(name) {
        switch (name) {
          case 'ocs':
            return window.ocs.connection.isConnected;
          case 'acq':
            {
              let session = this.ops.acq.session;
              return (session.status == 'running' ||
                      session.status == 'starting');
            }
        }
        return false;
      },
      startListening() {
        this.panel.client.add_watcher('acq', 5., this.update_relay_states);
      },
    },
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .ds_row {
    display: grid;
    grid-template-columns: 3fr 2fr 5px 1fr 1fr ;
  }
  .ds_row > div, button, span {
    font-size: 9pt;
    padding: 10px;
    margin: 2px 0px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ds_header {
    border-bottom: 1px solid black;
    padding: 10px;
  }
  .ds_header > span {
    font-weight: bold;
    padding: 10px 0px;
  }
  .ds_center {
    text-align: center;
  }
  .ds_on {
    background-color: #4e4;
  }
  .ds_off {
    background-color: #f88;
  }
</style>

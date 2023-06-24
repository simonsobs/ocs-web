/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader>ibootbar Agent</OcsAgentHeader>
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
            :value="connection_ok"
          />
          <OcsLight
            caption="ACQ"
            tip="Indicates that the acq appears to be acquiring data properly."
            :value="getIndicator('acq')"
          />
        </OcsLightLine>

        <h2>Outlets</h2>

        <div v-if="connection_ok">
          <span id="outlet_warning" v-if="outlet_warning"><b>{{ outlet_warning }}</b></span>
          <form class="ib_kids" v-on:submit.prevent>
            <div class="ib_row ib_header">
              <span>name</span>
              <span class="ib_center">state</span>
              <span />
              <span class="ocs_triple ib_center">set</span>
            </div>
            <div v-for="item in outlets" :key="item.name" class="ib_row">
              <span :class="{
                    ib_on: item.description=='on',
                    ib_off: item.description=='off',
                    }"
              >{{ item.name }}</span>
              <span class="ib_center"
                    :class="{
                      ib_on: item.description=='on',
                      ib_off: item.description=='off',
                    }"
              >
                <span v-if="item.locked">&#128274;</span>
                {{ item.description }}
                <span v-if="item.locked">&#128274;</span>              </span>
              <span />
              <button :disabled="accessLevel < 1 || item.locked" @click="set_target(item.idx, 'on')">on</button>
              <button :disabled="accessLevel < 1 || item.locked" @click="set_target(item.idx, 'off')">off</button>
              <button :disabled="accessLevel < 1 || item.locked" @click="set_target(item.idx, 'cycle')">cycle</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsProcess
        :address="address"
        :op_data="ops.acq">
      </OcsProcess>

      <OcsTask
        :address="address"
        :op_data="ops.set_outlet">
        <OpParam
          caption="Outlet (1-8)"
          v-model.number="ops.set_outlet.params.outlet" />
        <OpDropdown
          caption="State"
          :options="['on', 'off']"
          v-model="ops.set_outlet.params.state" />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.cycle_outlet">
        <OpParam
          caption="Outlet (1-8)"
          v-model.number="ops.cycle_outlet.params.outlet" />
        <OpParam
          caption="Cycle time"
          v-model.number="ops.cycle_outlet.params.cycle_time" />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.set_initial_state">
      </OcsTask>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ibootbarAgent',
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        connection_ok: false,
        outlet_warning: null,
        outlets: {},
        ops: window.ocs_bundle.web.ops_data_init({
          'acq': {},
          'set_outlet': {params: {state: 'off'}},
          'cycle_outlet': {},
          'set_initial_state': {},
        }),
      }
    },
    props: {
      address: String,
    },
    methods: {
      update_outlet_states(op_name, method, stat, msg, session) {
        if (!this.connection_ok) {
          this.outlets = {};
          this.outlet_warning = 'No connection to agent!';
          return;
        }
        if (!session.data || (session.status != 'running' && session.status != 'starting')) {
          this.outlets = {};
          this.outlet_warning = 'No outlet data -- is acq process running?';
          return;
        }

        if (window.ocs_bundle.util.timestamp_now() - session.data.timestamp > 120) {
          this.outlets = {};
          this.outlet_warning = 'Outlet data are stale -- check acq process?';
          return;
        }

        let new_info = {};
        [0,1,2,3,4,5,6,7].map( idx => {
          let k = 'outletStatus_' + idx;
          if (session.data[k]) {
            new_info[idx] = session.data[k];
            new_info[idx].idx = idx;
          }
        });
        this.outlets = new_info;
        this.outlet_warning = null;
      },
      set_target(idx, state) {
        if (state == 'cycle') {
          this.panel.client.run_task('cycle_outlet', {
            outlet: idx + 1});
        } else {
          this.panel.client.run_task('set_outlet', {
            outlet: idx + 1,
            state: state});
        }
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

    },
    mounted() {
      window.ocs_bundle.web.register_panel(this, this.panel).then(
        client => client.add_watcher('acq', 5., this.update_outlet_states));
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, this.panel.client);
    },
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .ib_row {
    display: grid;
    grid-template-columns: 3fr 2fr 5px 1fr 1fr 1fr ;
  }
  .ib_row > div, button, span {
    font-size: 9pt;
    padding: 10px;
    margin: 2px 0px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ib_header {
    border-bottom: 1px solid black;
    padding: 10px;
  }
  .ib_header > span {
    font-weight: bold;
    padding: 10px 0px;
  }
  .ib_center {
    text-align: center;
  }
  .ib_on {
    background-color: #4e4;
  }
  .ib_off {
    background-color: #f88;
  }
</style>

/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Synaccess Agent <OpLocker /></h1>
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
              >{{ item.description }}</span>
              <span />
              <button :disabled="accessLevel < 1" @click="set_target(item.idx, 'on')">on</button>
              <button :disabled="accessLevel < 1" @click="set_target(item.idx, 'off')">off</button>
              <button :disabled="accessLevel < 1" @click="set_target(item.idx, 'reboot')">reboot</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsProcess
        :address="address"
        :op_data="ops.status_acq">
      </OcsProcess>

      <OcsTask
        :address="address"
        :op_data="ops.set_outlet">
        <OpParam
          caption="Outlet (1-5)"
          v-model.number="ops.set_outlet.params.outlet" />
        <OpDropdown
          caption="State"
          :options="['on', 'off']"
          v-model="ops.set_outlet.params.state" />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.reboot">
        <OpParam
          caption="Outlet (1-5)"
          v-model.number="ops.reboot.params.outlet" />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.set_all">
        <div class="ocs_row">
          <label>Set On</label>
          <input type="checkbox" id="checkbox" v-model="ops.set_all.params.on"
           />
        </div>
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.get_status">
      </OcsTask>

    </div>
  </div>
</template>

<script>
  let ocs_reg = {};

  export default {
    name: 'SynaccessAgent',
    inject: ['accessLevel'],
    data: function () {
      return {
        connection_ok: false,
        outlet_warning: null,
        outlets: {},
        ops: window.ocs_bundle.web.ops_data_init({
          'status_acq': {},
          'set_outlet': {params: {state: 'off'}},
          'get_status': {},
          'set_all': {},
          'reboot': {},
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
        if (!session.data || session.status != 'running') {
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
        for (const [sidx, state] of Object.entries(session.data.fields.synaccess)) {
          let idx = parseInt(sidx);
          new_info[idx] = {
            name: 'outlet' + (idx + 1),
            description: ['off', 'on'][state],
            idx: idx,
          };
        }
        this.outlets = new_info;
        this.outlet_warning = null;
      },
      set_target(idx, state) {
        if (state == 'reboot') {
          ocs_reg.client.run_task('reboot', {
            outlet: idx + 1});
        } else {
          ocs_reg.client.run_task('set_outlet', {
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
              let session = this.ops.status_acq.session;
              return (session.status == 'running' ||
                      session.status == 'starting');
            }
        }
        return false;
      },

    },
    mounted() {
      window.ocs_bundle.web.register_panel(this, null, ocs_reg)
      .then(client =>
        client.add_watcher('status_acq', 5., this.update_outlet_states));
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, ocs_reg.client);
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

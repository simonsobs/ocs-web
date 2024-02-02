<template>
  <AgentPanelBase @clientConnected="startListening()"/>

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Synaccess Agent</OcsAgentHeader>
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

        <h2>Outlets</h2>

        <div v-if="panel.connection_ok">
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
        v-if="acq_op_name && acq_op_name=='acq'"
        :op_data="ops.acq">
      </OcsProcess>

      <OcsProcess
        v-if="acq_op_name && acq_op_name=='status_acq'"
        :op_data="ops.status_acq">
      </OcsProcess>

      <OcsTask
        :op_data="ops.set_outlet">
        <OpParam
          caption="Outlet (1-5)"
          v-model.number="ops.set_outlet.params.outlet" />
        <OpDropdown
          caption="State"
          options_style="object"
          :options="{true: 'on', false: 'off'}"
          v-model.boolean="ops.set_outlet.params.on" />
      </OcsTask>

      <OcsTask
        :op_data="ops.reboot">
        <OpParam
          caption="Outlet (1-5)"
          v-model.number="ops.reboot.params.outlet" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_all">
        <OpDropdown
          caption="State"
          options_style="object"
          :options="{true: 'on', false: 'off'}"
          v-model.boolean="ops.set_all.params.on" />
      </OcsTask>

      <OcsTask
        :op_data="ops.get_status">
      </OcsTask>

    </div>
  </div>
</template>

<script>
  export default {
    name: 'SynaccessAgent',
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        outlet_warning: null,
        outlets: {},
        ops: window.ocs_bundle.web.ops_data_init({
          'status_acq': {}, // socs <= 0.4.5
          'acq': {},        // socs >= 0.4.6 (?)
          'set_outlet': {params: {}},
          'get_status': {},
          'set_all': {},
          'reboot': {},
        }),
        // Transitional ... once we see data from either acq or
        // status_acq, write that here and start ignoring the other one.
        // If it is after Jan 1 2025, you can probably remove this generality!
        acq_op_name: null,
      }
    },
    props: {
      address: String,
    },
    methods: {
      update_outlet_states(op_name, method, stat, msg, session) {
        if (this.acq_op_name && (this.acq_op_name != op_name)) {
          this.panel.client.clear_watchers(op_name);
          return;
        }

        if (!this.panel.connection_ok) {
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

        if (!this.acq_op_name)
          this.acq_op_name = op_name;

        // Process data to look like ibootbar...
        let new_info = {};

        if (op_name == 'status_acq') {
          // Old format
          for (const [sidx, state] of Object.entries(session.data.fields.synaccess)) {
            let idx = parseInt(sidx);
            new_info[idx] = {
              name: 'outlet' + (idx + 1),
              description: ['off', 'on'][state],
              idx: idx,
            };
          }
        } else {
          // New format
          [0,1,2,3,4,5,6,7].map( idx => {
            let v = session.data.fields[idx];
            if (v) {
              new_info[idx] = v;
              new_info[idx].idx = idx;
              new_info[idx].description = ['off', 'on'][v.status];
            }
          });
        }

        this.outlets = new_info;
        this.outlet_warning = null;
      },
      set_target(idx, state) {
        if (state == 'reboot') {
          this.panel.client.run_task('reboot', {
            outlet: idx + 1});
        } else {
          this.panel.client.run_task('set_outlet', {
            outlet: idx + 1,
            on: (state == 'on')});
        }
      },
      getIndicator(name) {
        switch (name) {
          case 'ocs':
            return window.ocs.connection.isConnected;
          case 'acq':
            {
              if (!this.acq_op_name)
                return false
              let session = this.ops[this.acq_op_name].session;
              return (session.status == 'running' ||
                      session.status == 'starting');
            }
        }
        return false;
      },
      startListening() {
        // Subscribe to old and new processes for now.
        this.panel.client.add_watcher('status_acq', 5., this.update_outlet_states);
        this.panel.client.add_watcher('acq', 5., this.update_outlet_states);
      },
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

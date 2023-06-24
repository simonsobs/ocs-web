/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">PysmurfController Agent</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
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
            caption="STATE"
            tip="Indicates that the check_state process appears to be acquiring data properly."
            :value="getIndicator('check_state')"
          />
        </OcsLightLine>

        <h2>Summary</h2>
        <OpReading
          caption="stream_id"
          v-bind:value="stateVar('stream_id')"
        />
        <OpReading
          caption="Streaming?"
          v-bind:value="stateVar('open_g3stream')"
        />
        <OpReading
          caption="Last action"
          v-bind:value="stateVar('pysmurf_action')">
        </OpReading>
        <OpReading
          caption="Started at"
          v-bind:value="stateVar('pysmurf_action_timestamp')">
        </OpReading>
        <OpReading
          caption="tags"
          v-bind:value="stateVar('stream_tag')"
        />

        <h2>Setup and calibration</h2>
        <OpDropdown
          caption="Type"
          :options="op_types"
          v-model="op_control.type"
        />

        <!-- Readout -->
        <form v-on:submit.prevent
              v-if="op_control.type == 'Readout'">

          <OpDropdown
            caption="Band"
            :options="bands"
            v-model="op_control.band"
          />

          <div class="ocs_row">
            <label class="ocs_double">
              Full setup (uxm_setup)
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('uxm_setup')">Start</button>
          </div>
          <div class="ocs_row">
            <label class="ocs_double">
              Relock (uxm_relock)
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('uxm_relock')">Start</button>
          </div>

        </form>

        <!-- Detectors -->
        <form v-on:submit.prevent
              v-if="op_control.type == 'Detectors'">
          <div class="ocs_row">
            <label class="ocs_double">
              Bias Group Map (take_bgmap)
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('take_bgmap')">Start</button>
          </div>
          <div class="ocs_row">
            <label class="ocs_double">
              IV Curve (take_iv)
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('take_iv')">Start</button>
          </div>
          <div class="ocs_row">
            <label class="ocs_double">
              Bias Steps (take_bias_steps)
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('take_bias_steps')">Start</button>
          </div>
          <div class="ocs_row">
            <label class="ocs_double">
              Short Acquisition (take_noise)
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('take_noise')">Start</button>
          </div>
        </form>

        <h2>Stream data</h2>
      <OcsProcess
        :address="address"
        :op_data="ops.stream"
      />


      </div>

    </div>

    <!-- Right block -->
    <div class="block_unit">

      <i>The controls below do not request confirmation before starting!</i>

      <!-- Foreground processes -->
      <OcsProcess
        :address="address"
        :op_data="ops.stream"
      />

      <!-- Background processes -->

      <OcsProcess
        :address="address"
        :op_data="ops.check_state"
      />

      <OcsTask
        :address="address"
        :op_data="ops.uxm_setup"
      >
      </OcsTask>
      <OcsTask
        :address="address"
        :op_data="ops.uxm_relock"
      >
      </OcsTask>
      <OcsTask
        :address="address"
        :op_data="ops.take_bgmap"
      >
      </OcsTask>
      <OcsTask
        :address="address"
        :op_data="ops.take_iv"
      >
      </OcsTask>
      <OcsTask
        :address="address"
        :op_data="ops.take_bias_steps"
      >
      </OcsTask>
      <OcsTask
        :address="address"
        :op_data="ops.take_noise"
      >
        <OpParam
          caption="duration"
          v-model.number="ops.take_noise.params.duration" />
      </OcsTask>

    </div>

  </div>
</template>

<script>
  export default {
    name: 'PysmurfControllerAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        connection_ok: false,
        ops: window.ocs_bundle.web.ops_data_init({
          // tasks
          uxm_setup: {},
          uxm_relock: {},
          take_bgmap: {},
          take_iv: {},
          take_bias_steps: {},
          take_noise: {
            params: {duration: 30}},
          run: {},
          abort: {},

          // processes
          check_state: {},
          stream: {},
        }),
        op_types: ["Readout", "Detectors"],
        bands: ["all", 0, 1, 2, 3, 4, 5, 6, 7],
        op_control: {
          type: "Readout",
          band: "all",
        },
        dataset: {
          view: "all",
          filter: "",
        },
      }
    },
    methods: {
      startOp(op_name) {
        // Assemble parameters
        let params = {};
        switch (op_name) {
          case 'uxm_setup':
          case 'uxm_relock':
            {
              if (this.op_control.band != 'all')
                params.band = [this.op_control.band];
            }
            break;
        }
        
        // Get confirmation, then launch task.
        window.ocs_bundle.ui_confirm(
          `Launch "${op_name}"?`,
          'Are you sure you want to start this Task?',
          () => window.ocs_bundle.ui_run_task(this.address, op_name, params));
      },
      stateVar(key) {
        let data = this.ops.check_state.session.data;
        let value = data[key];
        if (key == "pysmurf_action_timestamp") {
          let delta = window.ocs_bundle.util.timestamp_now() - value;
          let ago = window.ocs_bundle.util.human_timespan(delta);
          value = `${value} (${ago} ago)`;
        }
        return value;
      },
      getIndicator(name) {
        switch (name) {
          case 'ocs':
            return window.ocs.connection.isConnected;
          case 'check_state':
            {
              let session = this.ops.check_state.session;
              return (session.status == 'running' ||
                      session.status == 'starting');
            }
        }
        return false;
      },
    },
    computed: {
    },
    mounted() {
      window.ocs_bundle.web.register_panel(this, this.panel);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, this.panel.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .block_unit h2 {
    padding: 15px 0px 0px 0px;
  }
</style>

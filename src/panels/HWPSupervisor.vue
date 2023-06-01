/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>HWP Supervisor <OpLocker /></h1>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          v-bind:value="address">
        </OpReading>

        <OcsLightLine caption="OCS/Agent">
          <OcsLight
            caption="OCS"
            tip="Status of the connection between ocs-web and OCS crossbar."
            :value="getIndicator('ocs')"
          />
          <OcsLight
            caption="AGT"
            tip="Status of the connection between ocs-web and the Agent."
            :value="getIndicator('agent')"
          />
          <OcsLight
            caption="MON"
            type="multi"
            tip="Will show green/good when 'monitor' process is running and
                     acquiring data normally."
            :value="getIndicator('monitor')"
          />
          <OcsLight
            caption="CTRL"
            type="multi"
            tip="Will show green/good when 'spin_control' process appears to be
                     running normally."
            :value="getIndicator('spin_control')"
          />
        </OcsLightLine>

        </div>

    </div>

    <!-- Right block -->
    <div class="block_unit">


      <!-- Control tasks -->
      <OcsTask
        :address="address"
        :op_data="ops.brake">
        <OpParam
          caption="Freq. tol (Hz)"
          modelType="blank_to_null"
          v-model.number="ops.brake.params.freq_tol"
        />
        <OpParam
          caption="Stable time (s)"
          modelType="blank_to_null"
          v-model.number="ops.brake.params.freq_tol_duration"
        />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.pid_to_freq">
        <OpParam
          caption="Spin rate (Hz)"
          modelType="blank_to_null"
          v-model.number="ops.pid_to_freq.params.target_freq"
        />
        <OpParam
          caption="Freq. tol (Hz)"
          modelType="blank_to_null"
          v-model.number="ops.pid_to_freq.params.freq_tol"
        />
        <OpParam
          caption="Stable time (s)"
          modelType="blank_to_null"
          v-model.number="ops.brake.params.freq_tol_duration"
        />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.pmx_off">
        <OpParam
          caption="Freq. tol (Hz)"
          modelType="blank_to_null"
          v-model.number="ops.pmx_off.params.freq_tol"
        />
        <OpParam
          caption="Stable time (s)"
          modelType="blank_to_null"
          v-model.number="ops.pmx_off.params.freq_tol_duration"
        />
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.set_const_voltage"
      >
        <OpParam
          caption="Voltage (V)"
          v-model.number="ops.set_const_voltage.params.voltage"
        />
        <OpParam
          caption="Direction (cw or ccw)"
          v-model="ops.set_const_voltage.params.direction"
        />
      </OcsTask>
        

      <!-- Background processes -->

      <OcsProcess
        :address="address"
        :op_data="ops.monitor"
      />
      <OcsProcess
        :address="address"
        :op_data="ops.spin_control"
      />

    </div>

  </div>
</template>

<script>
  let ocs_reg = {};

  export default {
    name: 'HWPSupervisor',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        connection_ok: false,
        ops: window.ocs_bundle.web.ops_data_init({
          brake: {},
          pid_to_freq: {},
          pmx_off: {},
          set_const_voltage: {},
          monitor: {},
          spin_control: {},
        }),
      }
    },
    methods: {
      getIndicator(name) {
        let proc_stale_time = 3;  // Seems to be enough

        // If OCS is not connected, nothing else can be reported.
        let now = window.ocs_bundle.util.timestamp_now();
        let ocs_ok = window.ocs.connection.isConnected;
        if (name == 'ocs')
          return ocs_ok;

        if (name == 'agent')
          return this.connection_ok;

        if (!ocs_ok || !this.connection_ok)
          return 'notapplic';

        if (name == 'monitor' || name == 'spin_control') {
          let proc = this.ops[name].session;
          let stale = now - proc.data['timestamp'] > proc_stale_time;
          return (proc.status == 'running' && !stale);
        }
        
        return 'notapplic';
      },
    },
    mounted() {
      window.ocs_bundle.web.register_panel(this, null, ocs_reg);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, ocs_reg.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

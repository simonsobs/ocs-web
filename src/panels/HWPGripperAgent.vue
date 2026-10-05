<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">HWP Gripper</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          v-bind:value="address">
        </OpReading>

        <OcsLightLine caption="OCS/Agent">
          <OcsLight
            caption="OCS"
            tip="Status of the connection between ocs-web and OCS crossbar."
            :value="indicators.ocs"
          />
          <OcsLight
            caption="AGT"
            tip="Status of the connection between ocs-web and the Agent."
            :value="indicators.agent"
          />
          <OcsLight
            caption="STATE"
            type="multi"
            tip="Will show green/good when 'monitor_state' process is running and
                     acquiring data normally."
            :value="indicators.state"
          />
          <OcsLight
            caption="SUPER"
            type="multi"
            tip="Will show green/good when 'monitor_supervisor' process appears to be
                     running normally."
            :value="indicators.supervisor"
          />
        </OcsLightLine>

        <h2>Status</h2>

        <OpReading
          caption="Gripper action"
          :value="statusVars.gripper_action"
        />
        <OpReading
          caption="Shutdown mode"
          :value="statusVars.shutdown_mode"
        />
        <OpReading
          caption="Spin Check Enabled?"
          :value="statusVars.sc_enabled"
        />

      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsProcess
        :op_data="ops.monitor_state"
      />
      <OcsProcess
        :op_data="ops.monitor_supervisor"
      />

      <OcsTask
        :op_data="ops.update_spin_check">
        <OpDropdown
          caption="Enable/disable"
          :options="{'': '', true: 'Enable', false: 'Disable'}"
          options_style="object"
          v-model.boolnull="ops.update_spin_check.params.enable"
        />
        <OpParam
          caption="Disable for (s)"
          modelType="blank_to_null"
          v-model.number="ops.update_spin_check.params.disable_duration"
        />
      </OcsTask>
      
      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'HWPGripperAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          monitor_state: {},
          monitor_supervisor: {},
          grip_hwp: {},
          ungrip_hwp: {},
          update_spin_check: {
            params: {},
          },
        }),
      }
    },
    computed: {
      indicators() {
        let ind = {
          ocs: false,
          agent: false,
          state: 'notapplic',
          supervisor: 'notapplic',
        }

        // If OCS is not connected, nothing else can be reported.
        ind.ocs = window.ocs.connection.isConnected;
        if (!ind.ocs)
          return ind;

        ind.agent = this.panel.connection_ok;
        if (!ind.agent)
          return ind;

        let now = window.ocs_bundle.util.timestamp_now();
        let proc_stale_time = 10;

        // monitor_state
        let proc = this.ops['monitor_state'].session;
        let stale = now - proc.data['last_updated'] > proc_stale_time;
        ind.state = (proc.status == 'running' && !stale);

        // monitor_supervisor
        proc = this.ops['monitor_supervisor'].session;
        stale = now - proc.data['time'] > proc_stale_time;
        ind.supervisor = (proc.status == 'running' && !stale);

        return ind;
      },
      statusVars() {
        let result = {
          gripper_action: '?',
          shutdown_mode: '?',
          sc_enabled: '?',
        };
        let data = this.ops.monitor_supervisor?.session?.data;
        if (!data)
          return result;
        let now = window.ocs_bundle.util.timestamp_now();
        if (now - data.time > 30)
          return result;

        result.gripper_action = data?.gripper_action;
        result.shutdown_mode = data?.shutdown_mode;

        let dt = data.spin_check_disable_until - now;
        let ht = (dt > 0) ? window.ocs_bundle.util.human_timespan(dt): "";
        let text = data.spin_check_enabled ? 'enabled' : 'disabled';
        if (dt > 0)
          text = `disabled for ${ht}, then ${text}`;

        result.sc_enabled = text;
        return result;
      },
    },
  }
</script>

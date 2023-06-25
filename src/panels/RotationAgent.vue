<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">HWP Rotation Agent</OcsAgentHeader>
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
            :value="panel.connection_ok"
          />
          <OcsLight
            caption="KIK"
            tip="Indicates that the kikusui power supply monitoring process appears to be running."
            :value="getIndicator('kik')"
          />
          <OcsLight
            caption="PID"
            tip="Indicates that the PID monitoring process appears to be running."
            :value="getIndicator('pid')"
          />
        </OcsLightLine>

        <h2>PID</h2>

          <OpReading
            caption="PID mode"
            :value="'?'">
          </OpReading>
          <OpReading
            caption="Direction"
            :value="'?'">
          </OpReading>
          <OpReading
            caption="Target Rate"
            :value="'?'">
          </OpReading>

        <form v-on:submit.prevent>
          <div class="ocs_row">
            <label>
              Mode
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('tune_stop')">Stop</button>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('tune_freq')">Rate</button>
          </div>
          <div class="ocs_row">
            <label>
              Direction
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('set_direction', {direction: '0'})">0</button>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('set_direction', {direction: '1'})">1</button>
          </div>
        </form>

        <h2>Power Supply (Kikusui)</h2>

        <form v-on:submit.prevent>
          <div class="ocs_row">
            <label>
              Ext. V. Control
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('ign_ext')">Ignore</button>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('use_ext')">Enable</button>
          </div>
          <div class="ocs_row">
            <label>
              Drive Voltage
            </label>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('set_off')">Off</button>
            <button
              :disabled="accessLevel < 1"
              @click="startOp('set_on')">On</button>
          </div>

          <OpReading
            caption="Current (A)"
            :value="ops.iv_acq.session.data.kikusui_curr">
          </OpReading>
          <OpReading
            caption="Voltage (V)"
            :value="ops.iv_acq.session.data.kikusui_volt">
          </OpReading>

        </form>

      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <!-- OcsProcess
        :op_data="ops.pid_acq"
      / -->

      <OcsTask
        :op_data="ops.declare_freq">
        <OpParam
          caption="Freq (rev/s)"
          v-model.number="ops.declare_freq.params.freq" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_pid">
        <OpParam
          caption="P (0 - 8)"
          v-model.number="ops.set_pid.params.p" />
        <OpParam
          caption="I (0 - 200)"
          v-model.number="ops.set_pid.params.i" />
        <OpParam
          caption="D (0 - 10)"
          v-model.number="ops.set_pid.params.d" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_scale">
        <OpParam
          caption="slope (-10 to 10)"
          v-model.number="ops.set_scale.params.slope" />
        <OpParam
          caption="offset (-10 to 10)"
          v-model.number="ops.set_scale.params.offset" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_direction"
      >
        <OpDropdown
          caption="Direction"
          :options="['0', '1']"
          v-model="ops.set_direction.params.direction" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_v_lim">
        <OpParam
          caption="Voltage"
          v-model.number="ops.set_v_lim.params.v" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_v">
        <OpParam
          caption="Voltage"
          v-model.number="ops.set_v.params.v" />
      </OcsTask>

      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'RotationAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({

          // PID control
          declare_freq: {},
          tune_freq: {auto: true},
          tune_stop: {auto: true},
          set_direction: {},
          set_scale: {},
          set_pid: {},
          get_direction: {auto: true},
          get_freq: {auto: true},

          // Kikusui power supply
          iv_acq: {auto: true},
          ign_ext: {auto: true},
          use_ext: {auto: true},
          set_on: {auto: true},
          set_off: {auto: true},
          set_v: {},
          set_v_lim: {},
          init_connection: {auto: true},
        }),
      }
    },
    methods: {
      startOp(op_name, other_params) {
        // Assemble parameters
        let params = {};
        if (other_params)
          Object.assign(params, other_params);

        // Get confirmation, then launch task.
        window.ocs_bundle.ui_confirm(
          `Launch "${op_name}"?`,
          'Are you sure you want to start this Task?',
          () => window.ocs_bundle.ui_run_task(this.address, op_name, params));
      },
      getIndicator(name) {
        switch (name) {
          case 'ocs':
            return window.ocs.connection.isConnected;
          case 'kik': {
            let session = this.ops.iv_acq.session;
            return (session.status == 'running' ||
                    session.status == 'starting');
          }
          case 'pid':
            // No process for this?
            return false;
        }
        return false;
      },
    },
  }
</script>

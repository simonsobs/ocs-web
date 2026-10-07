<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">HWP Supervisor</OcsAgentHeader>
        <h2>Connection and Shutdown Status</h2>
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
            caption="MON"
            type="multi"
            tip="Will show green/good when 'monitor' process is running and
                     acquiring data normally."
            :value="indicators.monitor"
          />
          <OcsLight
            caption="CTRL"
            type="multi"
            tip="Will show green/good when 'spin_control' process appears to be
                     running normally."
            :value="indicators.spin_control"
          />
        </OcsLightLine>

        <OcsLightLine caption="Data sources">
          <template v-for="item in dataSources" v-bind:key="item.name">
            <OcsLight
              :caption="item.name"
              type="multi"
              tip="Will show green/good when data source is not stale."
              :value="item.ok"
            />
          </template>
        </OcsLightLine>

        <OcsLightLine
          caption="Shutdown Status">
          <OcsLight
            :caption="indicators.shutdown_enabled == 'good' ? 'Armed': 'Disarmed'"
            tip="Is shutdown system armed / enabled?: Green/good: 'enabled'; Yellow/warning: 'disabled'."
            type="multi"
            :value="indicators.shutdown_enabled" />
          <OcsLight
            :caption="indicators.shutdown_mode ? 'Triggered': 'Idle'"
            tip="Shutdown mode active: Green/good: 'idle, no shutdown'; 'Red/bad: 'active, shutdown in progress'."
            type="multi"
            :value="!indicators.shutdown_mode" />
        </OcsLightLine>

        <h2>HWP Summary</h2>

        <OpReading
          caption="Spin Control"
          :value="getMonThing('current_action', '!state_summary', 'spin_control')"
        />

        <OpReading
          caption="PID Summary"
          :value="getMonThing('hwp_state', '!pid_summary')"
        />

        <OpReading
          caption="PMX Summary"
          :value="getMonThing('hwp_state', '!pmx_summary')"
        />

        <OpReading
          caption="Encoder Summary"
          :value="getMonThing('hwp_state', '!encoder_summary')"
        />

        <OpReading
          caption="Quad Summary"
          :value="getMonThing('hwp_state', '!quad_summary')"
        />

        <OpReading
          caption="UPS Summary"
          :value="getMonThing('hwp_state', '!ups_summary')"
        />

        <OpReading
          caption="Cryo Summary"
          :value="getMonThing('hwp_state', '!therm_summary')"
        />

        <OcsLightLine
          caption="Action Messages">
          <OcsLight
            caption="PMX"
            tip="Supervisor system action recommendation: Green/good: 'ok'; Red/bad: 'stop'; Yellow/warning: 'no_data'."
            type="multi"
            :value="indicators.pmx" />
          <OcsLight
            caption="Gripper"
            tip="Supervisor system action recommendation: Green/good: 'ok'; Red/bad: 'stop'; Yellow/warning: 'no_data'."
            type="multi"
            :value="indicators.gripper" />
        </OcsLightLine>

        <h2>Quick Actions</h2>

        <form v-on:submit.prevent>
          <div class="ocs_row">
            <label>Activity<span><div class="light"
                                :class="{idle_light: !taskStatus[0], flash: taskStatus[0]}" /></span></label>
            <div class="ocs_double task_log_box" v-html="taskStatus[1]" />
          </div>
          <div class="ocs_row">
            <label>Stopping</label>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('brake')">Active Brake</button>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('pmx_off')">Power Off</button>
          </div>
          <OpParam
            caption="Set Spin Rate (Hz)"
            v-model.number="this.ops.pid_to_freq.params.target_freq"
            modelType="blank_to_null"
            button="Set"
            :disabled="accessLevel < 1"
            @click-button="quickAction('pid_to_freq')"
          />
          <div class="ocs_row">
            <label>Driver board</label>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('enable_driver_board')">Enable</button>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('disable_driver_board')">Disable</button>
          </div>
          <div class="ocs_row">
            <label>Gripper</label>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('grip_hwp')">Grip</button>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('ungrip_hwp')">Ungrip</button>
          </div>
          <div class="ocs_row">
            <label>Abort Action</label>
            <button
              :disabled="accessLevel < 1"
              @click="quickAction('abort_action')">Abort</button>
          </div>
        </form>
      </div>

    </div>

    <!-- Right block -->
    <div class="block_unit">


      <!-- Control tasks -->
      <OcsTask
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
        
      <OcsTask
        :op_data="ops.enable_driver_board"
      />

      <OcsTask
        :op_data="ops.disable_driver_board"
      />

      <OcsTask
        :op_data="ops.abort_action"
      />

      <OcsTask
        :op_data="ops.cancel_shutdown">
      </OcsTask>

      <OcsTask
        :op_data="ops.update_shutdown">
        <OpDropdown
          caption="Enable/disable"
          :options="{'': '', true: 'Enable', false: 'Disable'}"
          options_style="object"
          v-model.boolnull="ops.update_shutdown.params.enable"
        />
      </OcsTask>

      <!-- Background processes -->

      <OcsProcess
        :op_data="ops.monitor"
      />
      <OcsProcess
        :op_data="ops.spin_control"
      />

      <!-- etc -->
      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'HWPSupervisor',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          brake: {},
          pid_to_freq: {},
          pmx_off: {},
          set_const_voltage: {},
          enable_driver_board: {},
          disable_driver_board: {},
          abort_action: {},
          monitor: {},
          spin_control: {},
          grip_hwp: {},
          ungrip_hwp: {},
          cancel_shutdown: {},
          update_shutdown: {},
        }),
      }
    },
    methods: {
      getMonThing(k1, k2, parent) {
        if (!parent)
          parent = 'monitor';

        let proc = this.ops[parent].session.data;
        if (proc && proc[k1]) {
          switch (k2) {
            case '!state_summary': {
              let now = window.ocs_bundle.util.timestamp_now();
              let action = proc[k1]['cur_state'];
              let oldness = window.ocs_bundle.util.human_timespan(
                now - action.start_time);
              let state_type = action.state_type;
              return 'state=' + state_type + ', for ' + oldness;
            }
            case '!pmx_summary': {
              return proc[k1]['pmx_voltage'] + " V / "
                   + proc[k1]['pmx_current'] + " A / "
                   + proc[k1]['pmx_source'];
            }
            case '!pid_summary': {
              return 'Target ' + proc[k1]['pid_target_freq'] + ' Hz '
                    + '(dir=' + proc[k1]['pid_direction'] + '); '
                   + 'Current ' + proc[k1]['pid_current_freq'] + ' Hz.';
            }
            case '!encoder_summary': {
              let now = window.ocs_bundle.util.timestamp_now();
              let t = proc[k1]['encoder_last_updated'];
              let oldness = t ? window.ocs_bundle.util.human_timespan(
                now - t) : '?';
              let f = proc[k1].enc_freq;
              return (f || f === 0 || f === 0.) ?
                     (f.toFixed(4) + ' Hz, ' + oldness + ' ago') :
                     '?';
            }
            case '!quad_summary': {
              let now = window.ocs_bundle.util.timestamp_now();
              let t = proc[k1]['last_quad_time'];
              let oldness = t ? window.ocs_bundle.util.human_timespan(
                now - t) : '?';
              return 'quad=' + proc[k1]['last_quad']
                   + ', ' + oldness + ' ago';
            }
            case '!ups_summary': {
              return 'On ' + proc[k1]['ups_output_source'] + ' with '
                   + proc[k1]['ups_estimated_minutes_remaining'] + ' mins left.';
            }
            case '!therm_summary': {
              return 'T = ' + proc[k1]['temp'] + 'K (threshold: ' + proc[k1]['temp_thresh'] + ' K)';
            }
            default:
              return proc[k1][k2];
          }
        }
        return null;
      },
      quickAction(name) {
        // Use ui_start_proc, instead of ui_run_task, since these will
        // often run for a long time.
        window.ocs_bundle.ui_start_proc(this.address, name,
                                        this.ops[name].params);
      },
    },
    computed: {
      indicators() {
        let ind = {
          ocs: window.ocs.connection.isConnected,
          agent: this.panel.connection_ok,
          monitor: 'notapplic',
          spin_control: 'notapplic',
          shutdown_enabled: 'notapplic',
          shutdown_triggered: 'notapplic',
          pmx: 'notapplic',
          gripper: 'notapplic',
        }
        let proc_stale_time = 3;  // Seems to be enough

        // If OCS is not connected, nothing else can be reported.
        let now = window.ocs_bundle.util.timestamp_now();
        if (!ind.ocs || !ind.agent)
          return ind;

        for (const name of ['monitor', 'spin_control']) {
          let proc = this.ops[name].session;
          let stale = now - proc.data['timestamp'] > proc_stale_time;
          ind[name] = (proc.status == 'running' && !stale);
        }

        let msg_map = {
          'ok': 'good',
          'stop': 'bad',
          'no_data': 'warning'
        };

        for (const name of ['pmx', 'gripper']) {
          let proc = this.ops.monitor.session.data;
          if (proc && proc.actions)
            ind[name] = msg_map[proc.actions[name]];
        }
        let v = this.ops.monitor.session.data.actions?.shutdown_enabled
        ind.shutdown_enabled = v ? 'good' : 'warning';
        ind.shutdown_triggered = this.ops.monitor.session.data.actions?.shutdown_mode;

        return ind;
      },
      dataSources() {
        let src_stale_time = 10;  // Seems to be enough
        let now = window.ocs_bundle.util.timestamp_now();
        let proc = this.ops.monitor.session.data;
        if (!proc)
          return [];
        let output = [];
        if (proc.monitored_sessions) {
          for (const [k, v] of Object.entries(proc.monitored_sessions)) {
            if (k == 'ups' && !v) {
              // The .ups populates as null ... whatever.
              output.push({name: k, ok: proc.hwp_state?.ups_connected, agent_id: proc.hwp_state?.ups_instance_id});
            } else {
              let _ts = (v?.timestamp ? v.timestamp: 0);
              let stale = (now - _ts) > src_stale_time;
              output.push({name: k, ok: !stale, agent_id: v?.agent_id});
            }
          }
        }

        return output;
      },
      taskStatus() {
        // Record the last few things that happened...
        let events = [];
        let any_running = false;
        for (const [k, v] of Object.entries(this.ops)) {
          if (k == 'monitor' || k == 'spin_control')
            continue;
          let sess = v?.session;
          if (!sess)
            continue;
          let dt = 0;
          let ht = '';
          switch (sess.status) {
            case 'running':
              dt = window.ocs_bundle.util.timestamp_now() - sess.start_time;
              ht = window.ocs_bundle.util.human_timespan(dt);
              events.push({text: k + ' RUNNING, was started ' + ht + ' ago.',
                           active: 1,
                           ago: dt})
              any_running = true;
              break;
            case 'done':
              dt = window.ocs_bundle.util.timestamp_now() - sess.end_time;
              ht = window.ocs_bundle.util.human_timespan(dt);
              events.push({text: k + ' finished [' + (sess?.success ? "ok" : "ERROR") + '] ' + ht + ' ago.',
                           active: 0,
                           ago: dt})
              break;
          }
        }
        // Sort most recent to the top...
        events.sort((a, b) => (a.active != b.active ? -(a.active - b.active) : a.ago - b.ago));
        let text = "";
        for (const [idx, item] of events.entries()) {
          if (idx > 3)
            break;
          let line = "<p>" + (item.active ? "<b>" : "") + item.text + (item.active ? "</b>" : "") + "</p>\n";
          text += line;
        }
        return [any_running, text];
      }
    },
  }
</script>

<style>

/* The activity log box. */

.task_log_box {
  text-indent: 2em hanging;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 10px;

  height: 150px;
  border: 2px solid black;
  border-radius: 4px;
  width: 100%;
}

.task_log_box > p {
  margin-top: 0rem;
}

/* The blinking task light. */

.light {
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background-color: #594; /* input.good color */
  display: inline-block;
  vertical-align: middle;
  margin: 10px;
}

.idle_light {
  border: 2px solid gray;
  background-color: #ffffff;
}

.flash {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

</style>

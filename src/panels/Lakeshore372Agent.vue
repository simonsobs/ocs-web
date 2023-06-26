<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Lakeshore372Agent</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          v-bind:value="address">
        </OpReading>
        <OpReading
          caption="Connection"
          mode="ok"
          v-bind:value="panel.connection_ok">
        </OpReading>
        <div class="ocs_triple data_table box">
          <div class="data_row header data_column ">
            <span>Channel</span><span>T</span><span>R</span><span>age</span>
          </div>
          <div class="data_row"
               v-for="chan in computedChannels"
               v-bind:key="chan[0]">
            <span v-for="d in chan" v-html="d" v-bind:key="d" />
          </div>
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsTask
        :op_data="ops.init_lakeshore">
      </OcsTask>

      <OcsProcess
        :op_data="ops.acq"
      />

      <OcsTask
        :show_start="false"
        :op_data="ops.set_autoscan">
        <div class="ocs_row">
          <label>Autoscan?</label>
          <button
            :disabled="accessLevel < 1"
            @click="set_autoscan(true)">Set on</button>
          <button
            :disabled="accessLevel < 1"
            @click="set_autoscan(false)">Set off</button>
        </div>
      </OcsTask>

      <OcsTask
        :op_data="ops.set_active_channel">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.set_active_channel.params.channel" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_output_mode">
        <OpDropdown
          caption="Heater"
          :options="['sample', 'still']"
          v-model="ops.set_output_mode.params.heater" />
        <OpDropdown
          caption="Mode"
          :options="['Off', 'Monitor Out', 'Open Loop', 'Zone', 'Still', 'Closed Loop', 'Warm up']"
          v-model="ops.set_output_mode.params.mode" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_pid">
        <OpParam
          caption="P (int)"
          v-model.number="ops.set_pid.params.P" />
        <OpParam
          caption="I (int)"
          v-model.number="ops.set_pid.params.I" />
        <OpParam
          caption="D (int)"
          v-model.number="ops.set_pid.params.D" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_heater_range">
        <OpDropdown
          caption="Heater"
          :options="['sample', 'still']"
          v-model="ops.set_heater_range.params.heater" />
        <OpParam
          caption="Range"
          v-model.number="ops.set_heater_range.params.range" />
        <OpParam
          caption="Wait"
          v-model.number="ops.set_heater_range.params.wait" />
      </OcsTask>

      <OcsTask
        :op_data="ops.servo_to_temperature">
        <OpParam
          caption="Temperature (float)"
          v-model.number="ops.servo_to_temperature.params.temperature" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_heater_output">
        <OpDropdown
          caption="Heater"
          :options="['sample', 'still']"
          v-model="ops.set_heater_output.params.heater" />
        <OpParam
          caption="Output"
          v-model.number="ops.set_heater_output.params.output" />
        <OpDropdown
          caption="Display"
          :options="['current', 'power']"
          v-model="ops.set_heater_output.params.display" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_resistance_range">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.set_resistance_range.params.channel" />
        <OpParam
          caption="Range (Ohms)"
          v-model.number="ops.set_resistance_range.params.output" />
      </OcsTask>

      ----
      <OcsTask
        :op_data="ops.get_dwell">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.get_dwell.params.channel" />
        <OpReading
          caption="Dwell time (s)"
          :value="ops.get_dwell.session.data.dwell_time">
        </OpReading>
      </OcsTask>

      <OcsTask
        :op_data="ops.get_excitation">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.get_excitation.params.channel" />
        <OpReading
          caption="Excitation value"
          :value="ops.get_excitation.session.data.excitation">
        </OpReading>
        <OpReading
          caption="Mode (units)"
          :value="ops.get_excitation.session.data.mode">
        </OpReading>
      </OcsTask>

      <OcsTask
        :op_data="ops.get_resistance_range">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.get_resistance_range.params.channel" />
        <OpReading
          caption="Resistance Range (ohms)"
          :value="ops.get_resistance_range.session.data.resistance_range">
        </OpReading>
      </OcsTask>

      <OcsTask
        :op_data="ops.get_still_output">
        <OpReading
          caption="Still Output (%)"
          :value="ops.get_still_output.session.data.still_heater_still_out">
        </OpReading>
      </OcsTask>

      <OcsTask
        :op_data="ops.set_excitation">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.set_excitation.params.channel" />
        <OpParam
          caption="Value (float)"
          v-model.number="ops.set_excitation.params.value" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_excitation_mode">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.set_excitation_mode.params.channel" />
        <OpDropdown
          caption="Display"
          :options="['current', 'voltage']"
          v-model="ops.set_excitation_mode.params.display" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_heater_range">
        <OpDropdown
          caption="Heater"
          :options="['sample', 'still']"
          v-model="ops.set_heater_range.params.heater" />
        <OpParam
          caption="Range"
          v-model.number="ops.set_heater_range.params.range" />
        <OpParam
          caption="Wait"
          v-model.number="ops.set_heater_range.params.wait" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_still_output">
        <OpParam
          caption="Output (%)"
          v-model.number="ops.set_still_output.params.output" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_dwell">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.set_dwell.params.channel" />
        <OpParam
          caption="Dwell (1-200)"
          v-model.number="ops.set_dwell.params.dwell" />
      </OcsTask>

      <OcsTask
        :op_data="ops.enable_control_chan"
        op_name="enable_control_chan/disable_control_chan"
        :show_start="false">
        <div class="ocs_row">
          <label>Control channel</label>
          <button
            :disabled="accessLevel < 1"
            @click="set_control_chan(true)">Enable</button>
          <button
            :disabled="accessLevel < 1"
            @click="set_control_chan(false)">Disable</button>
        </div>
      </OcsTask>

      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'Lakeshore372Agent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        extension: 5,
        precision: 3,
        ops: window.ocs_bundle.web.ops_data_init({
          init_lakeshore: {},
          set_active_channel: {
            params: {
              channel: 1,
            }
          },
          set_autoscan: {
            params: {
              autoscan: true,
            },
          },
          acq: {},
          get_dwell: {},
          get_resistance_range: {},
          get_excitation: {},
          get_still_output: {},
          servo_to_temperature: {},
          set_excitation: {},
          set_excitation_mode: {},
          set_resistance_range: {},
          set_heater_output: {heater: 'sample',
                              output: 0.0,
                              display: 'current'},
          set_heater_range: {heater: 'sample',
                             range: 0.0,
                             wait: 0},
          set_output_mode: {},
          set_dwell: {},
          set_pid: {},
          set_still_output: {},
          // Note enable/disable_control_chan handled in single widget.
          enable_control_chan: {},
          disable_control_chan: {},
        }),
      }
    },
    computed: {
      computedChannels() {
        // Set this.channel_data to any recent measurements.
        let stale = 500;
        let new_data = [];
        let fields = this.ops.acq.session.data.fields;
        let now = window.ocs_bundle.util.timestamp_now();
        if (fields) {
          Object.keys(fields).forEach((name) => {
            let dt = now - fields[name].timestamp;
            if (dt < stale) {
              let T = window.ocs_bundle.util.pad_decimal(
                fields[name].T.toFixed(this.precision), this.extension);
              let R = window.ocs_bundle.util.pad_decimal(
                fields[name].R.toFixed(this.precision), this.extension);
              let oldness = window.ocs_bundle.util.pad_decimal(
                window.ocs_bundle.util.human_timespan(dt), 4);
              new_data.push([name, T, R, oldness]);
            }
          });
        }
        return new_data;
      },
    },
    methods: {
      set_autoscan(on) {
        window.ocs_bundle.ui_run_task(this.address, 'set_autoscan', {autoscan: on});
      },
      set_control_chan(on) {
        let task = {true: 'enable', false: 'disable'}[on] + '_control_chan';
        window.ocs_bundle.ui_run_task(this.address, task, {});
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .header > span {
    font-weight: bold;
  }
  .data_row > span {
    text-align: center;
  }
  .data_table > div {
    display: grid;
    grid-template-columns: 35% 2fr 2fr 2fr;
    grid-gap: 5px;
  }
  .data_table > div:nth-child(odd) {
    background-color: #f8f;
  }
  .data_table > div:nth-child(even) {
    background-color: #fdf;
  }
  .data_table > div:first-child {
    background-color: #fff;
  }
</style>

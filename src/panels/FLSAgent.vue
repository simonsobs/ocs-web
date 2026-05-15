<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">
    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader>FLS Agent</OcsAgentHeader>
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
      </div>

      <div class="box">
        <div v-for="item in statusVars" v-bind:key="item.name">
          <OpReading
            :caption="item.name"
            v-bind:value="item.value"
          />
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsTask
        :op_data="ops.initialize" />

      <OcsTask
        :op_data="ops.set_bias">
        <OpDropdown
          caption="Bias"
          :options="['default', 'zero']"
          v-model.number="ops.set_bias.params.bias" />
      </OcsTask>

      <OcsTask
        :show_abort="true"
        :op_data="ops.toggle_laser_power">
        <OpDropdown
          caption="State"
          :options="['on', 'off']"
          v-model.number="ops.toggle_laser_power.params.state" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_frequency">
        <OpParam
          caption="Frequency (GHz)"
          v-model.number="ops.set_frequency.params.frequency" />
      </OcsTask>

      <OcsTask
        :op_data="ops.set_integration_time">
        <OpParam
          caption="Integration time (ms)"
          v-model.number="ops.set_integration_time.params.integration_time" />
      </OcsTask>

      <OcsTask
        :op_data="ops.run_frequency_sweeps">
        <OpParam
          caption="Min freq. (GHz)"
          v-model.number="ops.run_frequency_sweeps.params.min_frequency" />
        <OpParam
          caption="Max freq. (GHz)"
          v-model.number="ops.run_frequency_sweeps.params.max_frequency" />
        <OpDropdown
          caption="Start Direction"
          :options="[1, -1]"
          v-model.number="ops.run_frequency_sweeps.params.start_direction" />
        <OpParam
          caption="Frequency Step"
          v-model.number="ops.run_frequency_sweeps.params.frequency_step" />
        <OpParam
          caption="Integration time (ms)"
          v-model.number="ops.run_frequency_sweeps.params.int_time" />
      </OcsTask>

      <OcsTask
        :op_data="ops.stop_frequency_sweep" />

      <OcsProcess
        :op_data="ops.acq"
      />

      <OcsOpAutofill
        :ops_parent="ops"
      />
    </div>

  </div>
</template>

<script>
  export default {
    name: 'FLSAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        ops: window.ocs_bundle.web.ops_data_init({
          initialize: {},
          run_frequency_sweeps: {
            params: {min_frequency: 0,
                     max_frequency: 0,
                     start_direction: 1,
                     frequency_step: null,
                     int_time: null,},
          },
          set_bias: {
            params: {bias: 'zero'},
          },
          set_frequency: {
            params: {frequency: null},
          },
          set_integration_time: {
            params: {integration_time: null},
          },
          stop_frequency_sweep: {
          },
          toggle_laser_power: {
            params: {state: null},
          },
          acq: {
          },
        }),
        panel: {},
      }
    },
    computed: {
      statusVars() {
        let sdata = this.ops.acq.session.data;
        let annotated = [];
        if (!sdata)
          return annotated;
        for (const [key, value] of Object.entries(sdata)) {
          annotated.push({name: key, value: value});
        }
        return annotated;
      },
    },      
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

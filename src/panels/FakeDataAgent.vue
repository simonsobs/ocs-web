<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">
    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader>Fake Data Agent</OcsAgentHeader>
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
        <OpParam
          caption="Delay Requested"
          :modelDisabled="true"
          v-model="delayRequested">
        </OpParam>
        <OpParam
          caption="Delay So Far"
          :modelDisabled="true"
          v-model="delaySoFar">
        </OpParam>
        <div class="ocs_row">
          <label>Progress</label>
          <ProgressBar
            class="ocs_double"
            :label="(progressFrac*100).toFixed(1) + '%'"
            :frac="progressFrac" />
        </div>
        <OpReading
          caption="Acq Status"
          :value="ops.acq.session.status">
        </OpReading>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsTask
        :show_abort="true"
        :op_data="ops.delay_task">
        <OpParam
          caption="Delay (s)"
          v-model.number="ops.delay_task.params.delay" />
        <OpSelect
          caption="Suggestions"
          v-bind:options="options"
          v-model.number="ops.delay_task.params.delay" />
      </OcsTask>

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
    name: 'FakeData',
    props: {
      address: String,
    },
    data: function () {
      return {
        ops: window.ocs_bundle.web.ops_data_init({
          delay_task: {
            params: {delay: 10},
          },
          acq: {},
        }),
        options: [10, 20, 30],
        panel: {},
      }
    },
    computed: {
      delayRequested() {
        let x = this.ops.delay_task.session.data.requested_delay;
        if (x)
          return x.toFixed(3);
        return '?';
      },
      delaySoFar() {
        let x = this.ops.delay_task.session.data.delay_so_far;
        if (x)
          return x.toFixed(3);
        return '?';
      },
      progressFrac() {
        let data = this.ops.delay_task.session.data;
        if (data.requested_delay) {
          return Math.min(1, data.delay_so_far / data.requested_delay);
        }
        return 0;
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

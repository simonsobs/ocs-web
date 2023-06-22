/* eslint-disable */
<template>
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
          v-bind:value="connection_ok">
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
          :value="ops.acq.status">
        </OpReading>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsTask
        :panel="panel"
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
        :panel="panel"
        :op_data="ops.acq"
      />

      <OcsOpAutofill
        :panel="panel"
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
        connection_ok: false,
        ops: window.ocs_bundle.web.ops_data_init({
          delay_task: {
            params: {delay: 10},
          },
          acq: {},
          //count: {auto:true},
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
    mounted() {
      this.panel.client_promise = window.ocs_bundle.web.register_panel(this, this.panel);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, this.panel.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

/* eslint-disable */
<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Aggregator Agent</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          :value="address">
        </OpReading>
        <OcsLightLine
          caption="Status">
          <OcsLight
            caption="Connected"
            tip="Indicates whether Agent is connected."
            :value="panel.connection_ok" />
          <OcsLight
            caption="Recording"
            tip="Indicates whether data acquisition process is running."
            :value="ops.record.session.status == 'running'" />
        </OcsLightLine>
        <OpReading
          caption="current_file"
          :value="current_file(1)"
        />
        <OpReading
          caption="full_path (copyable)"
          :value="current_file(-1)"
        />
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsProcess
        :op_data="ops.record">
      </OcsProcess>

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
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          record: {}
        }),
      }
    },
    methods: {
      current_file(n) {
        let op = this.ops.record;
        let cf = op.session.data.current_file;
        if (!cf || op.session.status != 'running')
          return '';
        if (n <= 0)
          return cf;
        return cf.split('/').reverse()[0];
      },
    },
  }
</script>

<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Crate Agent</OcsAgentHeader>
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
            :value="ops.acq.session.status == 'running'" />
        </OcsLightLine>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsTask
        :op_data="ops.activate_slot">
        <OpParam
          caption="slot [1-7]"
          v-model.number="ops.activate_slot.params.slot" />
      </OcsTask>

      <OcsTask
        :op_data="ops.deactivate_slot">
        <OpParam
          caption="slot [1-7]"
          v-model.number="ops.deactivate_slot.params.slot" />
      </OcsTask>

      <OcsProcess
        :op_data="ops.acq" />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'CrateAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          acq: {},
          activate_slot: {
            slot: null
          },
          deactivate_slot: {
            slot: null
          },
        }),
      }
    },
  }
</script>

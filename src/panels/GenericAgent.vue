<!--

GenericAgent

This component is activated when a specialized panel does not exist
for a particular agent class.  It displays the agent address and
connection status, and then provides generic (parameter-free) controls
for all tasks and processes detected in the agent.

This code can be used as a template / starting point for implementing
specialized agent panels.

-->
<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader>Generic Control Panel</OcsAgentHeader>
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
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsOpAutofill
        :ops_parent="ops"
      />
    </div>

  </div>
</template>

<script>
  export default {
    name: 'GenericAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        panel: {},
        ops: {},
      }
    },
  }
</script>

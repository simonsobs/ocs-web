/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Generic Control Panel</OcsAgentHeader>
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
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <OcsOpAutofill
        :address="address"
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
        connection_ok: false,
        ops: {},
      }
    },
    mounted() {
      window.ocs_bundle.web.register_panel(this, this.panel);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, this.panel.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

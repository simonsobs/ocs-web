/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Generic Control Panel <OpLocker /></h1>
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
  let ocs_reg = {};

  export default {
    name: 'GenericAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        connection_ok: false,
        ops: {},
      }
    },
    mounted() {
      window.ocs_bundle.web.register_panel(this, ocs_reg);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, ocs_reg.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

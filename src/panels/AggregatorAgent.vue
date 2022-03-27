/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Aggregator Agent <OpLocker /></h1>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          :value="address">
        </OpReading>
        <OpReading
          caption="Connection"
          mode="ok"
          :value="connection_ok">
        </OpReading>
        <OpReading
          caption="Recording"
          mode="ok"
          :value="ops.record.session.status == 'running'">
        </OpReading>
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
        :address="address"
        :op_data="ops.record">
      </OcsProcess>

    </div>

  </div>
</template>

<script>
  let ocs_reg = {};

  export default {
    name: 'FakeData',
    props: {
      address: String,
    },
    data: function () {
      return {
        connection_ok: false,
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
    mounted() {
      window.ocs_bundle.web.register_panel(this, null, ocs_reg);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, ocs_reg.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

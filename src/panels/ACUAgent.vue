/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>ACU Agent</h1>
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

        <h2>Position</h2>
        <OpParam
          caption="Azimuth"
          :modelDisabled="true"
          v-model="currentAz">
        </OpParam>
        <OpParam
          caption="Elevation"
          :modelDisabled="true"
          v-model="currentEl">
        </OpParam>
        <OpParam
          caption="Boresight"
          :modelDisabled="true"
          v-model="currentBoresight">
        </OpParam>

      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <!-- go_to -->
      <OcsTask
        :address="address"
        :op_data="ops.go_to">
        <OpParam
          caption="Az (deg)"
          v-model.number="ops.go_to.params.az" />
        <OpParam
          caption="El (deg)"
          v-model.number="ops.go_to.params.el" />
        <div class="ocs_row">
          <label>Set mode=Stop at end?</label>
          <input type="checkbox" id="checkbox" v-model="ops.go_to.params.end_stop"
           class="ocs_double" />
        </div>
      </OcsTask>

      <!-- set_boresight -->
      <OcsTask
        :address="address"
        :op_data="ops.set_boresight">
        <OpParam
          caption="Angle (deg)"
          v-model.number="ops.set_boresight.params.b" />
        <div class="ocs_row">
          <label>Set mode=Stop at end?</label>
          <input type="checkbox" id="checkbox" v-model="ops.set_boresight.params.end_stop"
           class="ocs_double" />
        </div>
      </OcsTask>

      <OcsTask
        :address="address"
        :op_data="ops.stop_and_clear">
      </OcsTask>

      <!-- Processes -->

      <OcsProcess
        :address="address"
        :op_data="ops.monitor"
      />
      <OcsProcess
        :address="address"
        :op_data="ops.broadcast"
      />
      <OcsProcess
        :address="address"
        :op_data="ops.generate_scan"
      />

    </div>

  </div>
</template>

<script>
  let ocs_reg = {};

  export default {
    name: 'ACUAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        connection_ok: false,
        ops: window.ocs_bundle.web.ops_data_init({
          go_to: {
            params: {az: 180,
                     el: 60,
                     wait: 1,
                     end_stop: true,
            },
          },
          set_boresight: {
            params: {b: 0},
          },
          stop_and_clear: {
            params: {},
          },
          monitor: {
            params: {},
          },
          broadcast: {
            params: {},
          },
          generate_scan: {            params: {},
},
        }),
      }
    },
    methods: {
      currentSomething(prefix) {
        let data = this.ops.monitor.session.data;
        if (!data)
          return '?';
        let mode = data[prefix + ' mode'];
        let pos = Number(data[prefix + ' current position']);
        return (window.ocs_bundle.util.pad_decimal(pos.toFixed(4), 3, ' ') +
                ' [' + mode + ']');
      },
    },
    computed: {
      currentAz() {
        return this.currentSomething('Azimuth');
      },
      currentEl() {
        return this.currentSomething('Elevation');
      },
      currentBoresight() {
        return this.currentSomething('Boresight');
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

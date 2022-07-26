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
        <OpReading
          caption="Azimuth"
          v-bind:value="currentPosAndMode('Azimuth')">
        </OpReading>
        <OpReading
          caption="Elevation"
          v-bind:value="currentPosAndMode('Elevation')">
        </OpReading>
        <OpReading
          caption="Boresight"
          v-bind:value="currentPosAndMode('Boresight')">
        </OpReading>

        <h2>Scan control</h2>
        <OpDropdown
          caption="Type"
          :options="scan_types"
          v-model="scan_control.type"
        />
        <form v-on:submit.prevent
              v-if="scan_control.type == 'Constant el'">
          <OpParam
            caption="Azimuth center"
            v-model.number="scan_control.az_center"
          />
          <OpParam
            v-if="scan_control.type == 'Constant el'"
            caption="Azimuth throw"
            v-model.number="scan_control.az_throw"
          />
          <div class="ocs_row">
            <label />
            <button
              @click="startScan">Start</button>
            <button
              @click="stopScan">Stop</button>
          </div>
        </form>

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

      <OcsProcess
        :address="address"
        :op_data="ops.generate_scan">
        <OpParam
          caption="az1"
          v-model.number="ops.generate_scan.params.az_endpoint1" />
        <OpParam
          caption="az2"
          v-model.number="ops.generate_scan.params.az_endpoint2" />
        <OpParam
          caption="el1"
          v-model.number="ops.generate_scan.params.el_endpoint1" />
        <OpParam
          caption="el2"
          v-model.number="ops.generate_scan.params.el_endpoint2" />
        <OpParam
          caption="az_speed"
          v-model.number="ops.generate_scan.params.az_speed" />
        <OpParam
          caption="el_speed"
          v-model.number="ops.generate_scan.params.el_speed" />
        <OpParam
          caption="az_acc"
          v-model.number="ops.generate_scan.params.acc" />
      </OcsProcess>

      <!-- Background processes -->

      <OcsProcess
        :address="address"
        :op_data="ops.monitor"
      />
      <OcsProcess
        :address="address"
        :op_data="ops.broadcast"
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
          generate_scan: {
            params: {
              az_endpoint1: 170,
              az_endpoint2: 190,
              az_speed: 1,
              acc: 1,
              el_endpoint1: 60,
              el_endpoint2: 60,
              el_speed: 1,
            },
          },
          monitor: {
            params: {},
          },
          broadcast: {
            params: {},
          },
        }),
        scan_types: ["Constant el"],
        scan_control: {
          type: "Constant el",
          az_center: 180,
          az_throw: 10,
        },
      }
    },
    methods: {
      startScan() {
        // Called from the special scan_control widget.
        let p = this.scan_control;
        if (p.type == "Constant el") {
          // Update the parameters of the generate_scan process.
          let gs = this.ops.generate_scan.params;
          gs['az_endpoint1'] = p.az_center - p.az_throw;
          gs['az_endpoint2'] = p.az_center + p.az_throw;

          let pos = this.currentPositions();
          gs['el_endpoint1'] = pos['el'];
          gs['el_endpoint2'] = pos['el'];

          window.ocs_bundle.ui_start_proc(this.address, 'generate_scan',
                                          this.ops.generate_scan.params);
        }
      },
      stopScan() {
        window.ocs_bundle.ui_run_task(this.address, 'stop_and_clear', {});
      },
      currentPositions() {
        let data = this.ops.monitor.session.data;
        return {
          'az': data['Azimuth current position'],
          'el': data['Elevation current position'],
          'boresight': data['Boresight current position'],
        };
      },
      currentPosAndMode(prefix) {
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

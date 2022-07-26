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

        <h2>Dataset</h2>

        <div class="acu_dataset">
          <form v-on:submit.prevent>
            <select v-model="dataset.view" class="dataset_filter">
              <option value="all" default>Show all</option>
              <option value="nonnom">Show non-nominal readings</option>
              <option value="az-only">Show Azimuth</option>
              <option value="el-only">Show Elevation</option>
              <option value="bore-only">Show Boresight</option>
              <option value="other-only">Show Other</option>
              <option value="nothing" default>Show nothing</option>
            </select>
          </form>

          <div class="acu_row acu_header">
            <span class="acu_value">Value</span>
            <span class="acu_label">Field</span>
          </div>
          <div v-for="item in statusVars" v-bind:key="item.name">
            <div v-if="dataset.view=='all' || dataset.view=='nonnom' && (item.classObj.isPassive || item.classObj.isBad || item.classObj.isActive) || dataset.view==item.props.specialization" class="acu_row">
              <span class="acu_value"
                    v-bind:class="item.classObj"
              >{{ item.value }}</span>
              <span class="acu_label">{{ item.name }}</span>
            </div>
          </div>
        </div>
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
        dataset: {
          view: "all",
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
      statusVars() {
        let data = this.ops.monitor.session.data;
        let annotated = [];
        if (!data)
          return annotated;
        for (const [key, value] of Object.entries(data)) {
          let d = {
            name: key,
            value: value,
            props: {
              type: 'passive',
              inverted: false,
              specialization: 'other-only',
            },
          };

          if (key.includes('Azimuth'))
            d.props.specialization = 'az-only';
          if (key.includes('Elevation'))
            d.props.specialization = 'el-only';
          if (key.includes('Boresight'))
            d.props.specialization = 'bore-only';

          let test_val = value;
          if (test_val === true || test_val === false)
            d.props.type = 'error';

          switch(key) {
            case 'Azimuth brakes released':
            case 'Elevation brakes released':
            case 'Boresight brakes released':
              d.props.type = 'indicator';
              break;

            case 'Azimuth current velocity':
            case 'Elevation current velocity':
            case 'Boresight current velocity':
            case 'Azimuth average position error':
            case 'Elevation average position error':
            case 'Boresight average position error':
            case 'Azimuth peak position error':
            case 'Elevation peak position error':
            case 'Boresight peak position error':
              d.props.type = 'indicator';
              test_val = (test_val != 0);
              break;

            case 'Qty of free program track stack positions':
              d.props.type = 'indicator';
              test_val = (test_val != 9999);
              break;

            case 'Azimuth mode':
            case 'Elevation mode':
            case 'Boresight mode':
              d.props.type = 'indicator';
              test_val = (test_val != 'Stop')
              break;

            case 'Azimuth axis in stop':
            case 'Azimuth power on':
            case 'Elevation axis in stop':
            case 'Elevation power on':
            case 'Boresight axis in stop':
            case 'Boresight power on':
            case 'ACU in remote mode':
              d.props.type = 'indicator';
              d.props.inverted = true;
              break;
          }

          let x = test_val ^ d.props.inverted;
          switch (d.props.type) {
            case 'error':
              d.classObj = { isNormal: !x, isBad: x };
              break;
            case 'indicator':
              d.classObj = { isNormal: !x, isActive: x };
              break;
            default:
              d.classObj = { isPassive: true};
          }

          annotated.push(d);
        }
        return annotated;
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
  .acu_dataset > div:nth-child(3n+1) {
    background-color: #fff;
  }
  .acu_dataset > div:nth-child(3n+3) {
    background-color: #f0f0f0;
  }
  .acu_dataset > div:nth-child(3n+2) {
    background-color: #f8f8f8;
  }
  .acu_row {
    display: grid;
    grid-template-columns: 1fr 4fr ;
  }
  .acu_row > div, button, span {
    font-size: 11pt;
    padding: 5px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .acu_header {
    border-bottom: 1px solid black;
  }
  .acu_header > span {
    font-weight: bold;
    padding: 10px 0px;
  }
  .acu_value {
    text-align: center;
  }
  .acu_label {
    text-align: left;
  }

  .dataset_filter {
    width: 100%;
  }

  /* Classes for rows in the Dataset table:
   * - isNormal: no error / idle.
   * - isBad: error.
   * - isActive: not idle but not an error.
   * - isPassive: otherwise unclassifiable.
   */

  .isNormal {
    background-color: #32cd32;
  }
  .isBad {
    background-color: #ff8888;
  }
  .isActive {
    background-color: #8888ff;
  }
  .isPassive {
    background-color: #ccccff;
  }

</style>

/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>ACU Agent <OpLocker /></h1>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          v-bind:value="address">
        </OpReading>

        <OcsLightLine caption="OCS/Agent">
          <OcsLight
            caption="OCS"
            tip="Status of the connection between ocs-web and OCS crossbar."
            :value="getIndicator('ocs')"
          />
          <OcsLight
            caption="AGT"
            tip="Status of the connection between ocs-web and the Agent."
            :value="getIndicator('agent')"
          />
          <OcsLight
            caption="MON"
            type="multi"
            tip="Will show green/good when 'monitor' process is running and
                     acquiring data normally. The health of this process is required
                     for numerous other indicators."
            :value="getIndicator('monitor')"
          />
          <OcsLight
            caption="BCAST"
            type="multi"
            tip="Will show green/good when 'broadcast' process appears to be
                     running and acquiring data normally."
            :value="getIndicator('broadcast')"
          />
        </OcsLightLine>

        <OcsLightLine caption="ACU/Platform">
          <OcsLight
            caption="UNLOCKED"
            type="multi"
            tip="Will show green/good when remote control is not locked out (Safe)."
            :value="getIndicator('safe')"
          />
          <OcsLight
            caption="REMOTE"
            type="multi"
            tip="Will show green/good when ACU is in Remote (rather than Local) control mode."
            :value="getIndicator('remote')"
          />
          <OcsLight
            caption="READY"
            type="multi"
            tip="Will show green/good unless ACU expresses a General summary fault."
            :value="getIndicator('summary')"
          />
        </OcsLightLine>

        <h2>Pointing</h2>
        <OpReading
          caption="Activity"
          v-bind:value="currentMotion" />
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
        <OpReading
          caption="Co-rotator"
          v-bind:value="currentPosAndMode('Corotator')">
        </OpReading>
        <OpReading
          caption="Timestamp"
          v-bind:value="currentPosAndMode('Timestamp')">
        </OpReading>

        <h2>Motion Control</h2>
        <OpDropdown
          caption="Type"
          :options="motion_types"
          options_style="object"
          v-model="motion_control.type"
        />
        <form v-on:submit.prevent
              v-if="motion_control.type == 'const_el'">
          <OpParam
            caption="Azimuth center"
            v-model.number="motion_control.az_center"
          />
          <OpParam
            caption="Azimuth throw"
            v-model.number="motion_control.az_throw"
          />
          <OpParam
            caption="Scan speed"
            v-model.number="motion_control.az_speed"
          />
          <OpParam
            caption="Mean accel"
            v-model.number="motion_control.az_accel"
          />
          <div class="ocs_row">
            <label />
            <button
              :disabled="accessLevel < 1"
              @click="startMotion">Start</button>
            <button
              :disabled="accessLevel < 1"
              @click="stopMotion">Stop</button>
          </div>
        </form>

        <form v-on:submit.prevent
              v-if="motion_control.type == 'goto'">
          <OpParam
            caption="Azimuth"
            v-model.number="motion_control.goto_az"
          />
          <OpParam
            caption="Elevation"
            v-model.number="motion_control.goto_el"
          />
          <div class="ocs_row">
            <label />
            <button
              :disabled="accessLevel < 1"
              @click="startMotion">Start</button>
            <button
              :disabled="accessLevel < 1"
              @click="stopMotion">Abort</button>
          </div>
        </form>

        <h2>Dataset</h2>

          <form v-on:submit.prevent>
            <div class="acu_row">
              <span>Group</span>
              <span>
                <select v-model="dataset.view" class="dataset_filter">
                  <option value="all" default>Show all</option>
                  <option value="nonnom">Show non-nominal readings</option>
                  <option value="az-only">Show Azimuth</option>
                  <option value="el-only">Show Elevation</option>
                  <option value="bore-only">Show Boresight</option>
                  <option value="other-only">Show Other</option>
                  <option value="nothing" default>Show nothing</option>
                </select>
              </span>
            </div>
            <div class="acu_row">
              <span>Filter</span>
              <span><input type="text"
                           class="acu_double"
                           v-model="dataset.filter"
                    /></span>
            </div>
          </form>

          <div id="dataset_table">
            <div class="acu_row acu_header">
              <span class="acu_value">Value</span>
              <span class="acu_label">Field</span>
            </div>
            <div v-for="item in statusVars" v-bind:key="item.name">
              <div v-if="(dataset.view=='all' || dataset.view=='nonnom' && (item.classObj.isBad || item.classObj.isActive) || dataset.view==item.props.specialization) && (dataset.filter == '' || item.name.trim().toLowerCase().includes(dataset.filter.trim().toLowerCase()))" class="acu_row">
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
        :show_abort="true"
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
        :show_abort="true"
        :op_data="ops.set_boresight">
        <OpParam
          caption="Angle (deg)"
          v-model.number="ops.set_boresight.params.target" />
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
        <OpDropdown
          caption="az start"
          :options="start_types"
          v-model="ops.generate_scan.params.az_start"
        />
        <OpParam
          caption="el1"
          v-model.number="ops.generate_scan.params.el_endpoint1" />
        <OpParam
          caption="el2"
          v-model.number="ops.generate_scan.params.el_endpoint2" />
        <OpParam
          caption="az_speed"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.az_speed" />
        <OpParam
          caption="el_speed"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.el_speed" />
        <OpParam
          caption="az_accel"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.az_accel" />
        <OpParam
          caption="num_scans"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.num_scans" />
        <OpParam
          caption="wait_to_start"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.wait_to_start" />
        <OpParam
          caption="step_time"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.step_time" />
      </OcsProcess>

      <!-- Background processes -->

      <OcsTask
        :address="address"
        :op_data="ops.clear_faults"
      />

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
        :op_data="ops.restart_idle"
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
    inject: ['accessLevel'],
    data: function () {
      return {
        connection_ok: false,
        ops: window.ocs_bundle.web.ops_data_init({
          go_to: {
            params: {az: 180,
                     el: 60,
                     end_stop: true,
            },
          },
          set_boresight: {
            params: {target: 0},
          },
          stop_and_clear: {
            params: {},
          },
          generate_scan: {
            params: {
              az_endpoint1: 170,
              az_endpoint2: 190,
              az_speed: 1,
              az_accel: 1,
              el_endpoint1: 60,
              el_endpoint2: 60,
              el_speed: 1,
              az_start: 'end',
              num_scans: null,
              step_time: null,
              wait_to_start: null,
            },
          },
          monitor: {
            params: {},
          },
          broadcast: {
            params: {},
          },
          restart_idle: {},
          clear_faults: {},
        }),
        motion_types: {
          const_el: "Constant el scan",
          goto: "Go to position",
        },
        motion_control: {
          type: "const_el",

          az_center: 180,
          az_throw: 10,
          az_speed: 1,
          az_accel: 1,

          goto_az: 180,
          goto_el: 60,
        },
        start_types: ["end", "mid"],
        dataset: {
          view: "all",
          filter: "",
        },
      }
    },
    methods: {
      startMotion() {
        // Called from the special motion_control widget.
        let p = this.motion_control;
        switch(p.type) {
          case "const_el": {
            // Update the parameters of the generate_scan process.
            let gs = this.ops.generate_scan.params;
            gs['az_endpoint1'] = p.az_center - p.az_throw;
            gs['az_endpoint2'] = p.az_center + p.az_throw;

            let pos = this.currentPositions();
            gs['el_endpoint1'] = pos['el'];
            gs['el_endpoint2'] = pos['el'];

            gs['az_accel'] = p.az_accel;
            gs['az_speed'] = p.az_speed;

            window.ocs_bundle.ui_start_proc(this.address, 'generate_scan',
                                            this.ops.generate_scan.params);
            break;
          }
          case "goto": {
            // Update the parameters of the generate_scan process.
            let gs = this.ops.go_to.params;
            let pos = this.currentPositions();

            if (!p.goto_az && p.goto_az === '') {
              gs['az'] = pos['az'];
            } else {
              gs['az'] = p.goto_az;
            }
            if (!p.goto_el && p.goto_el === '') {
              gs['el'] = pos['el'];
            } else {
              gs['el'] = p.goto_el;
            }

            window.ocs_bundle.ui_run_task(this.address, 'go_to',
                                            this.ops.go_to.params);
            break;
          }
        }
      },
      stopMotion() {
        // Called from the special motion_control widget.
        let p = this.motion_control;
        switch(p.type) {
          case "const_el":
            window.ocs_bundle.ui_stop_proc(this.address, 'generate_scan');
            break;
          case "goto":
            window.ocs_bundle.ui_abort_task(this.address, 'go_to');
            break;
        }
      },
      currentPositions() {
        let data = this.ops.monitor.session.data;
        return {
          'az': data['StatusDetailed']['Azimuth current position'],
          'el': data['StatusDetailed']['Elevation current position'],
          // In SAT the "3rd axis" is included in StatusDetailed.
          'boresight': data['StatusDetailed']['Boresight current position'],
          // In LAT, it is not.
          'corotator': data['Status3rdAxis']['Boresight current position'],
        };
      },
      currentPosAndMode(prefix) {
        let sdata = this.ops.monitor.session.data;
        if (!sdata)
          return '?';

        let data = {};

        switch(prefix) {
          case 'Timestamp': {
            data = sdata['StatusDetailed'];
            if (!data)
              return '?';
            let timestamp = this.getTimestamp(data);
            if (!timestamp)
              return '?';
            return window.ocs_bundle.util.get_date_time_string(timestamp, ' ');
          }
          case 'Azimuth':
          case 'Elevation':
          case 'Boresight': {
            data = sdata['StatusDetailed'];
            break;
          }
          case 'Corotator': {
            data = sdata['Status3rdAxis'];
            break;
          }
        }

        if (!data)
          return '?';

        let mode = data[prefix + ' mode'];
        if (!mode)
          mode = data[prefix + ' Mode'];  // LAT 3rd axis
        let pos = Number(data[prefix + ' current position']);

        return (window.ocs_bundle.util.pad_decimal(pos.toFixed(4), 5, ' ') +
                ' [' + mode + ']');
      },
      getIndicator(name) {
        let mon_stale_time = 3;  // Seems to be enough
        let brd_stale_time = 5;  // 3 is not enough.

        // If OCS is not connected, nothing else can be reported.
        let ocs_ok = window.ocs.connection.isConnected;
        if (name == 'ocs')
          return ocs_ok;

        if (name == 'agent')
          return this.connection_ok;

        if (!ocs_ok || !this.connection_ok)
          return 'notapplic';

        // For the UDP broadcast process
        if (name == 'broadcast') {
          let brd = this.ops.broadcast.session;
          if (brd.status != 'running')
            return false;
          let brd_time = brd.data['Time'];
          if (!brd_time || (
            window.ocs_bundle.util.timestamp_now() - brd_time > brd_stale_time))
            return 'warning';
          return true;
        }

        // Everything else requires the status monitor process
        let mon = this.ops.monitor.session;
        let mon_running = mon.status == 'running';

        // check staleness.
        let detail = mon.data['StatusDetailed'];
        let mon_time = this.getTimestamp(detail);
        let mon_stale = !mon_time || (
          window.ocs_bundle.util.timestamp_now() - mon_time > mon_stale_time);

        if (name == 'monitor') {
          if (mon_running && mon_stale)
            return 'warning';
          return mon_running;
        }

        // Everything else requires monitor process to be working.
        if (!mon_running || mon_stale)
          return 'notapplic';

        switch (name) {
          case 'safe':
              return !detail['Safe'];
          case 'remote':
            return detail['ACU in remote mode'];
          case 'summary':
              return !detail['General summary fault'];
        }

        return 'notapplic';
      },
      getTimestamp(detail) {
        // Compute timestamp (s) from 'Year' and 'Time' fields.
        if (!detail || !detail.Year || !detail.Time)
          return null;
        return Date.UTC(detail.Year) / 1000 + (Number(detail.Time) - 1) * 86400;
      },
    },
    computed: {
      currentMotion() {
        // Figure out a string to describe what we're doing now ...
        let activities = {
          "Scanning": this.ops.generate_scan.session,
          "Moving": this.ops.go_to.session,
          "Setting Boresight": this.ops.set_boresight.session,
        };
        let texts = [];
        for (const [k, v] of Object.entries(activities)) {
          if (v && v.status && v.status != 'unknown' && v.status != 'done')
            texts.push(k);
        }
        if (!texts.length)
          return '(idle)';
        return texts.join(' AND ');
      },
      statusVars() {
        let sdata = this.ops.monitor.session.data;
        let annotated = [];
        if (!sdata)
          return annotated;

        let data = {
          ...sdata['StatusDetailed'],
          ...sdata['Status3rdAxis'],
        };

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
  .acu_row {
    display: grid;
    grid-template-columns: 1fr 2fr ;
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
    margin: 2px;
  }
  .acu_label {
    text-align: left;
    margin: 2px;
  }
  .acu_double {
    width: 100%;
    grid-column-start: span 2;
  }

  #dataset_table {
    border: 1px solid black;
    border-radius: 3px;
  }
  #dataset_table > div:nth-child(odd) {
    background-color: #fff;
  }
  #dataset_table > div:nth-child(even) {
    background-color: #eee;
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
    background-color: #4e4;
  }
  .isBad {
    background-color: #f88;
  }
  .isActive {
    background-color: #88f;
  }
  .isPassive {
    background-color: #ccf;
  }

</style>

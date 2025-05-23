<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">ACU Agent</OcsAgentHeader>
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
            :value="getIndicator('-', 'Safe')"
          />
          <OcsLight
            caption="REMOTE"
            type="multi"
            tip="Will show green/good when ACU is in Remote (rather than Local) control mode."
            :value="getIndicator('+', 'ACU in remote mode')"
          />
          <OcsLight
            caption="READY"
            type="multi"
            tip="Will show green/good unless ACU expresses a General summary fault."
            :value="getIndicator('-', 'General summary fault')"
          />
          <OcsLight v-if="platformFeature('shutter')"
            caption="SHUTTER"
            type="multi"
            tip="Will show green/good if shutter is open, otherwise red/bad."
            :value="getIndicator('Shutter')"
          />
        </OcsLightLine>

        <OcsLightLine caption="Axis Faults">
          <template v-for="item in axisFaultLights" v-bind:key="item.name">
            <OcsLight
              :caption='item.name'
              type="multi"
              :tip="'Will show green/good if not &quot;' + item.key + '&quot;.'"
              :value="getIndicator('-', item.key)"
              v-if="!item.feature || platformFeature(item.feature)"
            />
          </template>
        </OcsLightLine>

        <OcsLightLine caption="Sun Safety">
          <template v-for="item in sunSafetyIndicators" v-bind:key="item.name">
            <OcsLight
              :caption='item.name'
              type="multi"
              :tip="item.tip"
              :value="item.value"
            />
          </template>
        </OcsLightLine>

        <OcsLightLine caption="HWP Interlocks"
          v-if="platformFeature('hwp')" >
          <template v-for="item in hwpStats()" v-bind:key="item.label">
            <OcsLight
              :caption='item.short'
              type="multi"
              :tip="item.tip"
              :value="item.indicator"
            />
          </template>
        </OcsLightLine>

        <h2>Pointing</h2>
        <OpReading
          caption="Activity"
          :stale="statusIsStale"
          v-bind:value="currentMotion" />
        <OpReading
          caption="Azimuth"
          :stale="statusIsStale"
          v-bind:value="currentPosAndMode('Azimuth')">
        </OpReading>
        <OpReading
          caption="Elevation"
          :stale="statusIsStale"
          v-bind:value="currentPosAndMode('Elevation')">
        </OpReading>
        <OpReading
          caption="Boresight"
          v-if="platformFeature('boresight')"
          :stale="statusIsStale"
          v-bind:value="currentPosAndMode('Boresight')">
        </OpReading>
        <OpReading
          caption="Co-rotator"
          v-if="platformFeature('corotator')"
          :stale="statusIsStale"
          v-bind:value="currentPosAndMode('Corotator')">
        </OpReading>
        <OpReading
          caption="Timestamp"
          :stale="statusIsStale"
          v-bind:value="currentPosAndMode('Timestamp')">
        </OpReading>

        <h2>Control</h2>
        <OpDropdown
          caption="Action Type"
          :options="motion_types[1]"
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
            <label>Passive if empty</label>
            <input type="checkbox" id="checkbox" v-model="motion_control.goto_passive"
                   class="ocs_double" />
          </div>
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

        <form v-on:submit.prevent
              v-if="motion_control.type == 'goto_named'">
          <OpDropdown
            caption="Position"
            :options="namedPositionsArray"
            options_style="object"
            v-model="motion_control.goto_target"
          />
          <div class="ocs_row">
            <label>Set mode=Stop at end?</label>
            <input type="checkbox" id="checkbox" v-model="motion_control.goto_target_stop"
                   class="ocs_double" />
          </div>
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

        <form v-on:submit.prevent
              v-if="motion_control.type == 'sun_stuff'">
          <OpReading
            caption="Sun position"
            :stale="statusIsStale"
            v-bind:value="sunStat('position')">
          </OpReading>
          <OpReading
            caption="Sun distance"
            :stale="statusIsStale"
            v-bind:value="sunStat('distance')">
          </OpReading>
          <div class="ocs_row">
            <label>Reset params</label>
            <button
              :disabled="accessLevel < 1"
              @click="sun('reset')">Go</button>
          </div>
          <div class="ocs_row">
            <label>Escape now</label>
            <button
              :disabled="accessLevel < 1"
              @click="sun('escape')">Go</button>
          </div>
          <div class="ocs_row">
            <label>Enable / Disable mins</label>
            <button
              :disabled="accessLevel < 1"
              @click="sun('enable')">Enable</button>
            <button
              :disabled="accessLevel < 1"
              @click="sun('disable', 30)">Disable, 30 mins</button>
          </div>
        </form>

        <form v-on:submit.prevent
              v-if="motion_control.type == 'hwp_interlock'">
          <div v-for="item in hwpStats()" :key="item.label">
            <OpReading
              :caption="item.label"
              :stale="statusIsStale"
              :value="item.value">
            </OpReading>
          </div>
          <div class="ocs_row">
            <label>Enable / Disable mins</label>
            <button
              :disabled="accessLevel < 1"
              @click="hwp('enable')">Enable</button>
            <button
              :disabled="accessLevel < 1"
              @click="hwp('disable', 30)">Disable</button>
          </div>
        </form>

        <form v-on:submit.prevent
              v-if="motion_control.type == 'shutter'">
          <OpReading
            caption="State"
            :stale="statusIsStale"
            v-bind:value="shutterStats('shutter')">
          </OpReading>
          <OpReading
            caption="Task"
            :stale="statusIsStale"
            v-bind:value="shutterStats('task')">
          </OpReading>
          <div class="ocs_row">
            <label>Move Shutter</label>
            <button
              :disabled="accessLevel < 1"
              @click="shutter('open')">Open</button>
            <button
              :disabled="accessLevel < 1"
              @click="shutter('close')">Close</button>
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
                  <option value="bore-only" v-if="platformFeature('boresight')">Show Boresight</option>
                  <option value="corot-only" v-if="platformFeature('corotator')">Show Co-Rotator</option>
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
        :show_abort="true"
        :op_data="ops.go_to">
        <OpParam
          caption="Az (deg)"
          modelType="blank_to_null"
          v-model.number="ops.go_to.params.az" />
        <OpParam
          caption="El (deg)"
          modelType="blank_to_null"
          v-model.number="ops.go_to.params.el" />
        <div class="ocs_row">
          <label>Set mode=Stop at end?</label>
          <input type="checkbox" id="checkbox" v-model="ops.go_to.params.end_stop"
           class="ocs_double" />
        </div>
      </OcsTask>

      <!-- set_boresight -->
      <OcsTask
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
        :op_data="ops.stop_and_clear">
      </OcsTask>

      <OcsProcess
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
          caption="az_drift"
          modelType="blank_to_null"
          v-model.number="ops.generate_scan.params.az_drift" />
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

      <!-- Sun Block -->

      <OcsProcess
        :op_data="ops.monitor_sun" />
      <OcsTask
        :op_data="ops.update_sun" />
      <OcsTask
        :op_data="ops.escape_sun_now" />

      <!-- HWP Block -->

      <OcsProcess
        :op_data="ops.monitor_hwp" />
      <OcsTask
        :op_data="ops.update_hwp" />

      <!-- Scan / Move parameters -->

      <OcsTask
        :op_data="ops.set_speed_mode">
        <OpDropdown
          caption="mode"
          :options="speed_modes"
          v-model="ops.set_speed_mode.params.speed_mode"
        />
      </OcsTask>

      <!-- Background processes -->

      <OcsTask
        :op_data="ops.clear_faults"
      />

      <OcsProcess
        :op_data="ops.monitor"
      />
      <OcsProcess
        :op_data="ops.broadcast"
      />
      <OcsProcess
        :op_data="ops.restart_idle"
      />

      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'ACUAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        dev_mode: false,  // DO NOT COMMIT THIS AS TRUE!
        axisFaultLights: [
          {name: 'El Sum',
           key: 'Elevation summary fault'},
          {name: 'El Comp',
           key: 'Elevation computer disabled'},
          {name: 'Az Sum',
           key: 'Azimuth summary fault'},
          {name: 'Az Comp',
           key: 'Azimuth computer disabled'},
          {name: 'BS Sum',
           key: 'Boresight summary fault',
           feature: 'boresight'},
          {name: 'BS Comp',
           key: 'Boresight computer disabled',
           feature: 'boresight'},
          {name: 'CR Sum',
           key: 'Co-Rotator summary fault',
           feature: 'corotator'},
          {name: 'CR Comp',
           key: 'Co-Rotator computer disabled',
           feature: 'corotator'},
        ],
        panel: {},
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
              az_drift: null,
              el_endpoint1: 60,
              el_endpoint2: 60,
              el_speed: 1,
              az_start: 'end',
              num_scans: null,
              step_time: null,
              wait_to_start: null,
            },
          },
          set_speed_mode: {
            params: {
              speed_mode: 'high',
            }
          },
          monitor: {
            params: {},
          },
          broadcast: {
            params: {},
          },
          go_to_named: {},
          restart_idle: {},
          clear_faults: {},
          monitor_sun: {},
          update_sun: {},
          escape_sun_now: {},
          monitor_hwp: {},
          update_hwp: {},
        }),
        motion_types_all: [
          ["const_el", "Constant el scan"],
          ["goto", "Go to position"],
          ["goto_named", "Go to named"],
          ["sun_stuff", "Sun Avoidance"],
          ["hwp_interlock", "HWP Interlocks", "satp"],
          ["shutter", "Shutter", "ccat"],
        ],
        motion_types: ['?', {}],
        motion_control: {
          type: "const_el",

          az_center: 180,
          az_throw: 10,
          az_speed: 1,
          az_accel: 1,

          goto_az: 180,
          goto_el: 60,
          goto_passive: false,

          goto_target: null,
          goto_target_stop: true,
        },
        start_types: ["end", "mid"],
        speed_modes: ["high", "low"],
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
              if (p.goto_passive) {
                gs['az'] = null;
              } else {
                gs['az'] = pos['az'];
              }
            } else {
              gs['az'] = p.goto_az;
            }
            if (!p.goto_el && p.goto_el === '') {
              if (p.goto_passive) {
                gs['el'] = null;
              } else {
                gs['el'] = pos['el'];
              }
            } else {
              gs['el'] = p.goto_el;
            }

            window.ocs_bundle.ui_run_task(this.address, 'go_to',
                                            this.ops.go_to.params);
            break;
          }
          case "goto_named": {
            // Update the parameters of the generate_scan process.
            let gs = this.ops.go_to_named.params;

            gs['target'] = p.goto_target;
            gs['end_stop'] = p.goto_target_stop;

            window.ocs_bundle.ui_run_task(this.address, 'go_to_named',
                                            this.ops.go_to_named.params);
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
          // In LAT, it is Status3rdAxis...
          'corotator': data['Status3rdAxis']['Co-Rotator current position'],
        };
      },
      sun(action, arg1) {
        switch (action) {
          case 'reset':
            window.ocs_bundle.ui_run_task(this.address, 'update_sun',
                                          {'reset': true});
            break;
          case 'escape':
            window.ocs_bundle.ui_run_task(this.address, 'update_sun',
                                          {'escape': true});
            break;
          case 'disable':
            window.ocs_bundle.ui_run_task(this.address, 'update_sun',
                                          {'temporary_disable': arg1 * 60});
            break;
          case 'enable':
            window.ocs_bundle.ui_run_task(this.address, 'update_sun',
                                          {'enable': true});
            break;
        }
      },
      sunStat(k) {
        let data = this.ops.monitor_sun.session.data?.sun_pos;
        if (!data || !data['sun_azel'])
          return '?';

        switch(k) {
          case 'position': {
            let azel = data['sun_azel'];
            return 'az=' + azel[0].toFixed(2) + '; el=' + azel[1].toFixed(2);
          }
          case 'distance': {
            let safe_time = window.ocs_bundle.util.human_timespan(
              data['sun_safe_time']);
            return 'offset=' + data['sun_dist'].toFixed(2) + ' deg; safe_time=' + safe_time;
          }
        }
        return 'y';
      },
      hwp(action) {
        switch (action) {
          case 'enable':
            window.ocs_bundle.ui_run_task(this.address, 'update_hwp',
                                          {'enable': true});
            break;
          case 'disable':
            window.ocs_bundle.ui_run_task(this.address, 'update_hwp',
                                          {'enable': false});
            break;
        }
      },
      hwpStats() {
        let data = this.ops.monitor_hwp.session.data;
        let idata = data?.interlocks_config;
        let sdata = data?.supervisor_data;
        let adata = data?.allowed;

        let output = [
          {label: 'HWP Interlock',
           value: 'disabled',
           short: 'disabled',
           tip: 'Green when interlock is enabled; Red when disabled; Yellow if not configured.',
           indicator: 'warning'},
          {label: 'HWP State',
           value: '?',
           short: 'unknown',
           tip: 'Green when HWP state is known; yellow otherwise.',
           indicator: 'warning'},
          {label: 'Azimuth',
           key: 'az',
           value: '*',
           short: 'az',
           tip: ('Green (good) if motion for this axis permitted by HWP interlocks; '
               + 'red (bad) if forbidden by interlocks. Yellow (warning) if motion '
               + 'would be forbidden, but interlocks are disabled'),
           indicator: true},
          {label: 'Elevation',
           key: 'el',
           value: '*',
           short: 'el',
           tip: '(See az indicator tip.)',
           indicator: true},
          {label: 'Boresight',
           key: 'third',
           value: '*',
           short: 'bore',
           tip: '(See az indicator tip.)',
           indicator: true},
        ];
        if (!data || !idata)
          return output;

        if (!idata.configured) {
          output[0].indicator = 'warning';
          output[0].value = 'unconfigured';
          output[0].short = 'no conf';
        }

        if (idata.enabled) {
          output[0].indicator = true;
          output[0].value = "enabled";
          output[0].short = "enabled";
        }

        if (!sdata)
          return output;

        output[1].value = sdata['spin_state'] + '/' + sdata['grip_state'];
        if (!output[1].value.includes('unknown')) {
          output[1].indicator = true;
          output[1].short = 'known';
        }

        if (!adata)
          return output;

        // Axis info
        function fmt_r(a) {
          return 'el=(' + a[0] + ' to ' + a[1] + ')';
        }
        output.forEach(function(item) {
          if (item.key) {
            if (adata[item.key][0]) {
              item.value = 'YES - ' + fmt_r(adata[item.key][1]);
              item.indicator = true;
            } else if (idata.enabled) {
              item.value = 'NO';
              item.indicator = false;
            } else {
              item.value = 'NO*';
              item.indicator = 'warning';
            }
          }
        });
        return output;
      },
      shutter(action) {
        window.ocs_bundle.ui_run_task(this.address, 'set_shutter',
                                      {'action': action});
      },
      shutterStats(k) {
        let data = this.ops.monitor.session.data?.StatusShutter;

        if (!this.platformFeature('shutter'))
          return 'not supported';
        if (!data)
          return 'no_data';

        switch(k) {
          case 'shutter':
            if (data['Shutter Moving'])
              return 'moving';
            if (data['Shutter Timeout'])
              return 'timeout!';
            if (data['Shutter Failure'])
              return 'failure!';
            if (data['Shutter Open'] && !data['Shutter Closed'])
              return 'open';
            if (!data['Shutter Open'] && data['Shutter Closed'])
              return 'closed';
            return 'unknown';

          case 'task': {
            let status = this.ops.set_shutter?.session?.status;
            if (!status || status == 'done')
              return 'idle';
            return status;
          }
        }
      },
      platformFeature(feature) {
        let sdata = this.ops.monitor.session.data;
        if (!sdata || !sdata.PlatformType)
          return false;
        if (sdata.PlatformType != this.motion_types[0]) {
          let new_types = {};
          this.motion_types_all.forEach(function ([a, b, c]) {
            if (!c || sdata.PlatformType == c)
              new_types[a] = b;
          })
          this.motion_types = [sdata.PlatformType, new_types];
        }
        switch (feature) {
          case 'boresight':
            return sdata.PlatformType == 'satp';
          case 'corotator':
            return sdata.PlatformType == 'ccat';
          case 'shutter':
            return sdata.PlatformType == 'ccat';
          case 'hwp':
            return sdata.PlatformType == 'satp';
        }
        return false;
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
            prefix = 'Co-Rotator';
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
      getIndicator(name, mon_key) {
        let mon_stale_time = 3;  // Seems to be enough
        let brd_stale_time = 5;  // 3 is not enough.

        // If OCS is not connected, nothing else can be reported.
        let ocs_ok = window.ocs.connection.isConnected;
        if (name == 'ocs')
          return ocs_ok;

        if (name == 'agent')
          return this.panel.connection_ok;

        if (!ocs_ok || !this.panel.connection_ok)
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
        let detail = {
          ...mon.data['StatusDetailed'],
          ...mon.data['Status3rdAxis'],
        };

        let mon_time = this.getTimestamp(detail);
        let mon_stale = !mon_time || (
          window.ocs_bundle.util.timestamp_now() - mon_time > mon_stale_time);

        if (this.dev_mode)
          mon_stale = false;

        if (name == 'monitor') {
          if (mon_running && mon_stale)
            return 'warning';
          return mon_running;
        }

        // Everything else requires monitor process to be working.
        if (!mon_running || mon_stale)
          return 'notapplic';

        if (name == 'Shutter')
          return this.shutterStats('shutter') == 'open';

        // You could have short-hands for things ('safe' -> !detail['Safe'])
        // but in many cases just look up directly in detail, and maybe negate.
        switch (name) {
          case '+':
            return detail[mon_key] === true;
          case '-':
            return detail[mon_key] === false;
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
          "Moving (Named)": this.ops.go_to_named.session,
          "Setting Boresight": this.ops.set_boresight.session,
          "Escaping the Sun": this.ops.escape_sun_now.session,
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
          if (key.includes('Co-Rotator '))  // trailing space skips an e-stop ...
            d.props.specialization = 'corot-only';

          let test_val = value;
          if (test_val === true || test_val === false)
            d.props.type = 'error';

          switch(key) {
            case 'Azimuth brakes released':
            case 'Elevation brakes released':
            case 'Boresight brakes released':
            case 'Co-Rotator brakes released':
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
            case 'Co-Rotator mode':
              d.props.type = 'indicator';
              test_val = (test_val != 'Stop')
              break;

            case 'Azimuth axis in stop':
            case 'Azimuth power on':
            case 'Elevation axis in stop':
            case 'Elevation power on':
            case 'Boresight axis in stop':
            case 'Boresight power on':
            case 'Co-Rotator axis in stop':
            case 'Co-Rotator power on':
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
      statusIsStale() {
        return this.getIndicator('monitor') !== true;
      },
      sunSafetyIndicators() {
        let data = this.ops.monitor_sun.session.data;
        let summary = data?.avoidance;
        if (!summary)
          summary = {safety_unknown: true};

        let active = {
          'name': data.active_avoidance ? 'enabled' : 'disabled',
          'value': data.active_avoidance ? 'good' : 'warning',
        };

        let zone = null;
        [
          ['ok', 'good', true],
          ['unknown', 'bad', summary.safety_unknown],
          ['warning', 'warning', summary.warning_zone],
          ['danger', 'bad', summary.danger_zone],
        ].filter(([,, test]) => test).forEach(([text, state]) => {
            zone = {name: text, value: state}
        });

        let pos = this.ops.monitor_sun.session.data?.sun_pos?.sun_azel;
        let below_horizon = {
          'name': 'position?',
          'value': 'bad'};
        if (pos) {
          if (pos[1] <= 0)
            below_horizon = {
              'name': 'below horizon',
              'value': 'good'};
          else {
            below_horizon = {
              'name': 'above horizon',
              'value': 'warning'};
          }
        }

        let sstate = this.shutterStats('shutter');
        let shutter = {
          name: sstate,
          tip: 'Indicates whether LAT shutter is reporting as open or closed.'}

        switch (sstate) {
          case 'closed':
            shutter.value = 'good';
            break;
          case 'open':
          case 'moving':
            shutter.value = 'warning';
            break;
          case 'not supported':
            shutter = null;
            break;
          default:
            shutter.value = 'bad';
        }

        zone['tip'] = 'Indicates if Sun is in the warning or danger zones.';
        below_horizon['tip'] = 'Indicates if Sun is above (warning) or below (ok) horizon (el=0).';
        active['tip'] = 'Indicates whether active Sun Avoidance system is enabled.';

        let lights = [
          zone,
          below_horizon,
          active,
        ];

        if (shutter)
          lights.push(shutter);
        return lights;
      },
      namedPositionsArray() {
        let pos_list = this.ops.monitor.session?.data?.NamedPositions;
        if (!pos_list)
          return [];
        let names = {};
        Object.entries(pos_list).forEach(([k, v]) => {
          let [az, el] = v;
          names[k] = `${k} (az=${az},el=${el})`;
        });
        return names;
      },
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

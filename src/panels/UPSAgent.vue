<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>UPSAgent <OpLocker /></h1>
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
        <OpReading
          caption="Last update"
          mode="ok_val"
          v-bind:value="recent_ok">
        </OpReading>

        <h2>UPS Output</h2>
        <div v-for="chan in outputData"
             v-bind:key="chan[0]">
          <OpReading
            :caption="chan[0]"
            v-bind:value="chan[1]" />
        </div>
        <h2>UPS Battery</h2>
        <div v-for="chan in batteryData"
             v-bind:key="chan[0]">
          <OpReading
            :caption="chan[0]"
            v-bind:value="chan[1]" />
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsProcess
        :address="address"
        :op_data="ops.acq"
      />

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
    name: 'UPSAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        connection_ok: false,
        groups: {
          battery: {
            name: "Battery",
            fields: [
              {key: "upsBatteryStatus_0", label: "Status"},
              {key: "upsSecondsOnBattery_0", label: "Time on battery (s)"},
              {key: "upsBatteryVoltage_0", label: "Voltage"},
              {key: "upsBatteryCurrent_0", label: "Current (0.1 A)"},
              {key: "upsBatteryTemperature_0", label: "Temp. (C)"},
              {key: "upsEstimatedChargeRemaining_0", label: "Charge remaining (%)"},
              {key: "upsEstimatedMinutesRemaining_0", label: "Minutes remaining"},
            ]
          },
          output: {
            name: "Output",
            fields: [
              {key: "upsOutputSource_0", label: "Source"},
              {key: "upsOutputVoltage_1", label: "Voltage"},
              {key: "upsOutputCurrent_1", label: "Current (0.1 A)"},
              {key: "upsOutputPower_1", label: "Power (0.1 W)"},
              {key: "upsOutputPercentLoad_1", label: "Load (%)"},
            ],
          },
        },
        ops: window.ocs_bundle.web.ops_data_init({
          acq: {},
        }),
      }
    },
    computed: {
      batteryData() {
        return this.formatData('battery');
      },
      outputData() {
        return this.formatData('output');
      },
      recent_ok() {
        let timestamp = this.ops.acq.session.data?.fields?.timestamp;
        if (timestamp) {
          let dt = window.ocs_bundle.util.timestamp_now() - timestamp;
          return [dt < 90, window.ocs_bundle.util.human_timespan(dt) + ' ago'];
        }
        return [false, "No data"];
      },
    },
    methods: {
      formatData(group_name) {
        let field_data = this.ops.acq.session.data.fields;
        let new_data = [];
        if (field_data) {
          this.groups[group_name].fields.forEach(function(field) {
            let label = field.label ? field.label : field.key;
            let raw_data = field_data[field.key].description;
            new_data.push([label, raw_data]);
          });
        }
        return new_data;
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

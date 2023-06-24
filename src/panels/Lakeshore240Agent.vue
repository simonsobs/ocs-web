/* eslint-disable */
<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Lakeshore240Agent</OcsAgentHeader>
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
        <div class="ocs_triple data_table box">
          <div class="data_row header data_column ">
            <span>Channel</span><span>T</span><span>V</span><span>age</span>
          </div>
          <div class="data_row"
               v-for="chan in computedChannels"
               v-bind:key="chan[0]">
            <span v-for="d in chan" v-html="d" v-bind:key="d" />
          </div>
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsTask
        :op_data="ops.init_lakeshore">
      </OcsTask>

      <OcsProcess
        :op_data="ops.acq"
      />

      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>

  </div>
</template>

<script>
  export default {
    name: 'Lakeshore240Agent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        extension: 5,
        precision: 3,
        ops: window.ocs_bundle.web.ops_data_init({
          init_lakeshore: {},
          acq: {},
        }),
      }
    },
    computed: {
      computedChannels() {
        // Set this.channel_data to any recent measurements.
        let stale = 500;
        let new_data = [];
        let now = window.ocs_bundle.util.timestamp_now();
        let fields = this.ops.acq.session.data.fields;
        let dt = now - this.ops.acq.session.data.timestamp;
        if (fields) {
          Object.keys(fields).forEach((name) => {
            if (dt < stale) {
              let T = window.ocs_bundle.util.pad_decimal(
                fields[name].T.toFixed(this.precision), this.extension);
              let R = window.ocs_bundle.util.pad_decimal(
                fields[name].V.toFixed(this.precision), this.extension);
              let oldness = window.ocs_bundle.util.pad_decimal(
                window.ocs_bundle.util.human_timespan(dt), 4);
              new_data.push([name, T, R, oldness]);
            }
          });
        }
        return new_data;
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .header > span {
    font-weight: bold;
  }
  .data_row > span {
    text-align: center;
  }
  .data_table > div {
    display: grid;
    grid-template-columns: 35% 2fr 2fr 2fr;
    grid-gap: 5px;
  }
  .data_table > div:nth-child(odd) {
    background-color: #f8f;
  }
  .data_table > div:nth-child(even) {
    background-color: #fdf;
  }
  .data_table > div:first-child {
    background-color: #fff;
  }
</style>

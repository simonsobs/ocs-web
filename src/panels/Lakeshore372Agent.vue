/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Lakeshore372Agent</h1>
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
        <div class="ocs_triple data_table box">
          <div class="data_row header data_column ">
            <span>Channel</span><span>T</span><span>R</span><span>age</span>
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
        :address="address"
        :op_data="ops.init_lakeshore">
      </OcsTask>
      <OcsTask
        :address="address"
        @op_error="op_error"
        :op_data="ops.set_autoscan">
        <div class="ocs_row">
          <label>Set autoscan?</label>
          <input type="checkbox"
                 v-model="ops.set_autoscan.params.autoscan" />
        </div>
      </OcsTask>
      <OcsTask
        :address="address"
        :op_data="ops.set_active_channel">
        <OpParam
          caption="Channel (int)"
          v-model.number="ops.set_active_channel.params.channel" />
      </OcsTask>

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
    name: 'Lakeshore372Agent',
    props: {
      address: String,
    },
    data: function () {
      return {
        extension: 5,
        precision: 3,
        connection_ok: false,
        ops: window.ocs_bundle.web.ops_data_init({
          init_lakeshore: {},
          set_active_channel: {
            params: {
              channel: 1,
            }
          },
          set_autoscan: {
            params: {
              autoscan: true,
            },
          },
          acq: {},
        }),
      }
    },
    computed: {
      computedChannels() {
        // Set this.channel_data to any recent measurements.
        let stale = 500;
        let new_data = [];
        let fields = this.ops.acq.session.data.fields;
        let now = window.ocs_bundle.util.timestamp_now();
        if (fields) {
          Object.keys(fields).forEach((name) => {
            let dt = now - fields[name].timestamp;
            if (dt < stale) {
              let T = window.ocs_bundle.util.pad_decimal(
                fields[name].T.toFixed(this.precision), this.extension);
              let R = window.ocs_bundle.util.pad_decimal(
                fields[name].R.toFixed(this.precision), this.extension);
              let oldness = window.ocs_bundle.util.pad_decimal(
                window.ocs_bundle.util.human_timespan(dt), 4);
              new_data.push([name, T, R, oldness]);
            }
          });
        }
        return new_data;
      },
    },
    methods: {
      op_error(text) {
        this.$emit('op_error', text);
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

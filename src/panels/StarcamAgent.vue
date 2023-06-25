<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">StarcamAgent</OcsAgentHeader>
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
        <h2>Last Reading</h2>
        <OpReading
          caption="As of"
          :value="lastVals.oldness">
        </OpReading>
        <OpReading
          caption="Azimuth"
          :value="lastVals.az">
        </OpReading>
        <OpReading
          caption="Elevation"
          :value="lastVals.alt">
        </OpReading>
        <OpReading
          caption="RA"
          :value="lastVals.obs_ra">
        </OpReading>
        <OpReading
          caption="Dec."
          :value="lastVals.obs_dec">
        </OpReading>
        <OpReading
          caption="Timestamp"
          :value="lastVals.gmt">
        </OpReading>

      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <!-- OcsProcess
        :op_data="ops.acq"  -->

      <OcsOpAutofill
        :ops_parent="ops"
      />
    </div>

  </div>
</template>

<script>
  export default {
    name: 'StarcamAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          /* This has to be here to monitor the fields, but "auto"
             will help it get handled by Autofill [maybe not true any
             more -- test me ] */
          acq: {auto: true},
        }),
      }
    },
    computed: {
      lastVals() {
        if (!this.ops.acq || !this.ops.acq.session || !this.ops.acq.session.data)
          return {};
        let d = this.ops.acq.session.data;
        let u = window.ocs_bundle.util;
        ['az', 'alt', 'obs_ra', 'obs_dec'].forEach(k => {
          if (d[k])
            d[k] = u.pad_decimal(d[k].toFixed(6), 4, ' ');
        });
        d.oldness = u.human_timespan(u.timestamp_now() - d['gmt']) + ' ago';
        return d;
      },
    },
  }
</script>

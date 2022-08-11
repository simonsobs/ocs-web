/* eslint-disable */
<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>StarcamAgent <OpLocker /></h1>
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
        <h2>Last Reading</h2>
        <OpReading class="starcam_value"
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
    name: 'GenericAgent',
    props: {
      address: String,
    },
    data: function () {
      return {
        connection_ok: false,
        ops: {
	  'acq': {},
	},
      }
    },
    computed: {
      lastVals() {
	if (!this.ops.acq.session || !this.ops.acq.session.data)
	  return {};
	let d = this.ops.acq.session.data;
	let u = window.ocs_bundle.util;
	['az', 'alt', 'obs_ra', 'obs_dec'].forEach(k => {
	  d[k] = u.pad_decimal(d[k].toFixed(6), 4, ' ');
	});
	d.oldness = u.human_timespan(u.timestamp_now() - d['gmt']) + ' ago';
	return d;
      },
    },
    mounted() {
      window.ocs_bundle.web.register_panel(
        this,
        null,
        ocs_reg);
    },
    beforeUnmount() {
      window.ocs_bundle.web.unregister_panel(this, ocs_reg.client);
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .starcam_value input {
    text-align: center;
  }
</style>

/* eslint-disable */
<template>
  <h1>{{ address }}</h1>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Agent Browser</h1>
        <h2>Configuration</h2>
        <form>
          <OpParam
            caption="WAMP URL"
            modelDisabled="1"
            :modelValue="wamp_url">
          </OpParam>
          <OpParam
            caption="Realm"
            modelDisabled="1"
            :modelValue="wamp_realm">
          </OpParam>
        <OpReading
          caption="Connection"
          mode="ok"
          v-bind:value="connection_ok">
        </OpReading>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'MainBrowser',
    props: {
      address: String,
    },
    data: function () {
      return {
        connection_ok: false,
        wamp_url: window.ocs.url_func(),
        wamp_realm: window.ocs.realm_func(),
      }
    },
    components: {
    },
    mounted() {
      let c = window.ocs;
      c.on('connected', () => {this.connection_ok=true;});
      c.on('disconnected', () => {this.connection_ok=false;});
      this.connection_ok
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

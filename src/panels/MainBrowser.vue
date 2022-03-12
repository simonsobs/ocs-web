/* eslint-disable */
<template>
  <h1>{{ address }}</h1>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Agent Browser</h1>
        <h2>Configuration</h2>
        <form v-on:submit.prevent>
          <OpParam
            caption="WAMP URL"
            :modelValue="wamp_url"
            @input="$emit('update:wamp_url', $event.target.value)"
          />
          <OpParam
            caption="Realm"
            :modelValue="wamp_realm"
            @input="$emit('update:wamp_realm', $event.target.value)"
          />
          <div class="ocs_row">
          <label>Go</label>
          <button @click="$emit('reconnect')">Connect</button>
          </div>
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
      wamp_url: String,
      wamp_realm: String,
    },
    data: function () {
      return {
        connection_ok: false,
      }
    },
    emits: ["reconnect", "update:wamp_url", "update:wamp_realm"],
    components: {
    },
    mounted() {
      let c = window.ocs;
      c.on('connected', () => {this.connection_ok=true;});
      c.on('disconnected', () => {this.connection_ok=false;});
      this.connection_ok = window.ocs.connection && window.ocs.connection.isConnected;
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

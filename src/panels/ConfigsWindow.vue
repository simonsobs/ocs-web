<template>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Configs</h1>
        <div v-for="(config, index) in configs" v-bind:key="index"
             class="box" v-bind:class="{active: (index == active_index)}">

          <form v-on:submit.prevent>
            <div class="ocs_row">
              <h2 class="ocs_triple">
                <div class="sysIcon" :style="{ backgroundColor: bgColor(config) }" />
                <a :href="'?ocs=' + config.name">
                  {{ config.name }}
                </a>
                <span v-if="index == active_index">
                  [active] [{{ (connection_ok) ? 'connected': 'not connected' }}]
                </span>
              </h2>
            </div>
            <OpParam
              caption="WAMP URL"
              :modelDisabled="!config.edit"
              :modelValue="config.url"
              @input="emitConfigChange(index, 'url', $event.target.value)"
            />
            <OpParam
              caption="WAMP Realm"
              :modelDisabled="!config.edit"
              :modelValue="config.realm"
              @input="emitConfigChange(index, 'realm', $event.target.value)"
            />
            <OpParam
              caption="OCS Address Root"
              :modelDisabled="!config.edit"
              :modelValue="config.addr_root"
              @input="emitConfigChange(index, 'addr_root', $event.target.value)"
            />
            <OpParam
              caption="Banner alias"
              v-if="config.styling?.banner"
              :modelDisabled="!config.edit"
              :modelValue="config.styling.banner"
            />
            <div class="ocs_row">
              <label>Reset passwords</label>
              <button @click="clearPw(index)"
               :disabled="index!=active_index">Clear cache</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'ConfigsWindow',
    props: {
      configs: Array,
      active_index: Number,
    },
    data: function () {
      return {
        connection_ok: false,
      }
    },
    emits: ["reconnect", "update:configs"],
    methods: {
      emitConfigChange(index, field, value) {
        this.$emit('update:configs', index, field, value);
      },
      clearPw() {
        this.$emit('clearPw');
      },
      bgColor(cfg) {
        if (cfg.styling?.background)
          return cfg.styling.background;
        return '#fff';
      },
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

  .active {
    background-color: #50c878;
  }

  .sysIcon {
    height: 20px;
    width: 20px;
    float: right;
    border: 1px solid black;
  }

</style>

/* eslint-disable */
<template>
  <h1>Observatory Control System</h1>
  <hr />
  <div class="container">
    <div class="left_bar box">
      <div class="ocs_ui">
        <h2>OCS</h2>
        <select class="ocs_dropdown"
                :value="config_index"
                @change="setConfigIndex($event.target.value)"
                @input="$emit('update:modelValue', $event.target.value)">
          <option v-for="(opt, index) in configs" v-bind:key="index" v-bind:value="index">
            {{ opt.name }}
          </option>
        </select><br />
        <span class="obviously_clickable"
              @click="setMode('config')">Configs</span>
      </div>
      <AgentList @selectAgent="showPanel" :known_classes="known_classes">
      </AgentList>
    </div>
    <div class="main">
      <!-- MainBrowser
        v-if="mainMode=='main'"
        @reconnect="reconnect()"
      / -->
      <ConfigsWindow
        v-if="mainMode=='config'"
        :active_index="config_index"
        :configs="configs"
        @update:configs="configUpdate"
      />
      <component
        v-if="mainMode=='agent'"
        v-bind:is="activeComp"
        :key="active_agent.addr"
        :address="active_agent.addr"
      />
    </div>
  </div>
</template>

<script>

  import { useCookies } from "vue3-cookies";

  // Utility panels
  import MainBrowser from './panels/MainBrowser.vue';
  import ConfigsWindow from './panels/ConfigsWindow.vue';
  import GenericAgent from './panels/GenericAgent.vue';
  import AgentList from './components/AgentList.vue';

  // Agent panels - OCS
  import AggregatorAgent from './panels/AggregatorAgent.vue';
  import FakeDataAgent from './panels/FakeDataAgent.vue';
  import HostManager from './panels/HostManager.vue';

  /* Make a map of components to use in activeComp computed property;
     see
     https://forum.vuejs.org/t/vue-received-a-component-which-was-made-a-reactive-object/119004
     */
  let agent_panels = {
    /* Utility */
    'GenericAgent': GenericAgent,

    /* OCS */
    'AggregatorAgent': AggregatorAgent,
    'FakeDataAgent': FakeDataAgent,
    'HostManager': HostManager,
  };
  
  let ocs = require('./ocsbow');
  let util = require('./util');
  let web = require('./ocsweb');
  
  // Unglobalfy
  var ocs_bundle = {
    ocsbow: ocs,
    web: web,
    util: util,
    
    // classes
    AgentClient: ocs.AgentClient,
    OCSConnection: ocs.OCSConnection,

    // globals
    connection: null,
    tabman: null,
    debugs: {},
    startup_panels: [],
    config: {},
  };

  ocs.init(ocs_bundle);
  
  window.ocs_bundle = ocs_bundle;
  
  window.ocs = new ocs.OCSConnection(
    function () {return window.ocs_bundle.config.url; },
    function () {return window.ocs_bundle.config.realm; },
  );

  export default {
    name: 'App',
    data() {
      let [configs, index] = web.setup_configs();
      return {
        active_agent: {
          'comp': null,
          'addr': null,
        },
        config_index: index,
        configs: configs,
        mainMode: 'config',
      }
    },
    components: {
      AgentList,
      MainBrowser,
      ConfigsWindow,
    },
    computed: {
      activeComp() {
        let component = null;
        if (this.active_agent) {
          component = agent_panels[this.active_agent['agent_class']];
          if (!component)
            component = agent_panels['GenericAgent'];
        }
        return component;
      },
      known_classes() {
        return Object.keys(agent_panels);
      },
    },
    methods: {
      configUpdate(index, key, val) {
        this.configs[index][key] = val;
        if (this.configs[index].name == 'custom') {
          this.cookies.set("ocsWebConfig", this.configs[index], "100y");
          if (index == this.config_index)
            this.reconnect();
        }
      },
      setConfigIndex(index) {
        if (this.config_index != index) {
          // The quiet way ...
          //this.config_index = index;
          //ocs_bundle.config = this.configs[index];
          //this.reconnect();
          // The URLey way-- note this destroys your custom settings
          let route = "?ocs=" + this.configs[index].name;
          window.location.href = (route);
        }
      },
      showPanel(v) {
        this.mainMode = 'agent';
        this.active_agent = v;
      },
      setMode(mode) {
        this.mainMode = mode;
      },
      reconnect() {
        // Simple "close" should trigger reconnect automatically.
        if (window.ocs.connection)
          window.ocs.connection.close();
      },
    },
    setup() {
      const { cookies } = useCookies();
      return { cookies };
    },
    mounted() {
      // Process cookie ("custom" address).
      let cfg_cookie = this.cookies.get("ocsWebConfig");
      if (cfg_cookie) {
        this.configs.forEach(cfg => {
          if (cfg.name == "custom") {
            if (cfg_cookie.url)
              cfg.url = cfg_cookie.url;
            if (cfg_cookie.realm)
              cfg.realm = cfg_cookie.realm;
          }
        });
      }

      let cfg_name = new URL(location.href).searchParams.get('ocs');
      if (cfg_name) {
        this.configs.forEach((cfg, idx) => {
          if (cfg.name == cfg_name)
            this.config_index = idx;
        });
      }
      ocs_bundle.config = this.configs[this.config_index];
      window.ocs.start();
    },
  }
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #2c3e50;
    margin-top: 30px;
  }

  .container {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: 200px 1fr;
  }

  .left_bar {
    height: 85vh;
    background-color: #ccf;
    overflow: ellipsis;
  }

  .main {
    overflow: hidden;
  }

  .ocs_dropdown {
    width: 100%;
  }
</style>

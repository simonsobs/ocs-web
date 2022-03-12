/* eslint-disable */
<template>
  <h1>Observatory Control System</h1>
  <hr />
  <div class="container">
    <div class="left_bar box">
      <div class="ocs_ui">
        <h2>OCS</h2>
        <span class="obviously_clickable"
              @click="showBrowser()">Browser</span>
      </div>
      <AgentList @selectAgent="showPanel">
      </AgentList>
    </div>
    <div class="main">
      <MainBrowser
        v-if="mainView"
        v-model:wamp_url="config.wamp_url"
        v-model:wamp_realm="config.wamp_realm"
        @reconnect="reconnect()"
      />
      <component
        v-bind:is="activeComp"
        :key="active_agent.addr"
        :address="active_agent.addr"
      />
    </div>
  </div>
</template>

<script>

  // Utility panels
  import MainBrowser from './panels/MainBrowser.vue';
  import GenericAgent from './panels/GenericAgent.vue';
  import AgentList from './components/AgentList.vue';

  // Agent panels - OCS
  import FakeData from './panels/FakeData.vue';
  import HostManager from './panels/HostManager.vue';

  /* Make a map of components to use in activeComp computed property;
     see
     https://forum.vuejs.org/t/vue-received-a-component-which-was-made-a-reactive-object/119004
     */
  let agent_panels = {
    /* Utility */
    'GenericAgent': GenericAgent,

    /* OCS */
    'FakeDataAgent': FakeData,
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
    config: {
      'wamp_url': web.get_default_url(),
      'wamp_realm': web.get_default_realm(),
    },
  };

  ocs.init(ocs_bundle);
  
  window.ocs_bundle = ocs_bundle;
  
  window.ocs = new ocs.OCSConnection(
    function () {return window.ocs_bundle.config.wamp_url; },
    function () {return window.ocs_bundle.config.wamp_realm; },
  );
  window.ocs.start();

  export default {
    name: 'App',
    data() {
      return {
        active_agent: {
          'comp': null,
          'addr': null,
        },
        mainView: true,
      }
    },
    components: {
      AgentList,
      MainBrowser,
    },
    computed: {
      activeComp() {
        let component = agent_panels[this.active_agent['agent_class']];
        console.log('set', component);
        if (component)
          return component;
        else
          return null;
      },
      config: {
        set(val) {
          ocs_bundle.config = val;
        },
        get() {
          return ocs_bundle.config;
        },
      },
    },
    mounted() {
      this.showBrowser();
    },
    methods: {
      showPanel(v) {
        this.mainView = false;
        this.active_agent = v;
        console.log(v, v.agent_class);
      },
      showBrowser() {
        this.mainView = true;
        this.active_agent = {
          'agent_class': null,
          'addr': null,
        }
      },
      reconnect() {
        // Simple "close" should trigger reconnect automatically.
        window.ocs.connection.close();
      },
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
</style>

/* eslint-disable */
<template>
  <h1>Observatory Control System</h1>
  <hr />
  <div class="container">
    <div class="left_bar box">
      <div class="ocs_ui">
        <h2>OCS</h2>
        <span class="obviously_clickable"
              @click="show_browser()">Browser</span>
      </div>
      <AgentList @show_panel="show_panel">
      </AgentList>
    </div>
    <div class="main">
      <component
        v-bind:is="activeComp"
        :key="active_agent.addr"
        :address="active_agent.addr"
      />
    </div>
  </div>
</template>

<script>
  import MainBrowser from './panels/MainBrowser.vue';
  import AgentList from './components/AgentList.vue';
  import FakeData from './panels/FakeData.vue';
  import HostManager from './panels/HostManager.vue';

  // Make a map of components to use in activeComp computed property.
  // https://forum.vuejs.org/t/vue-received-a-component-which-was-made-a-reactive-object/119004
  let agent_panels = {
    'MainBrowser': MainBrowser,
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
    panel_constructors: {},
    debugs: {},
    startup_panels: [],
  };

  ocs.init(ocs_bundle);
  
  window.ocs_bundle = ocs_bundle;
  
  window.ocs = new ocs.OCSConnection(
    function () {return "ws://localhost:8001/ws"},
    function () {return "test_realm"},
  );
  window.ocs.start();

  export default {
    name: 'App',
    data() {
      return {
        active_agent: {
          'comp': 'MainBrowser',
          'addr': null,
        },
      }
    },
    components: {
      AgentList,
    },
    computed: {
      activeComp() {
        let component = agent_panels[this.active_agent['agent_class']];
        console.log('set', component);
        if (component)
          return component;
        else
          return null;
      }
    },
    mounted() {
      this.show_browser();
    },
    methods: {
      show_panel(v) {
        this.active_agent = v;
        console.log(v, v.agent_class);
      },
      show_browser() {
        this.active_agent = {
          'agent_class': 'MainBrowser',
          'addr': null,
        }
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

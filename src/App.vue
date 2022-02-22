<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

let ocs = require('./ocsbow');
let util = require('./util');
//let ui = require('./js/monitor_ui');

/* eslint-disable */
// Unglobalfy
var ocs_bundle = {
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
//window.onload = init();

window.ocs_bundle = ocs_bundle;

  window.ocs = new ocs.OCSConnection(
    function () {return "ws://localhost:8001/ws"},
    function () {return "test_realm"},
  );
  window.ocs.on('connected', function () {
    window.client = window.ocs.get_client('observatory.faker3');
    });
  window.ocs.start();
  
export default {
  name: 'App',
  components: {
    HelloWorld,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

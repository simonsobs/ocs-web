/* eslint-disable */
<template>
  <h1>{{ main_title }}</h1>
  <hr />

  <!-- Viewport-fixed for unscrollables-->
  <div class="viewport">

    <!-- Alert box -->
    <div class="fullScreenMask" v-if="errorInfo">
      <div class="errorModal">
        <div class="errorModalContent">
          <div v-if="errorInfo.type=='op'">
            <h2>Failed Operation Request</h2>
            <p><b>Agent:</b> {{ errorInfo.address }}</p>
            <p><b>Operation:</b> {{ errorInfo.op_name }}</p>
            <p><b>Response:</b>  {{ errorInfo.message }}</p>
          </div>
          <div v-else>
            <b>Error</b>
            <pre v-html="JSON.stringify(errorInfo, null, 2)" />
          </div>
          <button style="width: 200px" @click="op_error(null)">Ok</button>
        </div>
      </div>
    </div>

    <!-- Confirmation box -->
    <div class="fullScreenMask" v-if="userConfirm">
      <div class="errorModal">
        <div class="errorModalContent">
            <h2>Confirm: {{ userConfirm.title }}</h2>
            <p>{{ userConfirm.text }}</p>
            <div class="buttonGroup">
              <button style="width: 200px" @click="confirmOp(true)">Ok</button>
              <button style="width: 200px" @click="confirmOp(false)">Cancel</button>
            </div>
        </div>
      </div>
    </div>

    <!-- Password config -->
    <div class="fullScreenMask" v-if="passwordWindow">
      <div class="errorModal">
        <div class="errorModalContent">
          <PasswordConfig :config="passwordWindow" @close="confirmPw()" />
        </div>
      </div>
    </div>

  </div>

  <!-- Container for main interface -->
  <div class="container">

    <!-- Sidebar -->
    <div class="left_bar">
      <div class="left_bar_menu box">
        <h2>Main</h2>
        <div class="ocs_ui">
          <ul>
            <li>
              <select class="ocs_dropdown"
                  :value="config_index"
                  @change="setConfigIndex($event.target.value)"
                  @input="$emit('update:modelValue', $event.target.value)">
            <option v-for="(opt, index) in configs" v-bind:key="index" v-bind:value="index">
              {{ opt.name }}
            </option>
              </select><br />
            </li>
            <li>
              <span class="obviously_clickable"
                    @click="setMode('config')">Configs</span><br />
            </li>
            <li>
              <span class="obviously_clickable"
                    @click="setMode('browse')">Browser</span>
            </li>
          </ul>
        </div>
        <h2>Agents</h2>
        <AgentList @selectAgent="showPanel" :known_classes="known_classes"
                                            parent_id="sidebar">
        </AgentList>
      </div>
    </div>

    <!-- Panels -->
    <div class="main">
      <ConfigsWindow
        v-if="mainMode=='config'"
        :active_index="config_index"
        :configs="configs"
        @update:configs="configUpdate"
      />
      <MainBrowser
        v-if="mainMode=='browse'"
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

  import { computed } from 'vue'
  import { useCookies } from "vue3-cookies";

  // Utility panels
  import MainBrowser from './panels/MainBrowser.vue';
  import ConfigsWindow from './panels/ConfigsWindow.vue';
  import GenericAgent from './panels/GenericAgent.vue';
  import AgentList from './components/AgentList.vue';
  import PasswordConfig from './components/PasswordConfig.vue';

  // Agent panels - OCS
  import AggregatorAgent from './panels/AggregatorAgent.vue';
  import FakeDataAgent from './panels/FakeDataAgent.vue';
  import HostManager from './panels/HostManager.vue';

  // Agent panels - SOCS
  import Lakeshore240Agent from './panels/Lakeshore240Agent.vue';
  import Lakeshore372Agent from './panels/Lakeshore372Agent.vue';
  import ACUAgent from './panels/ACUAgent.vue';
  import ibootbarAgent from './panels/ibootbarAgent.vue';
  import RotationAgent from './panels/RotationAgent.vue';
  import StarcamAgent from './panels/StarcamAgent.vue';
  import SynaccessAgent from './panels/SynaccessAgent.vue';
  import PysmurfControllerAgent from './panels/PysmurfController.vue';
  import UPSAgent from './panels/UPSAgent.vue';
  import HWPSupervisor from './panels/HWPSupervisor.vue';

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

    /* SOCS */
    'Lakeshore240Agent': Lakeshore240Agent,
    'Lakeshore372Agent': Lakeshore372Agent,
    'ACUAgent': ACUAgent,
    'ibootbarAgent': ibootbarAgent,
    'RotationAgent': RotationAgent,
    'starcam_Agent': StarcamAgent,
    'SynaccessAgent': SynaccessAgent,
    'PysmurfController': PysmurfControllerAgent,
    'UPSAgent': UPSAgent,
    'HWPSupervisor': HWPSupervisor,

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

    // handlers
    on_error: null,

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
    function () {return window.ocs_bundle.config.addr_root; },
  );

  export default {
    name: 'App',
    data() {
      let [configs, index] = web.setup_configs();
      return {
        main_title: 'Observatory Control System',
        active_agent: {
          'comp': null,
          'addr': null,
        },
        force_generic: false,
        config_index: index,
        configs: configs,
        mainMode: 'config',
        errorInfo: null,
        userConfirm: null,
        passwordWindow: null,
        accessLevel: 0,
        accessEscalation: 0,
      }
    },
    provide() {
      return {
        accessLevel: computed({
          get: () => this.accessLevel,
          set: (v) => {this.accessLevel = v;}
        }),
        accessEscalation: computed({
          get: () => this.accessEscalation,
          set: (v) => {
            window.ocs.passwords.escalation = v;
            this.accessEscalation = v;
          }
        }),
        activeAgent: computed({
          get: () => this.active_agent,
        }),
      }
    },
    components: {
      AgentList,
      MainBrowser,
      ConfigsWindow,
      PasswordConfig,
    },
    computed: {
      activeComp() {
        let component = null;
        if (this.active_agent) {
          component = agent_panels[this.active_agent['agent_class']];
          if (!component || this.force_generic)
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
      showPanel(v, debug) {
        this.mainMode = 'agent';
        this.active_agent = v;
        this.force_generic = debug;
        this.accessLevel = 1;
      },
      setMode(mode) {
        this.mainMode = mode;
      },
      reconnect() {
        // Simple "close" should trigger reconnect automatically.
        if (window.ocs.connection)
          window.ocs.connection.close();
      },
      op_error(msg) {
        this.errorInfo = msg;
      },
      confirmOp(confirm) {
        if (confirm && this.userConfirm.callback)
          this.userConfirm.callback();
        if (!confirm && this.userConfirm.cancel)
          this.userConfirm.cancel();

        this.userConfirm = null;
      },
      confirmPw() {
        this.passwordWindow = null;
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
            if (cfg_cookie.addr_root)
              cfg.addr_root = cfg_cookie.addr_root;
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

      this.main_title = `Observatory Control System - [${ocs_bundle.config.name}]`;

      // Transitional converter -- if client is a string, construct a
      // client assuming it's the agent address; otherwise assume client.
      let _get_client = function(client) {
        if (typeof client === 'string')
          return window.ocs.get_client(client);
        return client;
      };

      // Register error handler.
      ocs_bundle.on_error = (msg) => {
        this.op_error(msg);
      };

      // Get user confirmation for something ...
      ocs_bundle.ui_confirm = (title, text, callback, cancel) => {
        this.userConfirm = {title: title,
                            text: text,
                            callback: callback,
                            cancel: cancel};
      };

      // Functions that wrap operation start/stop with UI error windows.
      ocs_bundle.ui_run_task = (client, op_name, op_params) => {
        // Temporarily accept "client" to be an agent_address.
        client = _get_client(client);
        client.run_task(op_name, op_params).then(
          (msg) => console.log('ok', msg),
          (msg) => window.ocs_bundle.on_error(
            {'type': 'op',
             'address': client.address,
             'op_name': op_name,
             'message': msg})
        );
      };

      ocs_bundle.ui_abort_task = (client, op_name) => {
        client = _get_client(client);
        client.abort_task(op_name)
              .then(
                result => {
                  if (result[0] != 0) {
                    let msg = result[1]
                    window.ocs_bundle.on_error(
                      {'type': 'op',
                       'address': client.address,
                       'op_name': op_name,
                       'message': msg});
                }
              });
      };

      ocs_bundle.ui_start_proc = (client, op_name, op_params) => {
        client = _get_client(client);
        client.start_proc(op_name, op_params)
              .then(
                result => {
                  if (result[0] != 0) {
                    let msg = result[1]
                    window.ocs_bundle.on_error(
                      {'type': 'op',
                       'address': client.address,
                       'op_name': op_name,
                       'message': msg});
                  }
              });
      };

      ocs_bundle.ui_stop_proc = (client, op_name) => {
        client = _get_client(client);
        client.stop_proc(op_name)
              .then(
                result => {
                  if (result[0] != 0) {
                    let msg = result[1]
                    window.ocs_bundle.on_error(
                      {'type': 'op',
                       'address': client.address,
                       'op_name': op_name,
                       'message': msg});
                }
              });
      };

      ocs_bundle.ui_password_window = (agent_class, instance_id) => {
        this.passwordWindow = {agent_class: agent_class,
                               instance_id: instance_id};
      };

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
    width: 100%;
    display: grid;
    grid-template-columns: 200px 1fr;
  }

  .container > div {
    position: absolute;
  }

  .left_bar {
    left: 0;
    width: 20%;
    margin: 0%;
    overflow: ellipsis;
    padding: 10px;
  }

  .left_bar_menu {
    background-color: #ccf;
  }

  .left_bar_menu > div {
    padding-bottom: 10px;
  }

  .left_bar_menu > .ocs_ui > ul {
    list-style-type: none;
    margin: 0;
    padding: 0px 10px;
  }

  .left_bar_menu .al_level1 {
    padding-left: 10px;
  }

  .left_bar_menu {
    overflow: clip;
  }

  .main {
    left: 20%;
    width: 80%;
    overflow: hidden;
  }

  /* Modal error box */
  .fullScreenMask {
    position: fixed;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: #0000;
  }
  .errorModal {
    position: fixed;
    left: 25%;
    top: 15%;
    width: 50%;
    background-color: #4888;
  }
  @media screen and (max-width: 1000px) {
    .errorModal {
      left: 5%;
      width: 90%;
    }
  }
  .errorModalContent {
    margin: 5%;
    height: 80%;
    padding: 20px;
    border: 1px solid #88c;
    background-color: #fff;
    width: 90%;
  }
  .buttonGroup button {
    display: inline-block;
  }

  .ocs_dropdown {
    width: 100%;
  }
</style>

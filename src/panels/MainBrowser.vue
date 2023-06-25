<template>
  <h1>Main Browser</h1>
  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <h1>Detected Agent Instances</h1>
        <AgentList
          @selectAgent="selectAgent"
          :known_classes="known_classes"
          parent_id="main_browser">
        </AgentList>
      </div>

      <div class="box">
        <h1>Agent Interface</h1>
        <div class="ocs_ui" v-if="client">
          <h2>Tasks</h2>
          <div v-for="task in client.tasks" v-bind:key="task[0]">
            <span class="obviously_clickable" @click="selectApi('task', task)">
              {{ task[0] }}
            </span>
          </div>
          <h2>Processes</h2>
          <div v-for="proc in client.procs" v-bind:key="proc[0]">
            <span class="obviously_clickable" @click="selectApi('proc', proc)">
              {{ proc[0] }}
            </span>
          </div>
          <h2>Feeds</h2>
          <div v-for="feed in client.feeds" v-bind:key="feed[0]">
            <span class="obviously_clickable" @click="selectApi('feed', feed)">
              {{ feed[0] }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right block -->
    <div class="block_unit">
      <div class="box detail">
        <div>
          <h1>Detail</h1>
          <span>{{ detailAdvice }}<br /></span>
        </div>
        <div class="tabs">
          <div
            @click="setDetailTab('session')"
            :class="{inactive: detailTab!='session'}"
          >session</div>
          <div
            @click="setDetailTab('data')"
            :class="{inactive: detailTab!='data'}"
          >data</div>
          <div
            @click="setDetailTab('docs')"
            :class="{inactive: detailTab!='docs'}"
          >docs</div>
        </div>
          <div class="box">
            <div v-if="op_info && detailTab=='session'">
              <h2>Session summary</h2>
              <p>Current status: {{ op_info.session.status }}</p>
              <p>Message buffer:</p>
              <pre>{{ op_info.session.messages }}
              </pre>
            </div>
            <div v-if="op_info && detailTab=='data'">
              <h2>Session data</h2>
              <pre>{{ op_info.data }}</pre>
            </div>
            <div v-if="op_info && detailTab=='docs'">
              <h2>Docstring</h2>
              <span v-html="op_info.docstring" />
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
  import AgentList from '@/components/AgentList.vue';

  export default {
    name: 'MainBrowser',
    data: function () {
      return {
        client: null,
        agent: null,
        op_info: null,
        known_classes: [],
        connection_ok: false,
        detailTab: 'session',
      }
    },
    components: {
      AgentList,
    },
    mounted() {
      let c = window.ocs;
      c.on('connected', () => {this.connection_ok=true;});
      c.on('disconnected', () => {this.connection_ok=false;});
      this.connection_ok = window.ocs.connection &&
                           window.ocs.connection.isConnected;
      // Debugging
      // setTimeout(() => {
      //   this.selectAgent({'addr': 'observatory.hm-grayjay'});
      //   setTimeout(() => {
      //     this.selectApi('proc', this.client.procs[0]);
      //   }, 500);
      // }, 500);
    },
    beforeUnmount() {
      let c = this.client;
      this.client = null
      if (c)
        c.clear_watchers();
    },
    computed: {
      detailAdvice() {
        if (!this.agent)
          return '(select an Agent Instance)';
        if (!this.op_info)
          return this.agent.addr + ' : (select a Task or Process)';
        return this.agent.addr + ' : ' + this.op_info.op_name;
      },
    },
    methods: {
      setDetailTab(option) {
        this.detailTab = option;
      },
      selectAgent(agent) {
        if (this.agent != agent) {
          if (this.client)
            this.client.clear_watchers();
          this.client = new window.ocs_bundle.AgentClient(
            window.ocs, agent.addr);
          this.client.scan();
          this.agent = agent;
          this.op_info = null;
        }
      },
      selectApi(op_type, op_data) {
        window.debug = op_data;

        if (op_type == 'feed') {
          console.log('No display function for feed.  Data is:',
                      op_data);
          return;
        }

        let component = this;
        let update_info = function(op_name, method, stat, msg, session) {
          component.op_info.session = session;
          component.op_info.data = JSON.stringify(session.data, null, 2);
        };
        this.client.clear_watchers();
        this.client.add_watcher(op_data[0], 1.0, update_info);

        this.op_info = {
          op_type: op_type,
          op_name: op_data[0],
          session: op_data[1],
          data: JSON.stringify(op_data[1].data, null, 2),
          docstring: (op_data[2].docstring || "")
                               .replaceAll('\n', '<br />')
                               .replace(/^\s\s\s\s/mg, '&nbsp;&nbsp;'),
        };
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .tabs > div {
    display: inline;
    border: solid black 1px;
    padding: 10px;
    width: 50px;
  }
  .detail {
    display: block;
  }
  .tabs {
    margin: 10px 0px;
  }
  .inactive {
    background-color: #ddd;
  }
</style>

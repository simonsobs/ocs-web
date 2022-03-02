/* eslint-disable */
<template>
  <div class="ocs_ui">
    <h2>Agents</h2>
    <div v-for="k in active_list" v-bind:key="k" class="al_level1">
      <span>{{ k[0] }} </span>
      <div v-for="x in k[1]" v-bind:key="x" class="al_level2">
        <span class="obviously_clickable"
              @click="show_panel(x)">{{ tracked_agents[x].instance_id }}</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AgentList',
    props: {
      prefix: {
        default: 'observatory.',
      },
    },
    data: function () {
      return {
        tracked_agents: {},
        alphabetical: [],
        by_class: [],
      }
    },
    computed: {
      active_list() {
        return this.by_class;
      }
    },
    methods: {
      show_panel(key) {
        this.$emit('show_panel', this.tracked_agents[key]);
      },
      update_agent_list(agent_addr, new_state, info) {
        let short = agent_addr;
        if (short.startsWith(this.prefix))
          short = short.slice(this.prefix.length);
        this.tracked_agents[agent_addr] = {
          addr: agent_addr,
          instance_id: short,
          ok: new_state,
          agent_class: info.agent_class,
        };

        // Make a full alphabetical list ...
        let alpha = Object.keys(this.tracked_agents);
        alpha.sort();
        this.alphabetical = [['All agents', alpha]];

        // And also lists by agent class ...
        let by_class = {};
        alpha.map(k => {
          console.log(k, this.tracked_agents[k]);
          let c = this.tracked_agents[k].agent_class;
          if (!by_class[c])
            by_class[c] = [];
          by_class[c].push(k)
        });
        let classes = Object.keys(by_class);
        classes.sort();
        this.by_class = [];
        classes.map(k => {
          this.by_class.push([k, by_class[k]]);
        });}
      ,
    },
    mounted() {
      //window.ocs_bundle.web.register_panel(this, null, ocs_reg);
      let c = window.ocs;
      c.agent_list.subscribe('sidebar', '*', this.update_agent_list);
    },
    beforeUnmount() {
      window.ocs.agent_list.unsubscribe('sidebar');
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .al_level1 {
    font-size: medium;
    font-weight: bold;
    padding: 0px 2px;
  }
  .al_level2 {
    padding: 0px 10px;
    font-weight: normal;
  }
  .sidebar {
    width: 100%;
  }

</style>

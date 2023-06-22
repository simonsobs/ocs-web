/* eslint-disable */
<template>
  <div class="ocs_ui">
    <div v-for="k in active_list" v-bind:key="k" class="al_level1">
      <span>{{ k[0] }} </span><span v-if="!known_classes.includes(k[0])">[?]</span>
      <div v-for="x in k[1]" v-bind:key="x"
           class="al_level2 obviously_clickable"
           @click.exact="selectAgent(x)"
           @click.shift="selectAgent(x, true)"
           v-bind:class="{missing: !tracked_agents[x].ok}">
        {{ tracked_agents[x].instance_id }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AgentList',
    props: {
      parent_id: String,
      known_classes: Array,
    },
    data: function () {
      return {
        tracked_agents: {},
        alphabetical: [],
        by_class: [],
        addr_root: 'observatory',
      }
    },
    computed: {
      active_list() {
        return this.by_class;
      }
    },
    methods: {
      selectAgent(key, debug) {
        this.$emit('selectAgent', this.tracked_agents[key], debug);
      },
      update_agent_list(agent_addr, new_state, info) {
        let short = agent_addr;
        let addr_root = window.ocs.agent_list.connection.addr_root_func();
        if (addr_root && short.startsWith(addr_root + '.'))
            short = short.slice(addr_root.length + 1);
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
      let c = window.ocs;
      c.agent_list.subscribe(this.parent_id, '*', this.update_agent_list);
    },
    beforeUnmount() {
      window.ocs.agent_list.unsubscribe(this.parent_id);
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
  .missing {
    background-color: #f00;
  }
</style>

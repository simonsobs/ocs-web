<!--
This is a access config icon that connects to App.accessEscalation.

Agent panels can add this anywhere on the page and it will allow for
configuration of an access password.
-->

<template>
  <div>
    <span class="obviously_clickable tippable"
          @click.exact="changeConfig()">
      <span v-if="accessEscalation == 0">
        <span class="tooltip">Basic privileges (no password).</span>
        <font-awesome-icon icon="fa-solid fa-user" />
      </span>
      <span v-else style="color: #f44">
        <span class="tooltip">Escalated privileges enabled.</span>
        <font-awesome-icon icon="fa-solid fa-user-graduate" />
      </span>
    </span>
  </div>
</template>

<script>

  export default {
    name: 'OpPrivs',
    inject: ['accessEscalation', 'activeAgent'],
    methods: {
      changeConfig() {
        let ag = this.activeAgent;
        window.ocs_bundle.ui_password_window(ag.agent_class, ag.instance_id);
      },
    },
    mounted() {
      this.accessEscalation = 0;
    },
    beforeUnmount() {
      clearTimeout(this.timer);
    },
  }
</script>

<style scoped>
  div {
    display: inline;
    float: right;
  }
  .tooltip {
    visibility: hidden;
    left: 20px;
    top: 40px;
    width: 400px;
    background-color: gray;
    color: #000;
    text-align: left;
    padding: 5px 5px;
    border-radius: 6px;
    font-size: 12pt;

    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
  }
  .tippable:hover .tooltip {
    visibility: visible;
  }
</style>  

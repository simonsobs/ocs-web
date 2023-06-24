<!--
Access Escalation icon -- shows current escalation level and
can open up the password config window.
-->

<template>
  <div>
    <span v-if="supportsPasswords"
          class="obviously_clickable tippable"
          @click.exact="changeConfig()">
      <span v-if="!activeAgent.escalation">
        <span class="tooltip">Basic privileges (no password).</span>
        <font-awesome-icon icon="fa-solid fa-user" />
      </span>
      <span v-else style="color: #f44">
        <span class="tooltip">Escalated privileges enabled.</span>
        <font-awesome-icon icon="fa-solid fa-user-graduate" />
      </span>
    </span>
    <span v-else class="tippable"
          style="color: #ccc">
      <span class="tooltip">Agent does not support password.</span>
      <font-awesome-icon icon="fa-solid fa-user" />
    </span>
  </div>
</template>

<script>

  export default {
    name: 'OpPrivs',
    inject: ['activeAgent'],
    computed: {
      panel() {
        return this.$parent.panel;
      },
      supportsPasswords: {
        get() {
          // Check .count, which will increment when new API
          // new API info arrives.
          this.panel.count;
          return this.panel?.client?.access_control;
        }
      },
    },
    methods: {
      changeConfig() {
        window.ocs_bundle.ui_password_window();
      },
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
    position: absolute;
    z-index: 1;
  }
  .tippable:hover .tooltip {
    visibility: visible;
  }
</style>  

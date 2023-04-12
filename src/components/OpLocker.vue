<!--
This is a lock / unlock widget that connects to App.accessLevel.

Agent panels can add this anywhere on the page and it will
affect the task and process start/stop buttons.  The panel will
lock by default.
-->

<template>
  <div>
    <span v-if="accessLevel == 0"
          class="obviously_clickable"
          @click.exact="unlock(false)"
          @click.shift="unlock(true)">
      <font-awesome-icon icon="fa-solid fa-lock" />
    </span>
    <span v-else
          class="obviously_clickable"
          style="color: #aa6"
          @click="lock()">
      <font-awesome-icon icon="fa-solid fa-unlock" />
    </span>
  </div>
</template>

<script>

  export default {
    name: 'OpLocker',
    inject: ['accessLevel'],
    methods: {
      lock() {
        this.accessLevel = 0;
      },
      unlock(forever) {
        this.accessLevel = 1;
        clearTimeout(this.timer);
        if (!forever)
          this.timer = setTimeout(() => this.lock(), 30000);
      },
    },
    mounted() {
      this.accessLevel = 0;
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
</style>  

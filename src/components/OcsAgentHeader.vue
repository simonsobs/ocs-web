<template>
  <div>
    <h1><slot /> <OpLocker class="spaced" /> <OpPrivs class="spaced" /></h1>
  </div>
</template>

<script>
  export default {
    name: 'OcsAgentHeader',
    computed: {
      panel() {
        return this.$parent.panel;
      }
    },
  }
</script>

<style scoped>
  .spaced {
    padding: 0 5px;
  }
</style>

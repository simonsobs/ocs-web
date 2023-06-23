<template>
  <div>
    <h1><slot /> <OpLocker class="spaced" /> <OpPrivs class="spaced" :panel="panel" /></h1>
  </div>
</template>

<script>
  export default {
    name: 'OcsAgentHeader',
    props: {
      panel: Object,
    },
  }
</script>

<style scoped>
  .spaced {
    padding: 0 5px;
  }
</style>

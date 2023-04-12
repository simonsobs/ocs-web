<template>
  <div>
    <h1><slot /> <OpLocker class="spaced" /> <OpPrivs class="spaced" /></h1>
  </div>
</template>

<script>
  export default {
    name: 'OcsAgentHeader',
    props: {
      name: String,
    },
  }
</script>

<style scoped>
  .spaced {
    padding: 0 5px;
  }
</style>

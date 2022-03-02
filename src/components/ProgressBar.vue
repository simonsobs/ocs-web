<!-- this isn't great -->

<template>
  <div class="empty ocs_row">
    <div class="bar ocs_triple"
         v-bind:style="{ width: compWidth }"></div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<script>
  export default {
    name: 'OpParam',
    computed: {
      compWidth() {
        return (Math.min(1, this.frac) * 100) + '%';
      }
    },
    props: {
      frac: Number,
      label: String,
    },
  }
</script>

<style scoped>
  .empty {
    /*background-color: #00ffff;*/
    height: 44px;
    width: 100%;
    position: relative;
    padding: 5px 0px 5px 0px;
  }
  
  .bar {
    width: 100%;
    height: 100%;
    background-color: #ff00f0;
  }

  .label {
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
    vertical-align: middle;
    line-height: 48px;
  }
</style>

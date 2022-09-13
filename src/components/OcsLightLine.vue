<!--

OcsLightLine
------------

This is a container for displaying a row of OcsLight elements.  The
"caption" is used as the row label.  Find more info in OcsLight.

-->

<template>
  <div class="ocs_row">
    <label>{{ caption }}</label>
    <div class="ocs_double indicator_tray">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'OcsLightLine',
    props: {
      caption: String,
    },
}
</script>

<style scoped>
  /* This causes the child elements to be equally distributed in a row. */
  .indicator_tray {
    width: 100%;
    display: flex;
    justify-content: space-around;
  }
</style>

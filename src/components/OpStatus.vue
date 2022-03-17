<!--

OpStatus
--------

This component is intended for displaying the operation status in an
OcsTask or OcsProcess. Hey let's just put it at the bottom of both of
those by default.

-->

<template>
  <div class="ocs_row">
    <label>{{ caption }}</label>
    <input class="ocs_double"
           type="text"
           disabled="1"
           :value="compValue"
    />
  </div>
</template>

<script>
  export default {
    name: 'OpStatus',
    props: {
      caption: {
        type: String,
        default: 'Status'
      },
      op_name: String,
      op_params: Object,
    },
    computed: {
      enabled() {
        return true;
      },
      compValue() {
        return this.op_params[this.op_name].status;
      },
    },
    mounted() {
    },
}
</script>

<style scoped>
</style>

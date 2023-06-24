/* eslint-disable */
<template>
  <div class="ocs_ui">
    <i v-if="show_warning">Operations widgets below are
    automatically instantiated, without any parameter fields.  Some
    may be usable without parameters while others are not.</i>
    <div v-for="op in ops_parent" v-bind:key="op">
      <OcsTask
        v-if="op.auto && op.type == 'task'"
        class="autofilled"
        :show_abort="op.show_abort"
        :op_data="op" />
      <OcsProcess
        v-if="op.auto && op.type == 'proc'"
        class="autofilled"
        :op_data="op" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'OcsOpAutofill',
    props: {
      ops_parent: Object,
      warn_about_auto: {
        Type: Boolean,
        default: true,
      },
    },
    data: function () {
      return {
        ops_task: {},
        ops_proc: {},
      }
    },
    computed: {
      panel() {
        return this.$parent.panel;
      },
      show_warning() {
        return this.warn_about_auto && (
          Object.values(this.ops_parent)
                          .reduce((n, op) => (n + (op.auto ? 1: 0)), 0) > 0);
      },
      ops() {
        // Some stuff expects this.ops instead of separate ones ...
        let result = {};
        Object.entries(this.ops_task).forEach(([k, v]) =>
          result[k] = v);
        Object.entries(this.ops_proc).forEach(([k, v]) =>
          result[k] = v);
        return result;
      },
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .autofilled  {
    color: #688;
  }
</style>

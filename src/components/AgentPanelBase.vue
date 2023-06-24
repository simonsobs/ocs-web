<template>
  <div />
</template>

<script>
  export default {
    name: 'AgentFrame',
    mounted() {
      let p = this.$parent;
      window.ocs_bundle.web.register_panel(p).then(() => {
        this.$emit('clientConnected');
      });
    },
    beforeUnmount() {
      let p = this.$parent;
      window.ocs_bundle.web.unregister_panel(p);
    },
  }
</script>

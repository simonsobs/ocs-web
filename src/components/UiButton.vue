<template>
  <button
    :disabled="accessLevel < 1"
    @click="$emit('click-button')">
    <slot />
  </button>
</template>

<script>
  export default {
    name: 'UiButton',
    inject: ['accessLevel'],
    //emits: ["op_error"],
    methods: {
    },
  }
</script>

<style scoped>
</style>

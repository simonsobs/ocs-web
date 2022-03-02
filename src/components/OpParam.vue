<!--

OpParam
-------

This component provides user-editable text fields for an Agent Panel.

-->

<template>
  <div class="ocs_row">
    <label>{{ caption }}</label>
    <input class="ocs_double"
           type="text"
           :disabled="modelDisabled == true"
           :value="modelValue"
           @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<script>
  export default {
    name: 'OpParam',
    props: {
      caption: String,
      modelDisabled: {
        type: String,
        default: "0",
        required: false},
      modelValue: {
        required: true},
    },
}
</script>

<style scoped>
</style>

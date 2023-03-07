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
           v-model="value"
    />
  </div>
</template>

<script>
  export default {
    name: 'OpParam',
    props: {
      caption: String,
      modelDisabled: {
        type: Boolean,
        default: false,
        required: false},
      modelValue: {
        required: true},
      modelType: {},
    },
    computed: {
      value: {
        get() {
          return this.modelValue;
        },
        set(value) {
          if (this.modelType == 'blank_to_null') {
            if (value.trim() == '')
              value = null;
          }
          this.$emit('update:modelValue', value);
        },
      }
    },
}
</script>

<style scoped>
</style>

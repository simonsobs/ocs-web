<!--

OpParam
-------

This component provides user-editable text fields for an Agent Panel.
These can be used to map values into operation start arguments, or for
other stuff.  Note checkbox and ride-along buttons are supported.

Usage::

   <OpParam
     caption="Some param"
     v-model="ops.op_name.params.param_name" />

   You can apply model value filters -- e.g. use v-model.number. To
   force blank values to return null, include::

     modelValue="blank_to_null"

   To make it a checkbox (which will automatically parse as a bool),
   include::

     :checkbox="true"

   To include both the editable field and a clickable button, pass::

     button="Button text"
     @click-button="do_click()"

-->

<template>
  <div class="ocs_row">
    <label v-bind:class="{ocs_double: wideLabel}">{{ caption }}</label>
    <input v-if="checkbox"
           type="checkbox"
           v-bind:class="{ocs_double: wideInput}"
           :disabled="modelDisabled == true"
           id="checkbox"
           v-model="value" />
    <input v-else
           type="text"
           v-bind:class="{ocs_double: wideInput}"
           :disabled="modelDisabled == true"
           v-model="value" />
    <button v-if="button"
            :disabled="disabled"
            @click="$emit('click-button')">
      {{ button }}
    </button>
  </div>
</template>

<script>
  export default {
    name: 'OpParam',
    props: {
      caption: String,
      button: {
        default: false,
      },
      checkbox: {
        default: false,
      },
      disabled: {
        default: false,
      },
      modelDisabled: {
        type: Boolean,
        default: false,
        required: false},
      modelValue: {
        required: true},
      modelType: {},
    },
    computed: {
      wideLabel() {
        return !this.button && this.checkbox;
      },
      wideInput() {
        return !this.button && !this.checkbox;
      },
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

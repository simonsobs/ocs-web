<template>
  <div class="ocs_row">
    <label>{{ caption }}</label>

    <!-- options_style='array' -->
    <select class="ocs_double"
            :value="modelValue"
            @input="emitValue($event.target.value)"
            v-if="options_style == 'array'">
      <option v-for="opt in options" v-bind:key="opt" v-bind:value="opt">
        {{ opt }}
      </option>
    </select>

    <!-- options_style='object' -->
    <select class="ocs_double"
            :value="modelValue"
            @input="emitValue($event.target.value)"
            v-if="options_style == 'object'">
      <option v-for="(value, key) in options" v-bind:key="key" :value="key">
        {{ value }}
      </option>
    </select>

  </div>
</template>

<script>
  export default {
    name: 'OpSelect',
    props: {
      caption: String,
      options: {
        default() { return []; },
        required: true,
      },
      options_style: {
        type: String,
        default: 'array',
        required: false,
      },
      modelValue: {
        required: true},
      modelModifiers: { default: () => ({}) },
    },
    //emits:
    methods: {
      emitValue(value) {
        // Handle the "vmodel.boolean"
        if (this.modelModifiers.boolean)
          value = (value == "true");
        this.$emit('update:modelValue', value);
      },
    },
  }
</script>

<style scoped>
</style>

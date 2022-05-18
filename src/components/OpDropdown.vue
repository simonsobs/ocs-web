<template>
  <div class="ocs_row">
    <label>{{ caption }}</label>
    <select class="ocs_double"
           :value="modelValue"
           @input="$emit('update:modelValue', $event.target.value)">
      <option v-for="opt in options" v-bind:key="opt" v-bind:value="opt">
        {{ opt }}
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
       type: Array,
        default() { return [] },
        required: true
      },
      modelValue: {
        required: true},
    },
}
</script>

<style scoped>
</style>

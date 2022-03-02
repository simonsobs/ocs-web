<!--

OpReading
---------

This component is intended for displaying status or readings in an
Agent Panel.  An <input> element is used, but disabled so that user
can't change the values.  Special 

-->

<template>
  <div class="ocs_row">
    <label>{{ caption }}</label>
    <input class="ocs_double"
           type="text"
           disabled="1"
           :class="{
             bad: conditionIs('bad'),
             good: conditionIs('good'), 
             centered: conditionIs('centered'),
           }" 
           :value="compValue"
    />
  </div>
</template>

<script>
  export default {
    name: 'OpReading',
    props: {
      caption: String,
      value: {
        required: true},
      mode: {
        type: String,
        default: "display",
        required: false},
    },
    methods: {
      conditionIs(cond) {
        switch(cond) {
          case 'bad':
            return (this.mode == 'ok' && !this.value);
          case 'good':
            return (this.mode == 'ok' && this.value);
          case 'centered':
            return this.mode == 'ok';
        }
        return false;
      },
    },
    computed: {
      compValue() {
        if (this.mode == "ok") {
          if (this.value === true) 
            return "OK";
          else
            return "ERROR";
        }
        return this.value;
      },
    },
    mounted() {
      if (this.mode == "ok") {
        // Center text.
      }
    },
}
</script>

<style scoped>
  input.bad {
    background-color: #c33;
    color: #fff;
  }
  input.good {
    background-color: #594;
    color: #fff;
  }
  input.centered {
    text-align: center;
  }
</style>

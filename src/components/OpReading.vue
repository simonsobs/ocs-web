<!--

OpReading
---------

This component is intended for displaying status or readings in an
Agent Panel.  An <input> element is used, but disabled so that user
can't change the values.

Set the .mode attribute to one of:

- "display": displays .value, with no formatting.
- "ok": displays OK or ERROR, with colors, depending on bool(.value)
- "ok_val": displays .value[1], but with color dependent on bool(.value[0])

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
             stale: stale,
             centered: (align == 'center'),
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
      align: {
        type: String,
        default: "center",
        required: false},
      stale: {
        default: false,
      },
    },
    methods: {
      conditionIs(cond) {
        switch(cond) {
          case 'bad':
            return (this.mode == 'ok' && !this.value) ||
                   (this.mode == 'ok_val' && !this.value[0]);
          case 'good':
            return (this.mode == 'ok' && this.value) ||
                   (this.mode == 'ok_val' && this.value[0]);
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
        if (this.mode == "ok_val")
          return this.value[1];
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
  input.stale {
    background-color: #aaa;
    color: #a99;
  }
  input.centered {
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>

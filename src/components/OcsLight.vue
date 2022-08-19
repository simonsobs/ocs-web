<!--

OcsLight
--------

This component provides an indicator light, with a label and tool tip text.
The background color the light changes depending on the value of the
provided data.

This element will normally live inside an OcsLightLine.

The "value" property can either be bound to a boolean variable (for
simple false -> red and true -> green behavior) or to a string
variable, where the string takes one of the values:

  "good"      -> green
  "bad"       -> red
  "warning"   -> yellow
  "notapplic" -> gray

When bound to a string variable, set the property "type" equal to "multi".
-->

<template>
  <div class="indicator_container">
    <input type="ocs_text"
           disabled="1"
           :class="{
             bad: conditionIs('bad'),
             good: conditionIs('good'),
             warning: conditionIs('warning'),
             notapplic: conditionIs('notapplic'),
           }"
           :value="caption"
    />
    <span class="tooltip">{{ caption }} [{{ coded() }}]: {{ tip }}</span>
  </div>
</template>

<script>
  export default {
    name: 'OcsLight',
    props: {
      caption: String,
      tip: String,
      type: {
        default: "boolean",
      },
      value: {
        required: true},
    },
    methods: {
      conditionIs(cond) {
        return cond == this.coded();
      },
      coded() {
        if (this.type == 'boolean') {
          if (this.value)
            return 'good';
          return 'bad';
        }
        return this.value;
      },
    },
    computed: {
    },
    mounted() {
    },
}
</script>

<style scoped>
  input {
    width: 100%;
    height: 100%;
    border-radius: 0px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  input.bad {
    background-color: #c33;
    color: #fff;
  }
  input.good {
    background-color: #594;
    color: #fff;
  }
  input.warning {
    background-color: #ff0;
    color: #000;
  }
  input.notapplic {
    background-color: #eee;
    color: #888;
  }

  .indicator_container {
    position: relative;
  }
  .tooltip {
    visibility: hidden;
    left: 20px;
    top: 40px;
    width: 400px;
    background-color: gray;
    color: #000;
    text-align: left;
    padding: 5px 5px;
    border-radius: 6px;

    /* Position the tooltip text - see examples below! */
    position: absolute;
    z-index: 1;
  }
  .indicator_container:hover .tooltip {
    visibility: visible;
  }

</style>

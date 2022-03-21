<template>
  <div class="task ocs_ui box">
    <form v-on:submit.prevent>
      <div class="ocs_row">
        <label class="important">{{ name }}</label>
        <button @click="start">Start</button>
        <span></span>
      </div>

      <slot></slot>

      <div v-if="show_status" class="ocs_row">
        <label>Status</label>
        <input class="ocs_double"
               type="text"
               disabled="1"
               :value="comp_status"
        />
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'OcsTask',
    props: {
      address: String,
      op_data: Object,
      op_name: String,
      show_status: {
        default: true,
      },
    },
    computed: {
      comp_status() {
        return window.ocs_bundle.web.get_status_string(
          this.op_data.session);
      },
      name() {
        if (this.op_name)
          return this.op_name;
        return this.op_data.name;
      },
    },
    methods: {
      start() {
        window.ocs.get_client(this.address).run_task(this.name, this.op_data.params);
      },
    },
}
</script>

<style scoped>
</style>

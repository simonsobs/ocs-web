<template>
  <div class="task ocs_ui box">
    <form v-on:submit.prevent>
      <div class="ocs_row">
        <label class="important">{{ name }}</label>
        <button
          v-if="show_start"
          :disabled="accessLevel < 1"
          @click="start">Start</button>
        <button
          v-if="show_abort"
          :disabled="accessLevel < 1"
          @click="abort">Abort</button>
        <span v-else></span>
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
      panel: Object,
      op_data: Object,
      op_name: String,
      show_status: {
        default: true,
      },
      show_start: {
        default: true,
      },
      show_abort: {
        default: false,
      },
    },
    inject: ['accessLevel'],
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
    emits: ["op_error"],
    methods: {
      // transitional...
      _get_client_or_address() {
        let client = this.panel?.client;
        if (!client)
          client = this.address;
        if (!this.address)
          client = this.$parent.panel.client;
        return client;
      },
      start() {
        window.ocs_bundle.ui_run_task(this._get_client_or_address(),
                                      this.name, this.op_data.params);
      },
      abort() {
        window.ocs_bundle.ui_abort_task(this._get_client_or_address(),
                                        this.name);
      },
    },
  }
</script>

<style scoped>
</style>

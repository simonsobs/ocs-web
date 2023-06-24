<template>
  <div class="process ocs_ui box">
    <form v-on:submit.prevent>
      <div class="ocs_row">
        <label class="important">{{ name }}</label>
        <button
          :disabled="accessLevel < 1"
          @click="start">Start</button>
        <button
          :disabled="accessLevel < 1"
          @click="stop">Stop</button>
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
    name: 'OcsProcess',
    props: {
      panel: Object,
      address: String,
      op_data: Object,
      op_name: String,
      show_status: {
        default: true,
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
        window.ocs_bundle.ui_start_proc(this._get_client_or_address(),
                                        this.name, this.op_data.params);
      },
      stop() {
        window.ocs_bundle.ui_stop_proc(this._get_client_or_address(),
                                       this.name);
      },
    },
  }

</script>

<style scoped>
</style>

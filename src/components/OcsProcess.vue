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
      start() {
        window.ocs.get_client(this.address)
              .start_proc(this.name, this.op_data.params)
              .then(
                result => {
                  if (result[0] != 0) {
                    let msg = result[1]
                    window.ocs_bundle.on_error(
                      {'type': 'op',
                       'address': this.address,
                       'op_name': this.name,
                       'message': msg});
                  }
                });
      },
      stop() {
        window.ocs.get_client(this.address).stop_proc(this.name);
      },
    },
  }

</script>

<style scoped>
</style>

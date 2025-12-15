<template>
  <AgentPanelBase @clientConnected="startListening()"/>

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">tauHKAgent</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          v-bind:value="address">
        </OpReading>
        <OpReading
          caption="Connection"
          mode="ok"
          v-bind:value="panel.connection_ok">
        </OpReading>
        <OpReading
          caption="Latest data"
          mode="ok_val"
          v-bind:value="recent_ok">
        </OpReading>
        <OpReading
          caption="Crate status"
          mode="ok_val"
          v-bind:value="crate_ok">
        </OpReading>
      </div>

      <div class="box">

        <h2>Set Option</h2>
        <OpDropdown
          caption="Channel"
          :options="channels"
          v-model="choice.channel" />

        <OpDropdown
          caption="Option"
          :options="options"
          v-model="choice.option" />
        
        <OpDropdown
          v-if="optionType == 'enum'"
          caption="Value"
          :options="settables[choice.channel][choice.option][1]"
          options_style="object_transpose"
          @onUpdated="vChange()"
          v-model="choice.value" />

        <OpDropdown
          v-else-if="optionType == 'bool'"
          caption="Value"
          :options="[true, false]"
          options_style="array"
          v-model="choice.value" />

        <OpParam
          v-else
          caption="Value"
          v-model="choice.value"/>

        <div class="ocs_row">
          <label />
          <button class="ocs_double"
            :disabled="accessLevel < 1"
            @click="setValue">Set value</button>
        </div>


      </div>

      <h2>Upload Excitations</h2>
      <OcsTask :op_data="ops.load_config">
        <OpParam
          caption="Config file path"
          v-model.string="ops.load_config.params.config_file"/>
      </OcsTask>
      
    </div>

    <!-- Right block -->
    <div class="block_unit">

      <OcsOpAutofill
        :ops_parent="ops"
      />

    </div>
  </div>
</template>

<script>
  export default {
    name: 'tauHKAgent',
    props: {
      address: String,
    },
    inject: ['accessLevel'],
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          generic_send: {
            auto: true,
            params: {
              channel: null,
              option: null,
              value: null,
            }
          },
          receive_data: { auto: true},
          start_crate: { auto: true},
        }),
        first_pop: true,
        settables: {},
        choice: { channel: null, option: null, value: null }
      }
    },
    computed: {
      recent_ok() {
        let timestamp = this.ops.receive_data.session.data?.timestamp;
        if (timestamp) {
          let dt = window.ocs_bundle.util.timestamp_now() - timestamp;
          return [dt < 90, window.ocs_bundle.util.human_timespan(dt) + ' ago'];
        }
        return [false, "No data"];
      },
      crate_ok() {
        let status = this.ops.start_crate.session.data?.is_alive;
        if (status === undefined) return [false, "Never Started"];
        let message = this.ops.start_crate.session.data?.latest_log;
        return [status, message];
      },
      channels() {
        return Object.keys(this.settables);
      },
      options() {
        if (this.choice?.channel)
          return Object.keys(this.settables[this.choice.channel]);
        return [];
      },
      optionType() {
        if (this.choice?.channel && this.choice.option
            && this.settables[this.choice.channel][this.choice.option])
          return this.settables[this.choice.channel][this.choice.option][0];
        return 'unknown';
      },
    },
    methods: {
      updateSettables(op_name, method, stat, msg, session) {
        if (session.data?.settables) {
          if (this.first_pop) {
            // Change to checking every 10 seconds, after startup.
            this.panel.client.clear_watchers(op_name);
            this.panel.client.add_watcher(op_name, 10., this.updateSettables);
            this.first_pop = false;
          }
          this.settables = session.data.settables;
        }
      },
      startListening() {
        this.panel.client.add_watcher('advertise', 1., this.updateSettables);
      },
      setValue() {
        window.ocs_bundle.ui_run_task(
          this.address, 'generic_send', this.choice);
      },
    },
  }
</script>

<style scoped>
</style>

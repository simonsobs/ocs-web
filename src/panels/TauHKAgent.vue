<template>
  <AgentPanelBase @clientConnected="startListening()"/>

  <div class="block_holder ocs_ui">

    <!-- Left block -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">TauHKAgent</OcsAgentHeader>
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

      <h2>Latest Readings</h2>

      <form v-on:submit.prevent>
        <div class="dset_row">
          <span>Group</span>
          <span>
            <select v-model="dataset.view" class="dataset_filter">
              <option value="all" default>Show all</option>
              <option value="100mK_">Show 100mK</option>
              <option value="1K_">Show 1K</option>
              <option value="4K_">Show 4K</option>
              <option value="40K_">Show 40K</option>
              <option value="80K_">Show 80K</option>
              <option value="nothing" default>Show nothing</option>
            </select>
          </span>
        </div>
        <div class="dset_triple">
          <span><label>Hide T:<input type="checkbox" id="checkbox" v-model="dataset.hideT" /></label></span>
          <span><label>Hide R,V: <input type="checkbox" id="checkbox" v-model="dataset.hideR" /></label></span>
          <span><label>Hide others: <input type="checkbox" id="checkbox" v-model="dataset.hideO" /></label></span>
        </div>
        <div class="dset_row">
          <span>Text Filter</span>
          <span><input type="text"
                       class="dset_double"
                       v-model="dataset.filter"
                /></span>
        </div>
      </form>

      <div id="dataset_table">
        <div class="dset_row dset_header">
          <span class="dset_value">Value</span>
          <span class="dset_label">Field</span>
        </div>
        <div v-for="item in statusVars" v-bind:key="item.name">
          <div v-if="(dataset.view=='all' || dataset.view==item.props.specialization)
                     && !(dataset.hideT && item.props.type == 'T'
                     || dataset.hideR && item.props.type == 'R'
                     || dataset.hideO && item.props.type == 'O')
                     && (dataset.filter == '' || item.name.trim().toLowerCase().includes(dataset.filter.trim().toLowerCase()))"
               class="dset_row">
          <span class="dset_value"
                v-bind:class="item.classObj"
          >{{ item.value }}</span>
          <span class="dset_label">{{ item.name }}</span>
        </div>
      </div>
    </div>

      
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
    name: 'TauHKAgent',
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
          load_config: {
            auto: true,
            params: {
             config_file: null,
           },
          },
        }),
        first_pop: true,
        settables: {},
        choice: { channel: null, option: null, value: null },
        dataset: {
          view: "all",
          filter: "",
          hideT: false,
          hideR: false,
          hideO: false,
        },
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
      statusVars() {
        let data = this.ops.receive_data.session.data;
        if (!data)
          return [];

        let annotated = [];
        let simple_spec = [
          '100mK_', '1K_', '4K_', '40K_', '80K_'];

        for (const [key, value] of Object.entries(data)) {
          let d = {
            name: key,
            value: value,
            props: {
              type: 'passive',
              inverted: false,
              specialization: 'other-only',
            },
          };

          for (const spec of simple_spec)
            if (key.includes(spec))
              d.props.specialization = spec;

          if (key.includes('temperature'))
            d.props.type = 'T';
          else if (key.includes('resistance') || key.includes('voltage'))
            d.props.type = 'R';
          else
            d.props.type = 'O';

          annotated.push(d);
        }
        return annotated;
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
  .dset_row {
    display: grid;
    grid-template-columns: 1fr 2fr ;
  }
  .dset_triple {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr ;
  }
  .dset_row > div, button, span {
    font-size: 11pt;
    padding: 5px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dset_header {
    border-bottom: 1px solid black;
  }
  .dset_header > span {
    font-weight: bold;
    padding: 10px 0px;
  }
  .dset_value {
    text-align: center;
    margin: 2px;
  }
  .dset_label {
    text-align: left;
    margin: 2px;
  }
  .dset_double {
    width: 100%;
    grid-column-start: span 2;
  }
  #dataset_table {
    border: 1px solid black;
    border-radius: 3px;
  }
  #dataset_table > div:nth-child(odd) {
    background-color: #fff;
  }
  #dataset_table > div:nth-child(even) {
    background-color: #eee;
  }

  .dataset_filter {
    width: 100%;
  }

  /* Classes for rows in the Dataset table:
   * - isNormal: no error / idle.
   * - isBad: error.
   * - isActive: not idle but not an error.
   * - isPassive: otherwise unclassifiable.
   */

  .isNormal {
    background-color: #4e4;
  }
  .isBad {
    background-color: #f88;
  }
  .isActive {
    background-color: #88f;
  }
  .isPassive {
    background-color: #ccf;
  }

</style>

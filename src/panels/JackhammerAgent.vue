<template>
  <AgentPanelBase />

  <div class="block_holder ocs_ui">

    <!-- Left block: status -->
    <div class="block_unit">
      <div class="box">
        <OcsAgentHeader :panel="panel">Jackhammer Agent</OcsAgentHeader>
        <h2>Connection</h2>
        <OpReading
          caption="Address"
          :value="address">
        </OpReading>
        <OcsLightLine caption="Status">
          <OcsLight
            caption="Connected"
            tip="Agent connection status"
            :value="panel.connection_ok" />
          <OcsLight
            caption="Monitoring"
            tip="Monitor process is running"
            :value="ops.monitor.session.status == 'running'" />
        </OcsLightLine>

        <h2>Slot Status</h2>
        <OcsLightLine
          v-for="slot in availableSlots"
          :key="slot"
          :caption="'Slot ' + slot">
          <OcsLight
            :caption="slotCaption(slot)"
            type="multi"
            :tip="'Slot ' + slot + ' configuration status'"
            :value="slotLight(slot)" />
        </OcsLightLine>
        <OpReading
          v-if="availableSlots.length === 0"
          caption="Slots"
          value="No data (monitor not running?)">
        </OpReading>

        <template v-if="hammerData.succeeded_slots || hammerData.failed_slots">
          <h2>Last Hammer Result</h2>
          <OpReading
            caption="Succeeded"
            :value="hammerSucceededText">
          </OpReading>
          <OpReading
            caption="Failed"
            :value="hammerFailedText">
          </OpReading>
        </template>
      </div>
    </div>

    <!-- Right block: operations -->
    <div class="block_unit">

      <div class="task ocs_ui box">
        <form v-on:submit.prevent>
          <div class="ocs_row">
            <label class="important">hammer</label>
            <button
              :disabled="accessLevel < 1"
              @click="startHammer">Start</button>
          </div>

          <div class="ocs_row" v-if="availableSlots.length > 0">
            <label class="important">Slots</label>
            <button @click="toggleAll">{{ allSelected ? 'Deselect All Slots' : 'Select All Slots' }}</button>
          </div>
          <div class="ocs_row" v-for="slot in availableSlots" :key="'sel-' + slot">
            <label class="ocs_double">{{ 'Slot ' + slot }}</label>
            <input type="checkbox" v-model="selectedSlots[slot]" />
          </div>

          <div class="ocs_row">
            <label class="important">Options</label>
          </div>
          <OpParam
            caption="No Reboot"
            :checkbox="true"
            v-model="ops.hammer.params.no_reboot" />
          <OpParam
            caption="Skip Setup"
            :checkbox="true"
            v-model="ops.hammer.params.skip_setup" />
          <OpParam
            caption="Dump Logs"
            :checkbox="true"
            v-model="ops.hammer.params.dump_logs" />
          <OpParam
            caption="Dump Rogue"
            :checkbox="true"
            v-model="ops.hammer.params.dump_rogue" />

          <div class="ocs_row">
            <label><span class="clickable" @click="showHammerData">Status</span></label>
            <input class="ocs_double"
                   type="text"
                   disabled="1"
                   :value="hammerStatus" />
          </div>
        </form>
      </div>

      <OcsProcess :op_data="ops.monitor" />

      <OcsOpAutofill :ops_parent="ops" />
    </div>

  </div>
</template>

<script>
  export default {
    name: 'JackhammerAgent',
    inject: ['accessLevel'],
    props: {
      address: String,
    },
    data: function () {
      return {
        panel: {},
        ops: window.ocs_bundle.web.ops_data_init({
          hammer: {
            params: {
              no_reboot: false,
              skip_setup: false,
              dump_logs: false,
              dump_rogue: false,
            },
          },
          monitor: {},
        }),
        selectedSlots: {},
      }
    },
    computed: {
      availableSlots() {
        let slots = this.ops.monitor.session.data?.slots;
        if (!slots) return [];
        return Object.keys(slots).map(Number).sort((a, b) => a - b);
      },
      allSelected() {
        if (this.availableSlots.length === 0) return false;
        return this.availableSlots.every(s => this.selectedSlots[s]);
      },
      hammerData() {
        return this.ops.hammer.session.data || {};
      },
      hammerSucceededText() {
        let s = this.hammerData.succeeded_slots;
        if (!s || s.length === 0) return 'None';
        return s.join(', ');
      },
      hammerFailedText() {
        let f = this.hammerData.failed_slots;
        if (!f || Object.keys(f).length === 0) return 'None';
        return Object.entries(f).map(([k, v]) => k + ': ' + v).join('; ');
      },
      hammerStatus() {
        return window.ocs_bundle.web.get_status_string(
          this.ops.hammer.session);
      },
    },
    watch: {
      availableSlots(newSlots) {
        for (let s of newSlots) {
          if (!(s in this.selectedSlots))
            this.selectedSlots[s] = false;
        }
      },
    },
    methods: {
      slotLight(slot) {
        let slots = this.ops.monitor.session.data?.slots;
        if (!slots || !slots[slot]) return 'notapplic';
        let s = slots[slot];
        if (s.configured === null && s.configuring === null) return 'notapplic';
        if (s.configuring === true) return 'warning';
        if (s.configured === true) return 'good';
        return 'bad';
      },
      slotCaption(slot) {
        let light = this.slotLight(slot);
        if (light === 'warning') return 'Configuring';
        if (light === 'good') return 'Configured';
        if (light === 'bad') return 'Not configured';
        return 'Unknown';
      },
      toggleAll() {
        let target = !this.allSelected;
        for (let s of this.availableSlots) {
          this.selectedSlots[s] = target;
        }
      },
      startHammer() {
        let slots = this.availableSlots.filter(s => this.selectedSlots[s]);
        if (slots.length === 0) slots = null;
        let params = {
          slots: slots,
          no_reboot: this.ops.hammer.params.no_reboot,
          skip_setup: this.ops.hammer.params.skip_setup,
          dump_logs: this.ops.hammer.params.dump_logs,
          dump_rogue: this.ops.hammer.params.dump_rogue,
        };
        window.ocs_bundle.ui_run_task(
          this.panel.client || this.address, 'hammer', params);
      },
      showHammerData() {
        window.ocs_bundle.ui_show_detail(this.ops.hammer);
      },
    },
  }
</script>

<style scoped>
</style>

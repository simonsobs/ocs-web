<!--
     PasswordConfig -- form to update password settings for an agent panel.
-->

<template>
  <div>
    <h2>Use a password? </h2>
    <p>This will affect access to <code>{{ activeAgent.instance_id }}</code>,
       which has agent class <code>{{ activeAgent.agent_class }}</code>.</p>

    <div>
      <div class="subopt">
        <input type="radio" v-model="usePw" value="no" id="no" />
        <label for="no">Use basic access (no password).</label>
      </div>
      <div class="subopt">
        <input type="radio" v-model="usePw" value="yes" id="yes"/>
        <label for="yes">Use an access password:</label>
        <div class="subopt">

          <input type="radio"
                 v-model="pwScope" :disabled="usePw != 'yes'"
                 id="instance" value="instance"  />
          <label for="instance">Special password for this instance:</label>
          <div class="subopt">
            <input :disabled="usePw != 'yes' || pwScope != 'instance'"
             class="textbox"
             v-model="pwValues.instance" />
          </div>

          <input type="radio"
                 v-model="pwScope" :disabled="usePw != 'yes'"
                 id="class" value="class" />
          <label for="class">Special password for this agent class:</label>
          <div class="subopt">
            <input :disabled="usePw != 'yes' || pwScope != 'class'"
             class="textbox"
             v-model="pwValues.class" />
          </div>

          <input type="radio"
                 v-model="pwScope" :disabled="usePw != 'yes'"
                 id="global" value="global" />
          <label for="global">Global access password:</label>
          <div class="subopt">
            <input :disabled="usePw != 'yes' || pwScope != 'global'"
             class="textbox"
             v-model="pwValues.global" />
          </div>
        </div>
      </div>
    </div>

    <div class="buttonGroup">
      <button style="width: 200px" @click="confirm(true)">Ok</button>
      <button style="width: 200px" @click="confirm(false)">Cancel</button>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'PasswordConfig',
    data() {
      return {
        usePw: 'no',
        pwScope: 'global',
        pwValues: {},
      }
    },
    inject: ['accessEscalation', 'activeAgent'],
    emits: ["close"],
    methods: {
      confirm(keep) {
        if (keep) {
          if (this.usePw == 'yes') {
            window.ocs.passwords.update_pass(
              this.activeAgent, this.pwScope, this.pwValues);
            this.accessEscalation = 1;
          } else {
            this.accessEscalation = 0;
          }
        }
        this.$emit('close');
      },
    },
    mounted() {
      let pws = window.ocs.passwords.get_view(this.activeAgent);
      if (this.accessEscalation)
        this.usePw = 'yes';
      this.pwValues = pws;
      this.pwScope = pws.target;
    },
  }
</script>

<style scoped>
  .subopt {
    margin: 20px 30px;
  }

  .subopt .textbox {
    width: 100%;
  }
</style>

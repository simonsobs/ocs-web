<template>
  <h2>{{ opDetail.title }}</h2>
  <div class="holder ocs_ui">
    <div class="tabs">
      <div v-for="tab in tabs" v-bind:key="tab" :class="{inactive: detailTab!=tab}">
        <span
          @click="setDetailTab(tab)"
          :class="{inactive: detailTab!=tab}"
        >{{ tab }}</span>
      </div>
    </div>
    <br />
    <div class="scrollableContent">
      <div v-if="opDetail && detailTab=='session'">
        <p>Summary: {{ formatStatus(opDetail.data.session) }}</p>
        <p>Message buffer:</p>
        <div class="messageList">
          <div v-for="(row, index) in opDetail.data.session.messages" v-bind:key="index">
            {{ formatDate(row[0]) }} : {{ row[1] }}
          </div>
        <!-- pre>{{ opDetail.data.session.messages }}
             </pre -->
        </div>
      </div>
      <div v-if="opDetail && detailTab=='data'">
        <pre>{{ opDetail.data.session.data }}</pre>
      </div>
      <!-- div v-if="opDetail && detailTab=='docs'">
        {{ opDetail.docstring }}
      </div -->
    </div>
  </div>
  <div class="buttonGroup">
    <button style="width: 200px" @click="this.$emit('close')">Ok</button>
  </div>
</template>

<script>
  export default {
    name: 'OpDetail',
    props: {
      opDetail: Object,
    },
    emits: ["close"],
    data: function () {
      return {
        tabs: ['session', 'data'],
        detailTab: 'session',
      }
    },
    methods: {
      setDetailTab(option) {
        this.detailTab = option;
      },
      formatDate(t) {
        return new Date(t * 1000).toISOString().replace('T', ' ').replace('Z', '');
      },
      formatStatus(session) {
        return window.ocs_bundle.web.get_status_string(session);
      },
    },
  }
</script>

<style scoped>

  .tabs > div {
    display: inline;
    border: solid black 1px;
    padding: 10px;
    width: 50px;
  }
  .tabs {
    margin: 10px 0px;
  }
  .inactive {
    background-color: #ddd;
  }

  .holder {
    overflow: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    max-height: 70vh;
  }
  .scrollableContent {
    overflow-y: auto;
    flex-grow: 1;
  }
  .buttonGroup button {
    display: inline-block;
  }
</style>

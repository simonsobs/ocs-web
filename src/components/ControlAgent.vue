<template>
  <div class="control">
    <p>This is a control</p>
    <button @click="go">Go</button>
    <p>{{ msg }}</p>
  </div>
</template>

<script>
  //let autobahn = require('autobahn');

  export default {
    name: 'ControlAgent',
    props: {
      msg: String
    },
    methods: {
      go: function() {
        window.client.run_task('delay_task', {delay: 10});
      }
    }    
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

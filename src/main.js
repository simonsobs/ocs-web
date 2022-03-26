import { createApp } from 'vue'
import App from './App.vue'
import './assets/ocs-ui.css'

const app = createApp(App);

// Import standard OCS layout things.

import OcsTask        from './components/OcsTask.vue'
import OcsProcess     from './components/OcsProcess.vue'
import OpParam        from './components/OpParam.vue'
import OpReading      from './components/OpReading.vue'
import OpStatus       from './components/OpStatus.vue'
import OpSelect       from './components/OpDropdown.vue'
import ProgressBar    from './components/ProgressBar.vue'
import OcsOpAutofill  from './components/OcsOpAutofill.vue'

app
  .component('OcsTask',     OcsTask)
  .component('OcsProcess',  OcsProcess)
  .component('OpParam',     OpParam)
  .component('OpReading',   OpReading)
  .component('OpStatus',    OpStatus)
  .component('OpSelect',    OpSelect)
  .component('ProgressBar', ProgressBar)
  .component('OcsOpAutofill', OcsOpAutofill)
;
 
  
app.mount('#app');

import { createApp } from 'vue'
import App from './App.vue'
import './assets/ocs-ui.css'

const app = createApp(App);

// Import standard OCS layout things.

import OcsTask        from './components/OcsTask.vue'
import OcsProcess     from './components/OcsProcess.vue'
import OpParam        from './components/OpParam.vue'
import OpDropdown     from './components/OpDropdown.vue'
import OpReading      from './components/OpReading.vue'
import OpStatus       from './components/OpStatus.vue'
import OpSelect       from './components/OpDropdown.vue'
import ProgressBar    from './components/ProgressBar.vue'
import OcsOpAutofill  from './components/OcsOpAutofill.vue'
import OpLocker       from './components/OpLocker.vue'

app
  .component('OcsTask',     OcsTask)
  .component('OcsProcess',  OcsProcess)
  .component('OpParam',     OpParam)
  .component('OpDropdown',  OpDropdown)
  .component('OpReading',   OpReading)
  .component('OpStatus',    OpStatus)
  .component('OpSelect',    OpSelect)
  .component('ProgressBar', ProgressBar)
  .component('OcsOpAutofill', OcsOpAutofill)
  .component('OpLocker',    OpLocker)
;

// This is needed in vue<3.3 to use computed function with provide/inject
app.config.unwrapInjectedRef = true;
  
app.mount('#app');

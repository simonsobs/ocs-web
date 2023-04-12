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
import OpPrivs        from './components/OpPrivs.vue'
import OcsAgentHeader from './components/OcsAgentHeader.vue'
import OcsLightLine   from './components/OcsLightLine.vue'
import OcsLight       from './components/OcsLight.vue'

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
  .component('OpPrivs',     OpPrivs)
  .component('OcsAgentHeader', OcsAgentHeader)
  .component('OcsLightLine', OcsLightLine)
  .component('OcsLight',    OcsLight)
;

// Font/icon stuff.
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faLock, faUnlock, faUser, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
library.add(faLock, faUnlock, faUser, faUserGraduate)

app.component('font-awesome-icon', FontAwesomeIcon);

// This is needed in vue<3.3 to use computed function with provide/inject
app.config.unwrapInjectedRef = true;

// Pull the config file first, then mount the app.
fetch("config.json")
  .then(
    (response) => response.json(),
    (response) => {
      // If you build dist and load in browser at file:// url, that
      // can cause CORS errors.
      console.log('ocs-web: config.json could not be loaded -- '
                + 'probably a CORS issue?');
      console.log(response);
      return {};
    }
  )
  .then(
    (config) => config,
    () => {
      console.log("ocs-web: failed to parse config.json.");
      return {};
    }
  )
  .then(
    (config) => {
      window.config = config;
      app.mount("#app")
  });

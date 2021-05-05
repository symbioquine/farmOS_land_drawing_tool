import Vue from 'vue';

import AsyncComputed from 'vue-async-computed';

Vue.use(AsyncComputed);

/* eslint-disable-next-line import/first */
import importAll from './import-vue-components';

importAll(require.context('./components/', true, /\.vue$/));

/* eslint-disable-next-line import/first */
import App from './App.vue';


new Vue({
  render: h => h(App),
}).$mount('#farm-land-drawing-tool-app');

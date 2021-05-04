import Vue from 'vue';

import App from './App.vue';

import importAll from './import-vue-components';

const fields = importAll(require.context('./components/', true, /\.vue$/));


new Vue({
  render: h => h(App),
}).$mount('#farm-land-drawing-tool-app');

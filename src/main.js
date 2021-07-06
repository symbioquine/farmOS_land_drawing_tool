/* eslint-disable import/first, import/newline-after-import */

import Vue from 'vue';

import AsyncComputed from 'vue-async-computed';
Vue.use(AsyncComputed);

import PortalVue from 'portal-vue';
Vue.use(PortalVue);


import importAll from './import-vue-components';

importAll(require.context('./components/', true, /\.vue$/));


import App from './App.vue';

// Wait until all attached Drupal libraries get loaded
document.addEventListener('DOMContentLoaded', () => {
  new Vue({
    render: h => h(App),
  }).$mount('#farm-land-drawing-tool-app');
});

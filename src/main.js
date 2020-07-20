import '@/assets/tailwind.css';
import 'firebase/analytics';
import * as firebase from 'firebase/app';
import Vue from 'vue';
import config from '../server/config';
import App from './App.vue';
import router from './router';


firebase.initializeApp(config);
firebase.analytics();

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');

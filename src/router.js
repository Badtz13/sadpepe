import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    // {
    //   path: '/user:name',
    //   component: () => import(/* webpackChunkName: "about" */ './views/User.vue'),
    // },
    {
      path: '/data/:user',
      component: () => import(/* webpackChunkName: "about" */ './views/Data.vue'),
    },
  ],
});

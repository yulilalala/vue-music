import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import fastclick from 'fastclick'
import router from './router'
import store from './store'

// 引入插件监听手机上的物理返回键
import mui from 'vue-awesome-mui'
Vue.use(mui);

// const express=require('express')
// import router from './router'

// Vue.config.productionTip = false

// 懒加载
import VueLazyLoad from "vue-lazyload"
Vue.use(VueLazyLoad,{
  loading:require('common/image/default.png')
})

import 'common/stylus/index.styl'

fastclick.attach(document.body)

new Vue({
  el: '#app',
  render: h => h(App),
  store,
  router
  
})

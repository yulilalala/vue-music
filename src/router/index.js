import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)
import VueRouter from 'vue-router';
// const routerPush = VueRouter.prototype.push
// VueRouter.prototype.push = function push(location) {
//   return routerPush.call(this, location).catch(error=> error)
// }
Vue.use('VueRouter');


import Recommend from 'components/recommend/recommend';
import Singer from 'components/singer/singer';
import Search from 'components/search/search';
import Rank from 'components/rank/rank';
import SingerDetail from 'components/singer-detail/singer-detail';
import Disc from 'components/disc/disc';
import TopList from 'components/top-list/top-list';
import UserCenter from 'components/user-center/user-center';


/* 由同步加载变成异步加载 */
// const Recommend=(resolve)=>{
//   import('components/recommend/recommend').then((module)=>{
//     resolve(module);
//   })
// }


export default new Router({
  routes: [{
      path: '/',
      redirect: '/recommend'
    },
    {
      path: '/recommend',
      component: Recommend,
      name: 'Recommend',
      children: [{
        path: ':id',
        component: Disc
      }]
    },
    {
      path: '/singer',
      component: Singer,
      name: 'Singer',
      children: [{
        path: ':id',
        component: SingerDetail
      }]
    },
    {
      path: '/rank',
      component: Rank,
      children: [{
        path: ':id',
        component: TopList
      }]
    },
    {
      path: '/search',
      component: Search,
      children:[
        {path:':id',component:SingerDetail}
      ]
    },
    {
       path:'/user',
       component:UserCenter
    }
  ]
})

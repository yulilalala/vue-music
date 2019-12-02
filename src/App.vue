<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <tab></tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script type='text/esmascript-6'>
  import MHeader from 'components/m-header/m-header'
  import Tab from 'components/tab/tab'
  import Player from 'components/player/player'
  export default{
    components:{
      MHeader,
      Tab,
      Player
    },
    watch: {
    	$route: {
    		deep: true,
    		immediate: true,
    		handler: function(value) {
    			//跳到下一页时，页面回到顶部
    			document.body.scrollTop = 0
    			document.documentElement.scrollTop = 0
    			//弹出退出提示
    			let vm = this
    			if (value.path === '/recommend' || value.path === '/singer' || value.path === '/rank' || value.path ===
    				'/search') {
    				var first = null;
    				mui.back = function() {
    					if (!first) {
    						first = new Date().getTime();
    						mui.toast('再按一次返回键退出应用');
    						setTimeout(function() {
    							first = null;
    						}, 1000);
    					} else {
    						if (new Date().getTime() - first < 1000) {
    							plus.runtime.quit();
    						}
    					}
    				}
    			} else {
    				mui.back = function() {
    					vm.$router.go(-1)
    				}
    			}
    		}
    	}
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>

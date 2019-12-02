<!-- 搜索页 -->
<template>
	<div class="search">
		<div class="search-box-wrapper">
			<search-box ref="searchBox" @query='onChangeQuery'></search-box>
		</div>

		<div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" class="shortcut" ref="shortcut" :data="shortcut">
        <!-- scroll只能根据一块内容的长度来实现滚动的，所以这里要在这两个盒子外层再加一个div -->
          <div >
            <div class="hot-key">
              <h1 class="title">热门搜索</h1>
              <ul>
                <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                  <span>{{item.k}}</span>
                </li>
              </ul>
            </div>
            <div class="search-history" v-show="searchHistory.length">
              <h1 class="title">
                <span class="text">搜索历史</span>
                <span class="clear" @click="showConfirm">
                  <i class="icon-clear"></i>
                </span>
              </h1>
              <!-- 搜索历史列表（这里面有动画效果，要给scroll组件加一个refreshDelay） -->
              <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
            </div>
          </div>
      </scroll>


		</div>
		<div ref="searchResult" class="search-result" v-show="query">
      <!-- 当搜索框内有搜索词时展示根据搜索词推荐的歌曲列表 -->
			<suggest ref="suggest" :query='query' @listScroll='blurInput' @select="saveSearch"></suggest>
		</div>

    <!-- 弹框 -->
    <confirm ref="confirm" text="是否清空所有搜索历史？" confirmBtnText="清空" @confirm="clearHistory"></confirm>
    <!-- 二级路由 -->
    <router-view></router-view>

	</div>

</template>

<script>
import SearchBox from 'base/search-box/search-box';
import { getHotKey } from 'api/search';
import { ERR_OK } from 'api/config';
import Suggest from 'components/suggest/suggest';
import {mapActions,mapGetters} from 'vuex';
import SearchList from 'base/search-list/search-list';
import {playlistMixin,searchMixin} from 'common/js/mixin';
import Confirm from 'base/confirm/confirm';
import Scroll from 'base/scroll/scroll';


export default {
  mixins:[playlistMixin,searchMixin],
	data() {
		return {
			hotKey: [],
			// query:''
      refreshDelay:100
		};
	},
	components: {
		SearchBox,
		Suggest,
    SearchList,
    Confirm,
    Scroll
	},
	created() {
		this._getHotKey();
	},
  computed:{
    /* 因为scroll包裹的两个盒子的数据都是异步请求的，单独传哪一个都不合适，所以这里用一个计算属性，将它传给scroll组件，当其中任何一个数据改变时都能让scroll组件重新计算实现而滚动*/
    shortcut(){
      return this.hotKey.concat(this.searchHistory)
    },
    ...mapGetters([
      'searchHistory'
    ])
  },
  watch:{
    query(newQuery){
      // 当搜索完返回的时候，query的值从有到无的时候
      if(!newQuery){
        setTimeout(()=>{
          // 手动刷新scroll组件
          this.$refs.shortcut.refresh()
        },20)
      }
      // 当监听到搜索词改变且搜索词不为空时，保存搜索历史到vuex的state状态中
      if(newQuery){
         this.saveSearchHistory(this.query)
      }

    }
  },
	methods: {
    handlePlayList(playList){
      const bottom=playList.length>0?'60px':'';
      this.$refs.shortcutWrapper.style.bottom=bottom;
      // 调用scroll组件的refresh()方法刷新重新计算高度
      this.$refs.shortcut.refresh();
      this.$refs.searchResult.style.bottom=bottom;
      // 调用suggest组件中的refresh()方法（其中实现的是让suggest组件中的srcoll刷新重新计算高度）
      this.$refs.suggest.refresh();
    },
    /* 删除所有历史记录*/
    clearHistory(){
      this.clearSearchHistory()
    },
    /* 点击垃圾桶按钮显示弹框*/
    showConfirm(){
      this.$refs.confirm.show()
    },
    /* 删除单个数据*/
    deleteSearchHistory(item){
      this.deleteSearchHistory(item)
    },
    // action中的方法可以直接用在dom上，只要参数相同即可（不用另外写一个方法去调用action方法，可直接使用），已经给这个vue实例添加了这方法
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ]),
	// 这些方法都写在mixin中了
    /* saveSearch(){
      this.saveSearchHistory(this.query)
    },
    blurInput(){
      // 访问子组件中的blur方法,向上滚动列表时使输入框失去焦点，这样就可以隐藏手机上的键盘
      this.$refs.searchBox.blur()
    },
		onChangeQuery(query){
			this.query=query;
		}, */
		/* addQuery(query){
			// 调用searchBox组件中的方法
			this.$refs.searchBox.setQuery(query);
		}, */
		_getHotKey() {
			getHotKey().then(res => {
				if (res.code === ERR_OK) {
					console.log(res.data.hotkey);
					// 截取前10个数据
					this.hotKey = res.data.hotkey.slice(0,10);
				}
			});
		}
	},

};
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>

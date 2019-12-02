<!-- 添加歌曲到歌曲播放队列页面 -->
<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <!-- query方式是search-box监听到搜索词改变时向外派发的方法 -->
        <search-box ref="searchBox" placeholder="搜索歌曲" @query='onChangeQuery'></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :switches='switches' :currentIndex='currentIndex' @switch="switchItem"></switches>
        <div class="list-wrapper">
          <!-- 当点第一个按钮时展示最近播放列表 -->
          <scroll ref="songList" class="list-scroll" v-if="currentIndex===0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs='playHistory' @select="selectSong"></song-list>
            </div>
          </scroll>
          <!-- 当点击第二个按钮时展示搜索播放历史按钮 -->
          <scroll :refreshDelay='refreshDelay' ref="searchList" class="list-scroll" v-if="currentIndex===1" :data="searchHistory">
            <div class="list-inner">
              <!-- 搜索列表 -->
              <search-list :searches="searchHistory" @delete="deleteItem" @select="addQuery"></search-list>
            </div>
          </scroll>
        </div>
      </div>
       <!-- 当有搜索词是展示搜索列表 -->
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经加入播放队列了</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box';
import Suggest from 'components/suggest/suggest';
import {searchMixin} from 'common/js/mixin';
import Switches from 'base/switches/switches';
import Scroll from 'base/scroll/scroll';
import {mapGetters,mapActions} from 'vuex';
import SongList from 'base/song-list/song-list';
import Song from 'common/js/song';
import SearchList from 'base/search-list/search-list';
import TopTip from 'base/top-tip/top-tip';

export default{
  mixins:[searchMixin],
  watch:{
    query(newQuery){
      if(!newQuery){
        return
      }
      this.saveSearchHistory(newQuery);
    }
  },
  data(){
    return {
      showFlag:false,
      // query:'',
      showSinger:false,
      currentIndex:0,
      switches:[
        {name:'最近播放'},
        {name:'搜索历史'}
      ],
      refreshDelay:100
    }
  },
  computed:{
    ...mapGetters([
      'playHistory',
      'searchHistory',
    ])
  },
  methods:{
    /* 点击搜索历史中的某一项，将搜索词添加到搜索框*/
    addQuery(item){
      this.$refs.searchBox.setQuery(item);
    },
    /* 从搜索历史中删除一项*/
    deleteItem(item){
      this.deleteSearchHistory(item)
    },
    ...mapActions([
      'insertSong',
      'deleteSearchHistory',
      'saveSearchHistory'
    ]),
    /* 选择一首歌曲插入到歌曲播放队列*/
    selectSong(song, index){
      if(index!==0){
        // 从playHistory中获取到的song还是一个对象，虽然具有song的属性，但是并不是一个Song的实例，这里需要引入一个Song类转化成一个song的实例
        this.insertSong(new Song(song));
      }
      // 当点击的某项的时候打开顶部提示框
      this.showtopTip()
    },
    showtopTip(){
       this.$refs.topTip.show();
     },
    // 在mixin中
    // search(query){
    //   this.query=query;
    // },
    show(){
      this.showFlag=true;
      setTimeout(()=>{
        if(this.currentIndex===0){
          // 当点击第一个按钮时刷新最近播放列表的scroll，重新计算长度
          this.$refs.songList.refresh()
        }else{
          this.$refs.searchList.refresh()
        }
      },20)
    },
    hide(){
      this.showFlag=false;
    },
   /* 当搜索时点击搜索列表的某一项*/
    selectSuggest(){
       //保存搜索记录到本地存储，调用searchMixin中共用的保存上搜索记录到本地的方法
      this.saveSearch();
      // 当点击的某项的时候打开顶部提示框
      this.showtopTip();
    },
    /* 当点击按钮时把按钮的索引传给currentIndex，这样就能让当前点击的按钮添加一个active类*/
    switchItem(index){
      this.currentIndex=index;
    }

  },
  components:{
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .add-song
    position: fixed
    top: 0
    bottom: 0
    width: 100%
    z-index: 200
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .header
      position: relative
      height: 44px
      text-align: center
      .title
        line-height: 44px
        font-size: $font-size-large
        color: $color-text
      .close
        position: absolute
        top: 0
        right: 8px
        .icon-close
          display: block
          padding: 12px
          font-size: 20px
          color: $color-theme

    .search-box-wrapper
      margin: 20px
    .shortcut
      .list-wrapper
        position: absolute
        top: 165px
        bottom: 0
        width: 100%
        .list-scroll
          height: 100%
          overflow: hidden
          .list-inner
            padding: 20px 30px
    .search-result
      position: fixed
      top: 124px
      bottom: 0
      width: 100%
    .tip-title
      text-align: center
      padding: 18px 0
      font-size: 0
      .icon-ok
        font-size: $font-size-medium
        color: $color-theme
        margin-right: 4px
      .text
        font-size: $font-size-medium
        color: $color-text
</style>

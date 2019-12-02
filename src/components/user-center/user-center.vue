<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :currentIndex='currentIndex' :switches='switches' @switch='switchItem'></switches>
      </div>
      <div ref="playBtn" class="play-btn" @click="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <!-- 当点第一个按钮时展示我喜欢的列表 -->
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs='favoriteList' @select="selectSong"></song-list>
          </div>
        </scroll>
        <!-- 当点击第二个按钮时展示最近听的列表 -->
        <scroll ref="playHistory" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
          <div class="list-inner">
            <!-- 最近听的列表 -->
            <song-list :songs='playHistory' @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper">
        <no-result v-show="NoResult" :title="NoResultDesc"></no-result>
      </div>

    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import Switches from 'base/switches/switches';
import {mapGetters,mapActions} from 'vuex';
import SongList from '../../base/song-list/song-list';
import Scroll from 'base/scroll/scroll';
import Song from 'common/js/song';
import {playlistMixin} from 'common/js/mixin';
import NoResult from 'base/no-result/no-result';
export default{
  // 记得不要加引号
  mixins:[playlistMixin],
  data(){
    return {
      currentIndex:0,
      switches:[
        {name:'我喜欢的'},
        {name:'最近听的'}
      ]
    }
  },
  computed:{
    ...mapGetters([
      'favoriteList',
      'playHistory',
      'playlist',
    ]),
    NoResult(){
      if(this.currentIndex===0){
        return !this.favoriteList.length
      }else{
        return !this.playHistory.length
      }
    },
    NoResultDesc(){
      if(this.currentIndex===0){
        return '暂无收藏歌曲'
      }else{
        return '你还没有播放过歌曲'
      }
    }
  },
  components:{
    Switches,
    SongList,
    Scroll,
    NoResult
  },
  methods:{
    /* 如果有播放列表，则给列表的bottom样式设为60px*/
    handlePlayList(playList){
      // playList在mixin中用mapGetters映射引入了
      const bottom= playList.length>0?'60px':'';
      this.$refs.listWrapper.style.bottom=bottom;
      // 先判断一下是否有该列表，有的话就刷新一下
      this.$refs.favoriteList&&this.$refs.favoriteList.refresh();
      this.$refs.playHistory&&this.$refs.playHistory.refresh();
    },
    /* 随机播放全部*/
    random(){
      let list=this.currentIndex===0?this.favoriteList : this.playHistory;
      if(list.length===0){
        return
      }
      // 从localStorage中取出来的数据不是一个song实例，不具有Song的方法，我们要先将其实例化
      // 映射为所有歌曲的Song实例数组返回
      list=list.map((song)=>{
        return new Song(song)
      })
      this.randomPlay({
        list
      })
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ]),
    selectSong(song){
      this.insertSong(song);
    },
    back(){
      this.$router.back();
    },
    switchItem(index){
      this.currentIndex=index
    }
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"

  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

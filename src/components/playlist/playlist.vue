<!-- 点击迷你播放器右边的歌单列表展示的页面 -->
<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <!-- 这里的@click.stop什么回调函数都不写，只是为了阻止冒泡，没有其他作用 -->
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click.stop="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
        </div>
        <scroll :refreshDelay='refreshDelay' ref="listContent" :data="sequenceList" class="list-content">
          <transition-group name="list" tag="ul">
            <li ref="listItem" class="item" v-for="(item,index) in sequenceList" :key="item.id" @click="selectItem(item,index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
                <span class="text">{{item.name}}</span>
                <span class="like" @click.stop="toggleFavotite(item)">
                  <i class="icon" :class="getFavoriteIcon(item)"></i>
                </span>
                <span class="delete" @click.stop="deleteOne(item)">
                  <i class="icon-delete"></i>
                </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" @confirm="confirmClear" text="是否清空播放列表？" confirmBtnText="清空"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import {mapActions} from 'vuex';
import Scroll from 'base/scroll/scroll';
import {playMode} from 'common/js/config';
import Confirm from 'base/confirm/confirm';
import {playerMixin} from 'common/js/mixin';
import AddSong from 'components/add-song/add-song';
export default{
  mixins:[playerMixin],
  data(){
    return {
      showFlag:false,
      // 因为这里删除或增加一条数据（高度减10）时有一个100毫秒的动画效果，所以要让scroll组件100毫秒之后再重新计算一次高度
      refreshDelay:100
    }
  },
  computed:{
    // ...mapGetters([
    //   'sequenceList',
    //   'currentSong',
    //   'mode',
    //   'playList'
    // ])
    modeText(){
      return this.mode===playMode.sequence?'顺序播放' : this.mode===playMode.random ?'随机播放':'单曲循环'
    }
  },
  watch:{
    /* 监测到当前歌曲改变就调用scrollToCurrent方法，将当前歌曲滚动到顶部*/
    currentSong(newSong,oldSong){
      // 如果歌曲列表没打开或id没变则退出函数
      if(!this.showFlag||newSong.id===oldSong.id){
        return;
      }
      this.scrollToCurrent(newSong);
    }
  },
  methods:{
    /* 点击“添加歌曲到队列”，调用add-song组件中的show方法打开添加歌曲界面*/
    addSong(){
        this.$refs.addSong.show();
    },
    /* 点击了垃圾桶按钮就弹出提示框*/
    showConfirm(){
      this.$refs.confirm.show()
    },
    /* 如果点击了弹框的清空按钮，则触发该方法，清空列表*/
    confirmClear(){
      this.deleteSongList();
      this.hide();
    },
    /* 删除单项歌曲*/
    deleteOne(item){
      this.deleteSong(item);
      /* 要不然歌曲正在播放播放状态却显示一个点击播放的图标，对应不上，到action中设置playingState更合理*/
      // this.setPlayingState(true);
      if(!this.playList.length){
        this.hide();
      }
    },
    /* 滚动到当前播放的歌曲（到顶部）*/
    scrollToCurrent(currentSong){
      const index=this.sequenceList.findIndex((song)=>{
        return song.id===currentSong.id
      })
      // 注意：这里的listItem是一个li元素的数组
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index],300)
    },
    /* 当点击某一歌曲项时调用该方法改变vuex中的值*/
    selectItem(item,index){
      if(this.mode===playMode.random){
        // 如果为随机播放模式，则先要找到对应的索引
        index=this.playList.findIndex((song)=>{
          return song.id===item.id;
        })
      }
      this.setCurrentIndex(index);
      this.setPlayingState(true);
    },
    ...mapActions([
      'deleteSong',
      'deleteSongList'
    ]),
    // 在mixin中复用了
    // ...mapMutations({
    //   setCurrentIndex:'SET_CURRENT_INDEX',
    //   setPlayingState:'SET_PLAYING_STATE'
    // }),
    /* 设置当前正在播放图标的类*/
    getCurrentIcon(item){
      if(this.currentSong.id===item.id){
         return 'icon-play'
      }
      return ''
      // return this.currentSong.id===item.id?'icon-play' : ''
    },
    show(){
      this.showFlag=true;
      // this.$refs.listContent.refresh();
      // 延时20毫秒保证在dom渲染完成后scroll进行计算
      setTimeout(()=>{
        this.$refs.listContent.refresh();
        // 当列表当打开的时候也将当前歌曲滚动至顶部
        this.scrollToCurrent(this.currentSong);
      },20)

    },
    hide(){
      this.showFlag=false;
    }
  },
  components:{
    Scroll,
    Confirm,
    AddSong
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .playlist
  // 全屏铺满
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d
    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s
      .list-wrapper
        transition: all 0.3s
    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0
      .list-wrapper
        transform: translate3d(0, 100%, 0)
    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background
      .list-header
        position: relative
        padding: 20px 30px 10px 20px
        .title
          display: flex
          align-items: center
          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d
          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l
          .clear
            extend-click()
            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d
      .list-content
        max-height: 240px
        overflow: hidden
        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden
          &.list-enter-active, &.list-leave-active
            transition: all 0.1s linear
          &.list-enter, &.list-leave-to
            height: 0
          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d
          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-l
          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme
            .icon-favorite
              color: $color-sub-theme
          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme
      .list-operate
        width: 140px
        margin: 20px auto 30px auto
        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l
          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s
          .text
            font-size: $font-size-small
      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l
</style>

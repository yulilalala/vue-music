<!-- 顶部提示 -->
<template>
  <transition name="drop">
    <!-- 可以在打开提示框两秒后自动关闭，也可以点击它立即关闭 -->
    <div class="top-tip" v-show="showFlag" @click.stop="hide">
      <slot></slot>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
export default{
  props:{
    // 这样就可以从外部控制提示框隐藏的时间
    delay:{
      type:Number,
      default:2000
    }
  },
  data(){
    return{
      showFlag:false
    }
  },
  methods:{
    show(){
      this.showFlag=true;
      // 每次调用show方法时都会打开一个定时器，所以要在每次开启一个定时器之前先清理掉之前的定时器（如多次点击歌曲时，timer只会执行一次）
      clearTimeout(this.timer);
      // 打开提示框两秒之后自动关闭提示框
      this.timer=setTimeout(()=>{
        this.hide();
      },this.delay )
    },
    hide(){
      this.showFlag=false;
    }
  }
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"

 .top-tip
   position: fixed
   top: 0
   width: 100%
   z-index: 500
   background: $color-dialog-background
   &.drop-enter-active, &.drop-leave-active
     transition: all 0.3s
   &.drop-enter, &.drop-leave-to
     transform: translate3d(0, -100%, 0)
</style>

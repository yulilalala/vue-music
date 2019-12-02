
<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    @scroll="scroll"
    :probeType="probeType"
  >
    <ul>
      <li v-for="(group,index) in data" :key="index" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item" v-for="item in group.items" :key="item.id" @click="selectItem(item)">
            <img class="avatar" v-lazy="item.avatar" alt />
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          class="item"
          v-for="(item,index) in shortcutList"
          :key="index"
          :data-index="index"
          :class="{'current':currentIndex===index}"
        >{{item}}</li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="loading-container" v-if='!data.length'>
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from "base/scroll/scroll";
import { getData } from "common/js/dom";
import Loading from "base/loading/loading";
const ACHOR_HEIGHT = 18;
const TITLE_HEIGHT=30;
export default {
  created() {
    this.touch = {}; //将touch放在这而不是放在data或props中，是因为我们并不要检测touch的变化，而是方便以下方法的共享使用
    this.listenScroll = true;
    this.listHeight = [];
    this.probeType = 3;
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList() {
      return this.data.map(group => {
        //将原数组映射成新的数组并返回
        return group.title.substr(0, 1); //substr() 的参数指定的是子串的开始位置和长度
      });
    },
    fixedTitle(){     //向最上方滑时标题为空
      if(this.scrollY>0){
        return ''
      }
      return this.data[this.currentIndex]?this.data[this.currentIndex].title:'';
      this.$refs.fixed.style.transform=`translate3d(0,${fixedTop}px,0)`
    }
  },
  data() {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff:-1
    };
  },
  methods: {
		refresh(){
			this.$refs.listview.refresh();
		},
    selectItem(item){
      this.$emit('select', item) // 向外派发事件
    },
    onShortcutTouchStart(event) {
      let anchorIndex = getData(event.target, "index");
      let firstTouch = event.touches[0];   // 刚开始触碰的位置坐标
      this.touch.y1 = firstTouch.pageY;
      this.touch.anchorIndex = anchorIndex;

      this._scrollTo(anchorIndex);
    },
    onShortcutTouchMove(event) {  // 屏幕滑动方法,要明确开始滚动和结束滚动的两个位置,然后计算出滚动到哪一个字母
      let firstTouch = event.touches[0];   // 停止滚动时的位置坐标
      this.touch.y2 = firstTouch.pageY;   // 保存到touch对象中
      let delta = (this.touch.y2 - this.touch.y1) / ACHOR_HEIGHT | 0;  // 计算滚动了多少个字母
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta;  // 通过getData方法的到的anchorIndex是一个字符串，记得要用parseInt转化为数字
      // console.log(anchorIndex);
      this._scrollTo(anchorIndex);    // 跳转到字母位置
    },
    scroll(pos) {
      this.scrollY = pos.y;
    },
    _scrollTo(index) {      
      // console.log(index)
      if (!index && index !== 0) {  // 点击以外的部分 无反应
        return;
      }
      if(index<0){  // 滑动到顶部时 index为负
        index=0
      }else if(index>this.listHeight.length-2){
        index=this.listHeight.length-2
      }
      this.scrollY = -this.listHeight[index]; //等于上限 // 每次点击都更改scrollY以实现同步
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
    },
    _calculateHeight() {
      this.listHeight = [];
      const list = this.$refs.listGroup;
      let height = 0;
      this.listHeight.push(height);
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        height += item.clientHeight;
        this.listHeight.push(height);   //得到一个包含每一个group高度的数组
      }
    }
  },
  watch: {
    data() {
      setTimeout(() => {  // 数据变化到dom变化有一个延迟，所以这个加一个定时器
        this._calculateHeight();   // 计算每一个group的高度
      }, 20);
    },
    scrollY(newY) {      //本页的难点，左右联动;确定currentIndex,通过判断左边currentIndex与右边字母索引的index相等而添加样式类
      //通过better-sroll拿到的scrollY,向上滚动newY是一个负值
      const listHeight = this.listHeight;
      // 当滚动到顶部newY大于0
      if (newY > 0) {
        this.currentIndex = 0;
        return;
      }
      //在中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let listHeight1 = listHeight[i];   //下限(最低值)
        let listHeight2 = listHeight[i + 1];   //上限（最高值）
        if (-newY >= listHeight1 && -newY < listHeight2) {
          this.currentIndex = i;
          // console.log(this.currentIndex);
          this.diff=listHeight2+(-newY)
          return;
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2;
    },
    diff(newVal){     
      let fixedTop=(newVal>0&&newVal<TITLE_HEIGHT)?newVal-TITLE_HEIGHT:0;
      if(this.fixedTop===fixedTop){     //不理解
        return
      }
      this.fixedTop=fixedTop
    }
  },
  components: {
    Scroll,
    Loading
  }
};
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
@import '~common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
<template>
  <div class="recommend" ref='recommendList'>
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="silder-wrapper">
          <slider>
            <div v-for="(item,index) in recommends" :key="index">
              <a href="javascript:;">
                <img class="needsclick" @load="loadImage" :src="getImage(item)" />
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list" >
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="(item,index) in discList" :key="index" class="item" @click="selectItem(item)">
              <div class="icon">
                <img width="60px" height="60px" v-lazy="item.cover" />
              </div>
              <div class="text">
                <h2 class="name" v-html="item.username"></h2>
                <p class="desc" v-html="item.title"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
		<!-- 这里是二级路由对应的一个容器，放Disc组件 -->
    <router-view></router-view>
  </div>
</template>
 <script>
import { getRecommend, getDiscList } from "api/recommend";
import { ERR_OK } from "api/config";
import Slider from "base/slider/slider";
import Scroll from "base/scroll/scroll";
import Loading from "base/loading/loading";
import {playlistMixin} from 'common/js/mixin';
import {mapMutations} from 'vuex';
export default {
	mixins:[playlistMixin],
  data() {
    return {
      recommends: ['slider1.jpg','slider2.jpg','slider3.jpg'],
      discList: []
    };
  },
  created() {
    this._getRecommend()
    // setTimeout(()=>{
    //   this._getDiscList()
    // },20)
     this._getDiscList()

  },
  methods: {
    getImage(item){
       return `static/${item}`
    },
		...mapMutations({
			//获取mutation中的'SET_DISC'方法
			setDisc:'SET_DISC'
		}),
		//当音乐播放时，使用mixin处理列表不能完全显示的问题
		handlePlayList(playList){
			const bottom=playList.length>0 ? '60px' : '';
			this.$refs.recommendList.style.bottom=bottom;
			// 让scroll刷新重新计算一次
			this.$refs.scroll.refresh();
		},
		/* 点击列表项实现二级路由跳转*/
		selectItem(item){
			this.$router.push(
			{
				path:`/recommend/${item.content_id}`
				//传参方法：query:{id:1}
			}
			)
			//调用vuex中的方法记得其前面加this
			this.setDisc(item);
		},
    _getRecommend() {
      getRecommend().then(res => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider;
          // console.log(this.recommends);
        }
      });
    },
    _getDiscList() {
      // 这是个调的代理接口，这里我们不用，我们用真实的qq接口
      getDiscList().then((res) => {
        // this.discList = res.data.list
				// console.log(this.discList)
        this.discList = res.recomPlaylist.data.v_hot
      })
      // getDiscList1().then((res) => {
        // this.discList = res.recomPlaylist.data.v_hot

      // })
    },
    loadImage(){
      if(!this.checkLoaded){
           this.$refs.scroll.refresh()
           this.checkLoaded=true
      }

    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
};
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    height: 100%;
    overflow: hidden;

    .slider-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-theme;
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;   // 垂直方向居中
        padding: 0 20px 20px 20px;
        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column; // 纵向排列
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>

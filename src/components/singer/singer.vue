<template>
  <div class="singer" ref='singerList'>
    <list-view :data="singers" @select="selectSinger" ref='singer'></list-view>
    <router-view></router-view>
  </div>
</template>

<script>
import { getSingerList } from "api/singer";
import { ERR_OK } from "api/config";
import Singer from "common/js/singer";
const HOT_NAME = "热门数据";
const HOT_SINGER_LEN = 10;
import ListView from "base/listview/listview";
import {mapMutations} from 'vuex';
import {playlistMixin} from 'common/js/mixin';

export default {
	mixins:[playlistMixin],
  data() {
    return {
      singers: []
    };
  },
  created() {
    this._getSingerList();
  },
  methods: {
		handlePlayList(playList){
			const bottom = playList.length>0 ? '60px' : '';
			// console.log(bottom);
			this.$refs.singerList.style.bottom = bottom;
			// this.$refs.singerList.style.backgroundColor='pink';
			this.$refs.singer.refresh();
		},
    ...mapMutations({
      setSinger:'SET_SINGER'
    }),
    selectSinger(singer){
     this.$router.push({
        path: `/singer/${singer.id}`  // 跳转页面
     });
     this.setSinger(singer)
    },
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singers = this._normalLizeSinger(res.data.list);
          // console.log(this.singers)
          // console.log(this._normalLizeSinger(res.data.list);
        }
      });
    },
    _normalLizeSinger(list) {
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        },
      };
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(
            new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            })
          );
        }
        const key = item.Findex;
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        map[key].items.push(
          new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          })
        );
      });
      // console.log(map);

      //为了得到有序列表，我们需要处理map
      let hot=[]
      let ret=[]
      for(let key in map){
          let val=map[key];
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
      }
      ret.sort((a,b)=>{
          return a.title.charCodeAt(0)-b.title.charCodeAt(0)
      })
      return hot.concat(ret)
    }
  },
  components:{
    ListView
  }
};
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
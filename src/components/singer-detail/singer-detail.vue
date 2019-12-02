<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
  </transition>
</template>

<script type="ecmascript-6">
import { mapGetters } from "vuex";
import { getSingerDetail, getSongVkey } from "api/singer";
import { ERR_OK } from "api/config";
import { createSong } from "common/js/song";
import MusicList from "components/music-list/music-list";
import {getSongUrl} from "api/song.js"
export default {
  data() {
    return {
      songs: []
    };
  },
  mounted() {
//     let clientHeight = document.documentElement.clientHeight
//     console.log(clientHeight)
//     document.getElementsByClassName('singer-detail')[0].style.height = clientHeight + 'px'
//     console.log(document.getElementsByClassName('singer-detail')[0])
  },
  created() {
    // console.log(this.singer);
    this._getSingerDetail();
  },
  computed: {
    title() {
      return this.singer.name;
    },
    bgImage() {
      return this.singer.avatar;
    },
    ...mapGetters(["singer"])
  },
  methods: {
    _getSingerDetail() {
      if (!this.singer.id) {
        this.$router.push("/singer");
        return;
      }
      // console.log(1)
      getSingerDetail(this.singer.id).then(res => {
        // console.log(this.singer.id)
        // console.log(2)
        if (res.code === ERR_OK) {
          // console.log(3)
          // console.log(res.data.list);
          this.songs = this._normalizeSongs(res.data.list);
          console.log(this.songs);
        }
      });
    },
    //重组 res.data.list 数据,只拿需要的
    // _normalizeSongs(list) {
    //   let ret = [];
    //   list.forEach(item => {
    //     // 解构赋值-拿到item 下的 musicData 列表数据
    //     let { musicData } = item;
    //     //------------ 更新的加上vkey
    //     getSongVkey(musicData.songmid).then((res) => {
    //       const vkey = res.data.items[0].vkey;
    //       if (musicData.songid && musicData.albummid) {
    //         ret.push(createSong(musicData, vkey));
    //       }
    //     });

    //     // if (musicData.songid && musicData.albummid) {
    //     //   getSongVkey(musicData.songmid).then((res) => {
    //     //     const svley = res.data.items
    //     //     const songVkey = svley[0].vkey
    //     //     ret.push(createSong(musicData, songVkey))
    //     //   })
    //     // }



    //     // if(musicData.songid&&musicData.albummid){
    //     //   ret.push(createSong(musicData));
    //     // }
    //   });
    //   return ret;
    // }
     
     _normalizeSongs(list) {
       let ret = []
       list.forEach((item) => {
         let { musicData } = item
         if(musicData.songid && musicData.albummid) {
           // ret.push(createSong(musicData))
           getSongUrl(musicData.songmid).then(resp => {
             let vkey = resp.data.items[0].vkey
             let url = `http://dl.stream.qqmusic.qq.com/${resp.data.items[0].filename}?vkey=${vkey}&guid=7402365050&uin=0&fromtag=66`
             Object.assign(musicData, { url })
             ret.push(createSong(musicData))
           }).catch(err => {
             console.log(err)
           })
         }
       })
       return ret
     }
  },
  components: {
    MusicList
  }
};
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
@import '~common/stylus/variable';

.singer-detail {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
}

.slide-enter.active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>

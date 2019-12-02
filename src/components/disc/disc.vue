<template>
	<transition name="slide">
		<music-list :title='title' :bgImage='bgImage' :songs='songs'></music-list>
	</transition>
</template>

<script>
import MusicList from 'components/music-list/music-list';
import {mapGetters} from 'vuex';
import {getSongList} from 'api/recommend';
import {ERR_OK} from 'api/config';
import {createSong} from 'common/js/song';
import { getSongUrl } from 'api/song'

export default{
	data(){
		return{
			songs:[]
		}
	},
	created() {
		this._getSongList()
	},
	methods:{
	 _getSongList() {
			if(!this.disc.content_id) {
			  this.$router.push('/recommend')
			  return
			}
      console.log(1)
			getSongList(this.disc.content_id).then((res) => {
        console.log(2)
			  if(res.code === ERR_OK) {
          console.log(3)
				this.songs = this._normalizeSongs(res.cdlist[0].songlist);
        console.log(this.songs)
			  }
			})
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach((musicData) => {
          if(musicData.songid && musicData.albumid) {
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
	computed:{
		title(){
			return this.disc.title;
		},
		bgImage(){
			 return this.disc.cover;
		},
		...mapGetters([
			'disc'
		])
	},
	components:{
		MusicList
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
.slide-enter.active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter, .slide-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>

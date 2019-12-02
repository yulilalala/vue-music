<template>
	<transition name="slide">
		<music-list :rank='rank' :title="title" :bg-image="bgImage" :songs="songs"></music-list>
	</transition>
</template>

<script>
import MusicList from 'components/music-list/music-list';
import {mapGetters} from 'vuex';
import {getMusicList} from 'api/rank';
import {ERR_OK} from 'api/config';
import {createSong} from 'common/js/song';
import {getSongUrl} from 'api/song'
				
export default{
	computed:{
		...mapGetters([
			'topList'
		]),
		bgImage(){
			// return this.topList.picUrl;
			if(this.songs.length>0){
				return this.songs[0].image
			}
			return ''
		},
		title(){
			return this.topList.topTitle;
		}
	},
	components:{
		MusicList
	},
	created(){
		this._getMusicList();
	},
	data(){
		return{
			songs:[],
			rank:true
		}
	},
	methods:{
		_getMusicList(){
			// 如果不是rank列表点击进来的，topList就获取不到id，这样刷新获取不到数据就让它返回上一级
			if(!this.topList.id){
				this.$router.push('/rank')
				return;
			}
			getMusicList(this.topList.id).then((res)=>{
				if(res.code===ERR_OK){
					console.log(res.songlist)
					this.songs=this._normalizeSongs(res.songlist)
					console.log(this.songs)
				}
			})
		},
		_normalizeSongs(list){
			let ret=[];
			list.forEach((item)=>{
				const musicData=item.data;
				if(musicData.songid && musicData.albummid){
					// ret.push(createSong(musicData))
					getSongUrl(musicData.songmid).then(resp => {
					  let vkey = resp.data.items[0].vkey
// 					  console.log(resp.data)
// 					  console.log(vkey)
					  let url = `http://dl.stream.qqmusic.qq.com/${resp.data.items[0].filename}?vkey=${vkey}&guid=7402365050&uin=0&fromtag=66`
					  
					  Object.assign(musicData, { url })
					  ret.push(createSong(musicData))
					}).catch(err => {
					  console.log(err)
					})
				}
			})
			return ret;
		}
	}
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
	.slide-enter-active,.slide-leave-active
		transition:all 0.3s ease;
	.slide-enter,.slide-leave-to
		transform:translate3d(100%,0,0)
		
	
</style>

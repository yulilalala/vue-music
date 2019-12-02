/* 这里是共享组件间的js逻辑代码 */

import {mapGetters,mapMutations,mapActions} from 'vuex';
import {playMode} from 'common/js/config';
import { shuffle } from 'common/js/util';

export const playlistMixin={
	computed:{
		...mapGetters([
			'playList'
		])
	},
	mounted(){  //组件dom ready的时候触发
		this.handlePlayList(this.playList);
	},
	activated(){  //是<keep-alive>组件切过来的时候会触发activated这个事件
		this.handlePlayList(this.playList);
	},
	watch:{
		palyList(newVal){
			this.handlePlayList(newVal);
		}
	},
	methods:{
		handlePlayList(){
			// 抛出异常
			throw new Error('componnet must implement handlePlayList method');
		}
	}

}

export const playerMixin={
  computed:{
    iconMode() {
    	return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random';
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'mode',
      'playList',
      'favoriteList'
    ])
  },
  methods:{
    getFavoriteIcon(song){
      if(this.isFavorite(song)){
        return 'icon-favorite'
      }else{
        return 'icon-not-favorite'
      }
    },
    toggleFavotite(song){
      if(this.isFavorite(song)){
        // 如果已收藏,则点击收藏按钮取消收藏,通过action删除掉state中的收藏列表数据
        this.deleteFavoriteList(song)
      }else{
        this.saveFavoriteList(song)
      }
    },
    isFavorite(song){
      const index=this.favoriteList.findIndex((item)=>{
        return item.id===song.id;
      })
      // index>-1说明收藏列表中存在这条数据
      return index>-1
    },
    changeMode() {
    	const mode = (this.mode + 1) % 3;
    	this.setPlayMode(mode);
    	let list = null;
    	if (mode == playMode.random) {
    		list = shuffle(this.sequenceList);
    	} else {
    		list = this.sequenceList;
    	}
    	this.resetCurrentIndex(list);
    	this.setPlayList(list);
    },
    resetCurrentIndex(list) {
    	// 找到当前歌曲对应的索引
    	let index = list.findIndex(item => {
    		return item.id === this.currentSong.id;
    	});
    	// 当playList改变的时候也让currentIndex改变以保证currentSong的id不变
    	this.setCurrentIndex(index);
    },
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ]),
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAY_LIST'
    })
  }
}

export const searchMixin={
  data(){
    return{
      query:'',
      refreshDelay:100
    }
  },
  computed:{
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods:{
    saveSearch(){
      this.saveSearchHistory(this.query)
    },
    blurInput(){
      // 访问子组件中的blur方法,向上滚动列表时使输入框失去焦点，这样就可以隐藏手机上的键盘
      this.$refs.searchBox.blur()
    },
    onChangeQuery(query){
    	this.query=query;
    },
    addQuery(query){
    	// 调用searchBox组件中的方法
    	this.$refs.searchBox.setQuery(query);
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
      // 'clearSearchHistory'
    ]),
  }
}

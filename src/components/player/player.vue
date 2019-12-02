<template>
	<div class="player" v-show="playList.length > 0">
		<transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
			<div class="normal-player" v-show="fullScreen">
				<div class="background"><img :src="currentSong.image" width="100%" height="100%" alt="" /></div>
				<div class="top">
					<div class="back" @click="back"><i class="icon-back"></i></div>
					<h1 class="title" v-html="currentSong.name"></h1>
					<h2 class="subtitle" v-html="currentSong.singer"></h2>
				</div>
				<div class="middle" @touchstart.prevent="middleTouchStart" @touchmove.prevent="middleTouchMove" @touchend="middleTouchEnd">
					<div class="middle-l" ref="middleL">
						<div class="cd-wrapper" ref="cdWrapper">
							<div class="cd" :class="cdCls">
								<img class="image" alt="" :src="currentSong.image" />
							</div>
						</div>
						<div class="playing-lyric-wrapper">
							<div class="playing-lyric">{{ playingLyric }}</div>
						</div>
					</div>
					<scroll class="middle-r" :data="currentLyric && currentLyric.lines" ref="lyricList">
						<div class="lyric-wrapper">
							<div v-if="currentLyric">
								<p ref="lyricLine" class="text" :class="{ current: currentLineNum === index }" v-for="(line, index) in currentLyric.lines">{{ line.txt }}</p>
							</div>
							<div v-else>
								<p class="text">最怕歌曲有歌词</p>
								<p class="text">最怕歌词有故事</p>
							</div>
						</div>
					</scroll>
				</div>

				<div class="bottom">
					<div class="dot-wrapper">
						<span class="dot" :class="{ active: currentShow === 'cd' }"></span>
						<span class="dot" :class="{ active: currentShow === 'lyric' }"></span>
					</div>
					<div class="progress-wrapper">
						<span class="time time-l">{{ format(currentTime) }}</span>
						<div class="progress-bar-wrapper"><progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar></div>
						<span class="time time-l">{{ format(currentSong.duration) }}</span>
					</div>
					<div class="operators">
						<div class="icon i-left" @click="changeMode"><i :class="iconMode"></i></div>
						<div class="icon i-left" :class="disableCls"><i class="icon-prev" @click="prev"></i></div>
						<div class="icon i-center" :class="disableCls"><i :class="playIcon" @click="togglePlaying"></i></div>
						<div class="icon i-right" :class="disableCls"><i class="icon-next" @click="next"></i></div>
						<div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click.top="toggleFavotite(currentSong)"></i>
            </div>
					</div>
				</div>
			</div>
		</transition>
		<transition name="mini">
			<div class="mini-player" v-show="!fullScreen" @click="open">
				<div class="icon"><img :class="cdCls" width="40" height="40" :src="currentSong.image" alt="" /></div>
				<div class="text">
					<h2 class="name" v-html="currentSong.name"></h2>
					<p class="desc" v-html="currentSong.singer"></p>
				</div>
				<div class="control">
					<progress-circle :radius="radius" :percent="percent"><i :class="miniPlay" class="icon-mini" @click.stop="togglePlaying"></i></progress-circle>
				</div>
        <!-- 点击歌曲列表按按钮时要阻止冒泡，防止冒泡到父元素触发open方法而打开全屏播放器 -->
				<div class="control" @click.stop="showPlayList"><i class="icon-playlist"></i></div>
			</div>
		</transition>
    <play-list ref="playlist"></play-list>
		<audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updatetime" @ended="end"></audio>
	</div>
</template>

<script>
import { mapGetters, mapMutations,mapActions } from 'vuex';
import animations from 'create-keyframe-animation';
import { prefixStyle } from 'common/js/dom';

import ProgressBar from 'base/progress-bar/progress-bar';
import ProgressCircle from 'base/progress-circle/progress-circle';
import { playMode } from 'common/js/config';
import { shuffle } from 'common/js/util';
//歌词解析器，它本身就是一个类，使用的使用要new一个对象,例new Lyric(lyric)
import Lyric from 'lyric-parser';
import Scroll from 'base/scroll/scroll';
import PlayList from 'components/playlist/playlist';
import {playerMixin} from 'common/js/mixin'

const transform = prefixStyle('transform');
const transitionDuration = prefixStyle('transitionDuration');

export default {
  mixins:[playerMixin],
	components: {
		ProgressBar,
		ProgressCircle,
		Scroll,
    PlayList
	},
	data() {
		return {
			songReady: false,
			currentTime: 0,
			radius: 32,
			currentLyric: null,
			currentLineNum: 0,
			currentShow: 'cd',
			playingLyric: ''
		};
	},
	computed: {
		// iconMode() {
		// 	return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random';
		// },
		percent() {
			return this.currentTime / this.currentSong.duration;
		},
		disableCls() {
			return this.songReady ? '' : 'disable';
		},
		cdCls() {
			return this.playing ? 'play' : 'play pause';
		},
		miniPlay() {
			return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
		},
		playIcon() {
			return this.playing ? 'icon-pause' : 'icon-play';
		},
		...mapGetters(['fullScreen', 'playList', 'currentSong', 'playing', 'currentIndex', 'mode', 'sequenceList'])
	},
	watch: {
		// 监听currentsong的变化，当currentsong发生变化的时候,让歌曲播放
		currentSong(newSong, oldSong) {
      // 如果列表中的歌曲都被删完了newSong.id就会为undefined，则程序会继续执行就会报错，这里设置，如果没有newSong.id就退出方法
      if(!newSong.id){
        return;
      }
			//一点击歌曲进来的时候是播放状态
			if (newSong.id === oldSong.id) {
				return;
			}
			if (this.currentLyric) {
				this.currentLyric.stop();
			}
			// 			this.$nextTick(() => {
			// 				//确保DOM已存在
			// 				this.$refs.audio.play();
			// 				//this.currentSong.getLyric();
			// 				this.getLyric();
			// 			});
        clearTimeout(this.timer);
        // 手机播放从后台切到前台，播放，有1秒延时，，，，也可防止切歌曲切得太快
			  this.timer=setTimeout(() => {
				this.$refs.audio.play();
				// this.currentSong.getLyric();
				this.getLyric();
			}, 1000);
		},
		// 监听playing的播放状态
		playing(newPlaying) {
			// 监听是否在播放---切换播放暂停状态
			this.$nextTick(() => {
				let audio = this.$refs.audio;
				newPlaying ? audio.play() : audio.pause();
			});
		}
	},
	created() {
		this.touch = {};
	},
	methods: {
    ...mapActions([
      'savePlayHistory'
    ]),
    showPlayList(){
      this.$refs.playlist.show();
    },
		middleTouchStart(e) {
			this.touch.initiated = true;
			//记录第0个手指的位置
			this.touch.startX = e.touches[0].pageX;
			this.touch.startY = e.touches[0].pageY;
			// console.log(this.touch.startX);
			// console.log(1)
		},
		middleTouchMove(e) {
			if (!this.touch.initiated) {
				return;
			}
			const deltaX = e.touches[0].pageX - this.touch.startX;
			const deltaY = e.touches[0].pageY - this.touch.startY;
			if (Math.abs(deltaY) > Math.abs(deltaX)) {
				return;
			}
			const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
			const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
			this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
			this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
			this.$refs.lyricList.$el.style[transitionDuration] = 0;
			this.$refs.middleL.style.opacity = 1 - this.touch.percent;
			this.$refs.middleL.style[transitionDuration] = 0;
		},
		middleTouchEnd(e) {
			let offsetWidth;
			let opacity;
			if (this.currentShow === 'cd') {
				if (this.touch.percent > 0.1) {
					offsetWidth = -window.innerWidth;
					this.currentShow = 'lyric';
					opacity = 0;
				} else {
					offsetWidth = 0;
					opacity = 1;
				}
			} else {
				if (this.touch.percent < 0.9) {
					offsetWidth = 0;
					this.currentShow = 'cd';
					opacity = 1;
				} else {
					offsetWidth = -window.innerWidth;
					opacity = 0;
				}
			}
			const time = 300;
			this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
			this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
			this.$refs.middleL.style.opacity = opacity;
			this.$refs.middleL.style[transitionDuration] = `${time}ms`;
		},
		getLyric() {
			this.currentSong.getLyric().then(lyric => {
          /* 如果当前歌曲的歌词不和请求来的歌词数据一样就什么都不做，以防切换歌曲太快时歌词乱掉*/
          if(this.currentSong.lyric!==lyric){
            return
          }
					this.currentLyric = new Lyric(lyric, this.handleLyric);
					if (this.playing) {
						//歌词播放，play()是歌词解析器的api
						this.currentLyric.play();
					}
					// console.log(this.currentLyric)
				})
				.catch(() => {
					this.currentLyric = null;
					this.playingLyric = '';
					this.currentLineNum = 0;
				});
		},
		handleLyric({ lineNum, txt }) {
			this.currentLineNum = lineNum;
			//当歌词lineNum大于5时，触发滚动，滚动到当前元素往前偏移第5个的位置；否则滚动到顶部
			if (lineNum > 5) {
				let lineEl = this.$refs.lyricLine[lineNum - 5]; //保证歌词在中间位置滚动
				this.$refs.lyricList.scrollToElement(lineEl, 1000);
			} else {
				this.$refs.lyricList.scrollTo(0, 0, 1000);
			}
			this.playingLyric = txt;
		},
		end() {
			if (this.mode === playMode.loop) {
				this.loop();
			} else {
				this.next();
			}
		},
		loop() {
			this.$refs.audio.currentTime = 0; // 显示时间跳回到0秒
			this.$refs.audio.play(); // audio自带方法
			if (this.currentLyric) {
				// seek()是 Lyric类中的方法，偏移到歌词的开头位置
				this.currentLyric.seek(0);
			}
		},
    // 写到mixin.js中
		/* changeMode() {
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
		}, */
		onProgressBarChange(percent) {
			let currentTime = this.currentSong.duration * percent;
			this.$refs.audio.currentTime = currentTime;
			if (!this.playing) {
				this.togglePlaying();
			}
			if (this.currentLyric) {
				this.currentLyric.seek(currentTime * 1000);
			}
		},
		format(interval) {
			interval = interval | 0;
			let minute = (interval / 60) | 0;
			// let second=interval%60;
			let second = this._pad(interval % 60);
			return `${minute}:${second}`;
		},
		_pad(num, n = 2) {
			let len = num.toString().length;
			while (len < n) {
				num = '0' + num;
				len++;
			}
			return num;
		},
		updatetime(e) {
			this.currentTime = e.target.currentTime;
		},
		ready() {
			this.songReady = true;
      // 当歌曲播放的时候，就把当前歌曲保存到localStorage中（以便在播放历史中查找到）
      this.savePlayHistory(this.currentSong);
		},
		error() {
			this.songReady = true;
		},
		prev() {
			//点击上一首/下一首切换其实就是切换歌曲的播放索引，让其+1/-1；audio由一个ready属性，
			//来确认是否准备好播放，来阻止用户的连续多次点击；
			if (!this.songReady) {
				// songReady是标志位，当歌曲能播放时，默认false，只有error返回为能播放时，变为ture，进而return跳过，执行下面的函数
				return;
			}

			if (this.playList.length === 1) {
				// 如果播放列表只有一首歌曲，就按循环播放的方式，要不然currenIndex不会改变，即currentSong不改变，watch中的方法就不会执行
				this.loop();
        return;
			} else {
				let index = this.currentIndex - 1;
				if (index == -1) {
					// 第一首 的前一曲
					index = this.playList.length - 1; // 最后一曲
				}
				this.setCurrentIndex(index); // actions的方法，根据index决定播放的具体是哪首
				if (!this.playing) {
					//当暂停时候点击播放的情况
					this.togglePlaying();
				}
			}

			this.songReady = false;
		},
		next() {
			if (!this.songReady) {
				return;
			}
			if (this.playList.length === 1) {
				this.loop();
        // 防止继续向下执行，songReady变为false，不会在触发ready方法了
        return;
			} else {
				let index = this.currentIndex + 1;
				if (index == this.playList.length) {
					index = 0;
				}
				this.setCurrentIndex(index);
				if (!this.playing) {
					this.togglePlaying();
				}
			}

			this.songReady = false;
		},
		togglePlaying() {
			// this.$refs.audio.pause();
			if (!this.songReady) {
				return;
			}
			this.setPlayingState(!this.playing);
			if (this.currentLyric) {
				this.currentLyric.togglePlay();
			}
		},
		back() {
			// 当点击此按钮的时候，将全屏播放器转换为“迷你播放”
			this.setFullScreen(false);
		},
		open() {
			// 当点击此按钮的时候，将“迷你播放”转换为全屏播d放器
			this.setFullScreen(true);
		},
		...mapMutations({
			setFullScreen: 'SET_FULL_SCREEN',
			setPlayingState: 'SET_PLAYING_STATE',
			setCurrentIndex: 'SET_CURRENT_INDEX',
			setPlayMode: 'SET_PLAY_MODE',
			setPlayList: 'SET_PLAY_LIST'
		}),
		// enter(el,done){
		//   const {x,y,scale}=this._getPosAndScale();

		//   let animation={
		//     0:{
		//       transform:`translate3d(${x}px,${y}px,0} scale(${scale})`
		//     },
		//     60:{
		//       transform:`translate3d(0,0,0) scale(1.1)`
		//     },
		//     100:{
		//       transform:`translate3d(0,0,0) scale(1)`
		//     }
		//   };
		//   animations.registerAnimation({
		//     name:'move',
		//     animation,
		//     presets:{
		//       duration:400,
		//       easing:'linear'
		//     }
		//   });
		//   animations.runAnimation(this.$refs.cdWrapper,'move',done)
		// },
		// afterEnter(el){
		//   animations.unregisterAnimation('move');
		//   this.$refs.cdWrapper.style.animation=''
		// },
		// leave(el,done){
		//   this.$refs.cdWrapper.style.transition='all 0.4';
		//   const {x,y,scale}=this._getPosAndScale();
		//   this.$refs.cdWrapper.style[transform]=`translate3d(${x}px,${y}px,0) scale(${scale})`;
		//   this.$refs.cdWrapper.addEventListener('transitionend',done);
		// },
		// afterLeave(el){
		//   this.$refs.cdWrapper.style.transition='';
		//   this.$refs.cdWrapper.style[transform]='';
		// },
		enter(el, done) {
			const { x, y, scale } = this._getPosAndScale();
			let animation = {
				0: {
					transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
				},
				60: {
					transform: `translate3d(0, 0, 0) scale(1.1)`
				},
				100: {
					transform: `translate3d(0, 0, 0) scale(1)`
				}
			};
			animations.registerAnimation({
				name: 'move',
				animation,
				presets: {
					duration: 400,
					easing: 'linear'
				}
			});
			animations.runAnimation(this.$refs.cdWrapper, 'move', done);
		},
		afterEnter(el) {
			animations.unregisterAnimation('move');
			this.$refs.cdWrapper.style.animation = '';
		},
		leave(el, done) {
			this.$refs.cdWrapper.style.transition = 'all 0.4s';
			const { x, y, scale } = this._getPosAndScale();
			this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
			this.$refs.cdWrapper.addEventListener('transitionend', done);
		},
		afterLeave(el) {
			this.$refs.cdWrapper.style.transition = '';
			this.$refs.cdWrapper.style[transform] = '';
		},
		_getPosAndScale() {
			const targetWidth = 40;
			const paddingLeft = 40;
			const paddingBottom = 30;
			const paddingTop = 80;
			const width = window.innerWidth * 0.8;
			const scale = targetWidth / width;
			const x = -(window.innerWidth / 2 - paddingLeft);
			const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
			return {
				x,
				y,
				scale
			};
		}
		// _getPosAndScale(){
		//   const targetWidth=40;
		//   const paddingLeft=40;
		//   const paddingBottom=30;
		//   const paddingTop=80;
		//   const Width=window.innerWidth*0.8;
		//   const scale=targetWidth/Width;
		//   const x=-(window.innerWidth/2-paddingLeft);
		//   const y=window.innerHeight-paddingTop-Width/2-paddingBottom;
		//   return{
		//     x,
		//     y,
		//     scale
		//   }
		// }
	}
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
 @import "~common/stylus/variable"
@import "~common/stylus/mixin"

.player
  .normal-player
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 150
    background: $color-background
    .background
      position: absolute
      left: 0
      top: 0
      width: 100%
      height: 100%
      z-index: -1
      opacity: 0.6
      filter: blur(20px)
    .top
      position: relative
      margin-bottom: 25px
      .back
        position absolute
        top: 0
        left: 6px
        z-index: 50
        .icon-back
          display: block
          padding: 9px
          font-size: $font-size-large-x
          color: $color-theme
          transform: rotate(-90deg)
      .title
        width: 70%
        margin: 0 auto
        line-height: 40px
        text-align: center
        no-wrap()
        font-size: $font-size-large
        color: $color-text
      .subtitle
        line-height: 20px
        text-align: center
        font-size: $font-size-medium
        color: $color-text
    .middle
      position: fixed
      width: 100%
      top: 80px
      bottom: 170px
      white-space: nowrap
      font-size: 0
      .middle-l
        display: inline-block
        vertical-align: top
        position: relative
        width: 100%
        height: 0
        padding-top: 80%
        .cd-wrapper
          position: absolute
          left: 10%
          top: 0
          width: 80%
          height: 100%
          .cd
            width: 100%
            height: 100%
            box-sizing: border-box
            border: 10px solid rgba(255, 255, 255, 0.1)
            border-radius: 50%
            &.play
              animation: rotate 20s linear infinite
            &.pause
              animation-play-state: paused
            .image
              position: absolute
              left: 0
              top: 0
              width: 100%
              height: 100%
              border-radius: 50%

        .playing-lyric-wrapper
          width: 80%
          margin: 30px auto 0 auto
          overflow: hidden
          text-align: center
          .playing-lyric
            height: 20px
            line-height: 20px
            font-size: $font-size-medium
            color: $color-text-l
      .middle-r
        display: inline-block
        vertical-align: top
        width: 100%
        height: 100%
        overflow: hidden
        .lyric-wrapper
          width: 80%
          margin: 0 auto
          overflow: hidden
          text-align: center
          .text
            line-height: 32px
            color: $color-text-l
            font-size: $font-size-medium
            &.current
              color: $color-text
    .bottom
      position: absolute
      bottom: 50px
      width: 100%
      .dot-wrapper
        text-align: center
        font-size: 0
        .dot
          display: inline-block
          vertical-align: middle
          margin: 0 4px
          width: 8px
          height: 8px
          border-radius: 50%
          background: $color-text-l
          &.active
            width: 20px
            border-radius: 5px
            background: $color-text-ll
      .progress-wrapper
        display: flex
        align-items: center
        width: 80%
        margin: 0px auto
        padding: 10px 0
        .time
          color: $color-text
          font-size: $font-size-small
          flex: 0 0 30px
          line-height: 30px
          width: 30px
          &.time-l
            text-align: left
          &.time-r
            text-align: right
        .progress-bar-wrapper
          flex: 1
      .operators
        display: flex
        align-items: center
        .icon
          flex: 1
          color: $color-theme
          &.disable
            color: $color-theme-d
          i
            font-size: 30px
        .i-left
          text-align: right
        .i-center
          padding: 0 20px
          text-align: center
          i
            font-size: 40px
        .i-right
          text-align: left
        .icon-favorite
          color: $color-sub-theme
    &.normal-enter-active, &.normal-leave-active
      transition: all 0.4s
      .top, .bottom
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
    &.normal-enter, &.normal-leave-to
      opacity: 0
      .top
        transform: translate3d(0, -100px, 0)
      .bottom
        transform: translate3d(0, 100px, 0)
  .mini-player
    display: flex
    align-items: center
    position: fixed
    left: 0
    bottom: 0
    z-index: 180
    width: 100%
    height: 60px
    background: $color-highlight-background
    &.mini-enter-active, &.mini-leave-active
      transition: all 0.4s
    &.mini-enter, &.mini-leave-to
      opacity: 0
    .icon
      flex: 0 0 40px
      width: 40px
      padding: 0 10px 0 20px
      img
        border-radius: 50%
        &.play
          animation: rotate 10s linear infinite
        &.pause
          animation-play-state: paused
    .text
      display: flex
      flex-direction: column
      justify-content: center
      flex: 1
      line-height: 20px
      overflow: hidden
      .name
        margin-bottom: 2px
        no-wrap()
        font-size: $font-size-medium
        color: $color-text
      .desc
        no-wrap()
        font-size: $font-size-small
        color: $color-text-d
    .control
      flex: 0 0 30px
      width: 30px
      padding: 0 10px
      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size: 30px
        color: $color-theme-d
      .icon-mini
        font-size: 32px
        position: absolute
        left: 0
        top: 0

@keyframes rotate
  0%
    transform: rotate(0)
  100%
    transform: rotate(360deg)
</style>

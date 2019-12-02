import {getLyric} from 'api/song';
import {ERR_OK} from 'api/config';
// 将歌词解码
import {Base64} from 'js-base64';
export default class Song {
	constructor({id,mid,singer,name,album,duration,image,url}) {
		this.id = id;
		this.mid = mid;
		this.singer = singer;
		this.name = name;
		this.album = album;
		this.duration = duration;
		this.image = image;
		this.url = url;
	}
	getLyric() {
		if (this.lyric) {
			return Promise.resolve(this.lyric);
		}
		//箭头函数：内置this的值，取决于箭头函数在哪里定义，而非箭头函数执行的上下文环境
		return new Promise((resolve, reject) => {
			getLyric(this.mid).then((res) => {
				if (res.retcode === ERR_OK) {
          // 将歌词解码
					let lyric = Base64.decode(res.lyric);
					this.lyric = lyric;
					resolve(this.lyric);
					// console.log(this.lyric);
				} else {
					reject('没有歌词哦！');
				}
			})
		})

	}
}

export function createSong(musicData,vkey) {
	return new Song({
		id: musicData.songid,
		mid: musicData.songmid,
		singer: filterSinger(musicData.singer),
		name: musicData.songname,
		album: musicData.albumname,
		duration: musicData.interval,
		image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
		// url:`http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?fromtag=38&guid=5931742855&vkey=${vkey}`
		// url: `http://dl.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?vkey=${vkey}&guid=5931742855&uin=0&fromtag=66`
		url: musicData.url
	})

}

export function createSongWithSearch(musicData) {
  return new Song({
    id: musicData.id,
    mid: musicData.album.mid,
    singer: filterSinger(musicData.singer),
    name: musicData.name,
    album: musicData.album.name,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.album.mid}.jpg?max_age=2592000`,
    url: musicData.url
  })
}

export function filterSinger(singer) {
	let ret = [];
	if (!singer) {
		return ''
	}
	singer.forEach((s) => {
		ret.push(s.name);
	})
	return ret.join('/');
}

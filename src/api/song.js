import jsonp from '@/common/js/jsonp'
import { commonParams, options } from './config'
import axios from 'axios'

export function getSongUrl(songmid) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    hostUin: 0,
    format: 'json',
    inCharset: 'utf8',
    outCharset: 'utf-8',
    notice: 0,
    platform: 'yqq',
    needNewCode: 0,
    cid: 205361747,
    uin: 0,
    songmid: songmid,
    filename: `C400${songmid}.m4a`,
    guid: 7402365050
  })
  return jsonp(url, data, '')
}

export function getLyric(mid){
  const url='/api/getLyric';
  const data=Object.assign({},commonParams,{
    songmid:mid,
		// 这里是一段时间戳
    pcachetime:+new Date(),
    platform:'yqq',
    hostUni:0,
    needNewCode:0,
		//会变化，以实时数据为准
    g_tk: 5381,
		//因为是请求本地的接口，所以format是json
    format:'json'
  })
  return axios.get(url,{
    params:data
  }).then(function(res){
    return Promise.resolve(res.data)
  })
}
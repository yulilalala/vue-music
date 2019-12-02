/* 缓存到本地相关 */

import storage from 'good-storage'

const SEARCH_KEY='__search__';
const SEARCH_MAX_LENGTH=15;

const PLAY_KEY='__play__';
const PLAY_MAX_LENGHT=200;

const FAVORITE_KEY='__favorite__';
const FAVORITE_MAX_LENGTH=200;

function insertArray(arr,val,compare,maxLen){
  const index=arr.findIndex(compare);
  // 如果在列表中找到了,并且索引为0,即第一条数据,就什么都不做
  if(index===0){
    return;
  }
  // 如果在列表中找到了,并且不在第一个位置,则删除掉这条数据
  if(index>0){
    arr.splice(index,1);
  }
  // 向数组的开头添加我们想要添加的这条数据
  arr.unshift(val);
  // 如果数组的长度大于所规定的的最大的长度,则删除掉数组的最后一条数据
  if(maxLen && arr.length>maxLen){
    arr.pop();
  }
}
export function saveSearch(query){
  // 如果本地存储没有数据,则取默认值空数组[]
  let searches=storage.get(SEARCH_KEY,[]);
  insertArray(searches,query,(item)=>{
    // item为searches中的每一项,如果searches中有和query相同的一项,则返回这一项
     return item===query
  },SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY,searches);
  return searches;
}

// 从本地存储中获取数据,在state.js中使用
export function loadSearch(){
  return storage.get(SEARCH_KEY,[])
}

// 从数组中删除一条数据
function deleteFromArray(arr,compare){
  const index=arr.findIndex(compare);
  if(index>-1){
    arr.splice(index,1);
  }
}

// 从本地存储中删除一条数据
export function deleteSearch(query){
  let searches=storage.get(SEARCH_KEY,[]);
  deleteFromArray(searches,(item)=>{
    return item === query
  });
  storage.set(SEARCH_KEY,searches)
  return searches;
}

export function clearSearch(){
  // 从本地存储中清除所有SEARCH_KEY的数据
  storage.remove(SEARCH_KEY);
  return [];
}

// 将播放历史保存到本地
export function savePlay(song){
  let songs=storage.get(PLAY_KEY,[]);
  insertArray(songs,song,(item)=>{
    return item.id===song.id
  },PLAY_MAX_LENGHT)
  storage.set(PLAY_KEY,songs)
  return songs;
}

// state从本地获取的播放历史
export function loadPlay(){
  return storage.get(PLAY_KEY,[]);
}

export function saveFavorite(song){
  let songs=storage.get(FAVORITE_KEY,[]);
  insertArray(songs,song,(item)=>{
    return item.id===song.id
  },FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY,songs);
  return songs;
}

export function deleteFavorite(song){
  let songs=storage.get(FAVORITE_KEY,[]);
  deleteFromArray(songs,(item)=>{
    return item.id=song.id
  })
  storage.set(FAVORITE_KEY,songs);
  return songs;
}

export function loadFavorite(){
  return storage.get(FAVORITE_KEY,[]);
}

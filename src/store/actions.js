import * as types from './mutation-types'
// import { type } from 'os';
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {saveSearch,deleteSearch,clearSearch,savePlay,saveFavorite,deleteFavorite} from 'common/js/cache';

function findIndex(list,song){
   return list.findIndex((item)=>{
      return item.id===song.id;
   })
}

export const selectPlay=function({commit,state},{list,index}){
   commit(types.SET_FULL_SCREEN,true);
   if(state.mode===playMode.random){
      let randomList=shuffle(list);
      commit(types.SET_PLAY_LIST,randomList);
      index=findIndex(randomList,list[index]);
   }else{
      commit(types.SET_PLAY_LIST,list);
   }

   commit(types.SET_SEQUENCE_LIST,list);
   commit(types.SET_PLAYING_STATE,true);
   commit(types.SET_CURRENT_INDEX,index);
}

export const randomPlay=function({commit},{list}){
   commit(types.SET_PLAY_MODE,playMode.random)
   commit(types.SET_FULL_SCREEN,true);
   commit(types.SET_SEQUENCE_LIST,list);
   let randomList=shuffle(list);
   commit(types.SET_PLAY_LIST,randomList);
   commit(types.SET_PLAYING_STATE,true);
   commit(types.SET_CURRENT_INDEX,0);
}

export const insertSong=function({commit,state},song){
  // 调用slice方法变成一个playList的副本,这样就可以被splice()方法操作了
  let playList=state.playList.slice();
  let sequenceList=state.sequenceList.slice();
  // 这个地方不用slice是因为currentIndex是一个值类型，不是一个引用类型
  let currentIndex=state.currentIndex;

  // 记录当前歌曲
  let currentSong=playList[currentIndex];

  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fdIndex=findIndex(playList,song);
  // 因为是插入歌曲,所以索引要加1
  currentIndex++;
  // 插入这首歌到当前索引位置,原数组会被改变(state中的数据不能被mutation方法之外的方法修改)【这个地方的playList来自于state.playList，而splice这个函数是会改变原对象的，所以会造成state.playList的修改，这个是不符合规范的】
  playList.splice(currentIndex,0,song);

  // 如果已经包含了这首歌
  if(fdIndex>-1){
    // 如果当前播放的歌曲序号大于已经包含的这首歌的序号
    if(currentIndex>fdIndex){
      // 也就是要插入的歌曲在已有歌曲的后面,则直接删除已有歌曲的,不用改变它的序号
      playList.splice(fdIndex,1);
      // 删除了已有歌曲,playList的长度减一,当前歌曲对应的序号也会减一
      currentIndex--;
    }else{
      playList.splice(fdIndex+1,1);
    }
  }

  // 查找要插入的歌曲在sequenceList中的位置,只是一个临时变量
  let currentSIndex=findIndex(sequenceList,currentSong)+1;
  // 查找之前sequenceList中有没有我们要插入的歌曲
  let fsIndex=findIndex(sequenceList,song);
  // 在sequenceList列表中插入这首歌曲
  sequenceList.splice(currentIndex,0,song);
  // 如果已经包含了这首歌
  if(fsIndex>-1){
    if(currentSIndex>fsIndex){
      sequenceList.splice(fsIndex,1);

    }else{
      sequenceList.splice(fsIndex+1,1);
    }
  }

  // 提交这几个mutations
  commit(types.SET_PLAY_LIST,playList);
  commit(types.SET_SEQUENCE_LIST,sequenceList);
  commit(types.SET_CURRENT_INDEX,currentIndex);
  commit(types.SET_FULL_SCREEN,true);
  commit(types.SET_PLAYING_STATE,true);
}

// 做一个小小的封装,将搜索结果保存到localStorage中
export const saveSearchHistory=function({commit},query){
  commit(types.SET_SEARCH_HISTORY,saveSearch(query));
}

// 从本地存储中删除一条query数据后将新数组保存到state中
export const deleteSearchHistory=function({commit},query){
  commit(types.SET_SEARCH_HISTORY,deleteSearch(query));
}

export const clearSearchHistory=function({commit}){
  commit(types.SET_SEARCH_HISTORY,clearSearch());
}

export const deleteSong=function({commit,state},song){
  let playList=state.playList.slice();
  let sequenceList=state.sequenceList.slice();
  let currentIndex=state.currentIndex;
  let pIndex=findIndex(playList,song);
  playList.splice(pIndex,1);
  let sIndex=findIndex(sequenceList,song);
  sequenceList.splice(sIndex,1);

  if(currentIndex>pIndex||currentIndex===playList.length){
    currentIndex--
  }

  commit(types.SET_PLAY_LIST,playList);
  commit(types.SET_SEQUENCE_LIST,sequenceList);
  commit(types.SET_CURRENT_INDEX,currentIndex);

  // 如果列表中的歌曲被删完了则设置播放状态为false
  if(!playList){
    commit(types.SET_PLAYING_STATE,false);
  }else{
    commit(types.SET_PLAYING_STATE,true);
  }


  // 上面代码的优化:
  // const playingState=playList.length>0;
  // commit(types.SET_PLAYING_STATE,playingState);

}

// export const deleteSongList=function({commit}){
//   commit(types.SET_PLAY_LIST,[]);
//   commit(types.SET_SEQUENCE_LIST,[]);
//   commit(types.SET_PLAYING_STATE,false);
//   commit(types.SET_CURRENT_INDEX,-1);
// }
export const deleteSongList = function({commit}) {
  commit(types.SET_PLAY_LIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory=function({commit},song){
  commit(types.SET_PLAY_HISTORY,savePlay(song));
}

export const saveFavoriteList=function({commit},song){
  commit(types.SET_FAVORITE_LIST,saveFavorite(song));
}

export const deleteFavoriteList=function({commit},song){
  commit(types.SET_FAVORITE_LIST,deleteFavorite(song))
}

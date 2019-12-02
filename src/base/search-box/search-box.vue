<template>
	<div class="search-box">
		<i class="icon-search"></i>
		<input ref='query' v-model="query" :placeholder="placeholder" class="box" />
		<i v-show="query" class="icon-dismiss" @click="clear"></i>
	</div>
</template>

<script>
import {debounce} from 'common/js/util'
export default{
	props:{
		placeholder:{
			type:String,
			default:'搜索歌曲、歌手'
		}
	},
	data(){
		return {
			query:''
		}
	},
	methods:{
    blur(){
      this.$refs.query.blur();
    },
		setQuery(query){
			this.query=query
		},
		clear(){
			this.query=''
		}
	},
	created(){
    // watch被节流了（用封装的debounce函数）,这里是为了节流
		this.$watch('query',debounce((newQuery)=>{
			// 监听query数据的改变，派发一个事件给父组件，并将新值传过去
			this.$emit('query',newQuery)
		},200) )
	}
}
</script>

<style scoped="scoped" lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      &::placeholder
        color: $color-text-d
    .icon-dismiss
      font-size: 16px
      color: $color-background
</style>

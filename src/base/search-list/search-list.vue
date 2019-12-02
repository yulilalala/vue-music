<!-- 搜索历史记录列表组件 -->
<template>
  <div class="search-list">
    <transition-group name="list" tag="ul">
      <!-- transition-grounp中的第一个元素必须有一个key值，且不用index做key值，item为存到搜索历史的记录，唯一 -->
      <li  class="search-item" v-for="(item,index) in searches" :key="item">
        <span class="text" @click="selectItem(item)">{{item}}</span>
        <!-- 阻止冒泡 -->
        <span class="icon" @click.stop="deleteItem(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script type="text/ecmascript-6">
export default{
  props:{
    searches:{
      type:Array,
      default:[]
    }
  },
  methods:{
    deleteItem(item){
      this.$emit('delete',item)
    },
    selectItem(item){
      this.$emit('select',item)
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>

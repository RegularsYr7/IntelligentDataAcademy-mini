# RefreshLoadList 通用列表组件

通用的下拉刷新、上滑加载更多列表组件,封装了分页逻辑。

## 功能特性

- ✅ 下拉刷新
- ✅ 上滑加载更多
- ✅ 自动分页管理
- ✅ 加载状态提示
- ✅ 空状态展示
- ✅ 自定义列表项样式
- ✅ 响应式参数监听

## Props 参数

| 参数        | 类型     | 必填 | 默认值         | 说明                                  |
| ----------- | -------- | ---- | -------------- | ------------------------------------- |
| api         | Function | 是   | -              | API 请求函数                          |
| params      | Object   | 否   | {}             | 额外的请求参数(如分类筛选)            |
| dataMapping | Function | 否   | (item) => item | 数据映射函数,将后端数据转换为前端格式 |
| pageSize    | Number   | 否   | 10             | 每页数量                              |
| emptyIcon   | String   | 否   | '📋'           | 空状态图标                            |
| emptyText   | String   | 否   | '暂无数据'     | 空状态文本                            |
| autoLoad    | Boolean  | 否   | true           | 是否自动加载数据                      |

## Events 事件

| 事件名       | 参数                     | 说明           |
| ------------ | ------------------------ | -------------- |
| load-success | { data, total, pageNum } | 加载成功时触发 |
| load-error   | error                    | 加载失败时触发 |

## Slots 插槽

| 插槽名  | 作用域参数                     | 说明         |
| ------- | ------------------------------ | ------------ |
| default | { items, loading, refreshing } | 列表项内容   |
| empty   | -                              | 自定义空状态 |

## 暴露方法

| 方法名   | 参数               | 说明                        |
| -------- | ------------------ | --------------------------- |
| reload   | -                  | 重新加载列表(重置到第 1 页) |
| loadData | isRefresh: Boolean | 手动加载数据                |

## 使用示例

### 基础用法

```vue
<template>
  <view class="page">
    <RefreshLoadList
      :api="getShowcaseList"
      :params="requestParams"
      :data-mapping="mapShowcaseData"
      :page-size="10"
      empty-icon="🎨"
      empty-text="暂无风采展示"
    >
      <!-- 自定义列表项样式 -->
      <template #default="{ items }">
        <view class="list">
          <view class="item" v-for="item in items" :key="item.id">
            <text>{{ item.title }}</text>
          </view>
        </view>
      </template>
    </RefreshLoadList>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { getShowcaseList } from "@/api/showcase";
import RefreshLoadList from "@/components/RefreshLoadList/RefreshLoadList.vue";

// 当前选中分类
const currentCategory = ref("all");

// 计算请求参数
const requestParams = computed(() => {
  const params = {};
  if (currentCategory.value !== "all") {
    params.showcaseType = currentCategory.value;
  }
  return params;
});

// 数据映射函数
const mapShowcaseData = (item) => {
  return {
    id: item.showcaseId,
    title: item.showcaseName,
    type: item.showcaseType,
    // ... 其他字段映射
  };
};
</script>
```

### 手动刷新

```vue
<template>
  <RefreshLoadList ref="listRef" :api="getList">
    <template #default="{ items }">
      <!-- 列表内容 -->
    </template>
  </RefreshLoadList>
</template>

<script setup>
import { ref } from "vue";

const listRef = ref(null);

// 手动刷新列表
const refresh = () => {
  listRef.value?.reload();
};
</script>
```

### 监听加载事件

```vue
<template>
  <RefreshLoadList
    :api="getList"
    @load-success="onLoadSuccess"
    @load-error="onLoadError"
  >
    <template #default="{ items }">
      <!-- 列表内容 -->
    </template>
  </RefreshLoadList>
</template>

<script setup>
const onLoadSuccess = ({ data, total, pageNum }) => {
  console.log("加载成功:", data, "总数:", total, "当前页:", pageNum);
};

const onLoadError = (error) => {
  console.error("加载失败:", error);
};
</script>
```

### 自定义空状态

```vue
<template>
  <RefreshLoadList :api="getList">
    <template #default="{ items }">
      <!-- 列表内容 -->
    </template>

    <!-- 自定义空状态 -->
    <template #empty>
      <view class="custom-empty">
        <image src="/static/empty.png"></image>
        <text>还没有任何内容哦~</text>
      </view>
    </template>
  </RefreshLoadList>
</template>
```

## 注意事项

1. **API 函数格式**: API 函数应该接收 `{ pageNum, pageSize, ...其他参数 }` 并返回包含 `rows/data` 和 `total` 的对象

2. **params 监听**: `params` 参数变化时会自动重新加载列表(重置到第 1 页),建议使用 `computed` 返回参数对象

3. **数据映射**: `dataMapping` 函数用于将后端字段映射到前端需要的格式,返回转换后的对象

4. **样式定制**: 组件只提供基础的加载/空状态样式,列表项样式完全由父组件通过插槽自定义

5. **响应式数据**: 插槽中的 `items` 是响应式数据,会随着加载、刷新自动更新

<template>
    <view class="refresh-load-list">
        <scroll-view class="scroll-container" scroll-y="true" @scrolltolower="loadMore" refresher-enabled
            :refresher-triggered="refreshing" @refresherrefresh="onRefresh" @refresherrestore="onRestore">

            <!-- 列表内容插槽 - 父组件自定义样式 -->
            <slot :items="listData" :loading="loading" :refreshing="refreshing"></slot>

            <!-- 加载状态 -->
            <view class="loading-status" v-if="listData.length > 0">
                <text class="loading-text" v-if="loading">加载中...</text>
                <text class="loading-text" v-else-if="noMore">没有更多了</text>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="!loading && !refreshing && listData.length === 0">
                <slot name="empty">
                    <text class="empty-icon">{{ emptyIcon }}</text>
                    <text class="empty-text">{{ emptyText }}</text>
                </slot>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

// Props 定义
const props = defineProps({
    // API 请求函数
    api: {
        type: Function,
        required: true
    },
    // 额外的请求参数(如分类筛选等)
    params: {
        type: Object,
        default: () => ({})
    },
    // 数据映射函数(将后端数据转换为前端格式)
    dataMapping: {
        type: Function,
        default: (item) => item
    },
    // 自定义数据提取函数(从响应中提取列表数据)
    customDataExtractor: {
        type: Function,
        default: null
    },
    // 每页数量
    pageSize: {
        type: Number,
        default: 10
    },
    // 空状态图标
    emptyIcon: {
        type: String,
        default: '📋'
    },
    // 空状态文本
    emptyText: {
        type: String,
        default: '暂无数据'
    },
    // 是否自动加载
    autoLoad: {
        type: Boolean,
        default: true
    }
})

// Emits 定义
const emit = defineEmits(['load-success', 'load-error'])

// 分页参数
const pageNum = ref(1)
const total = ref(0)
const loading = ref(false)
const refreshing = ref(false)
const noMore = ref(false)

// 列表数据
const listData = ref([])

// 加载列表数据
const loadData = async (isRefresh = false) => {
    if (loading.value || (noMore.value && !isRefresh)) {
        return
    }

    try {
        loading.value = true

        const requestParams = {
            pageNum: pageNum.value,
            pageSize: props.pageSize,
            ...props.params
        }

        const res = await props.api(requestParams)

        let rawData = []

        // 如果有自定义数据提取函数,优先使用
        if (props.customDataExtractor) {
            rawData = props.customDataExtractor(res)
        } else {
            // 兼容不同的响应格式
            if (res && Array.isArray(res.rows)) {
                rawData = res.rows
                total.value = res.total || 0
            } else if (res && Array.isArray(res.data)) {
                rawData = res.data
                total.value = res.total || 0
            } else if (res && Array.isArray(res)) {
                rawData = res
            }
        }

        // 使用传入的映射函数转换数据
        const newData = rawData.map(item => props.dataMapping(item))        // 如果是刷新,则替换数据;否则追加数据
        if (isRefresh) {
            listData.value = newData
        } else {
            listData.value = [...listData.value, ...newData]
        }

        // 判断是否还有更多数据
        if (listData.value.length >= total.value || newData.length < props.pageSize) {
            noMore.value = true
        } else {
            noMore.value = false
        }

        // 触发成功事件
        emit('load-success', {
            data: newData,
            total: total.value,
            pageNum: pageNum.value
        })
    } catch (error) {
        console.error('加载数据失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })

        // 触发错误事件
        emit('load-error', error)
    } finally {
        loading.value = false
        refreshing.value = false
    }
}

// 下拉刷新
const onRefresh = async () => {
    refreshing.value = true
    pageNum.value = 1
    noMore.value = false
    await loadData(true)
}

// 刷新完成
const onRestore = () => {
    refreshing.value = false
}

// 加载更多
const loadMore = async () => {
    if (loading.value || noMore.value) {
        return
    }
    pageNum.value++
    await loadData(false)
}

// 重新加载(暴露给父组件调用)
const reload = async () => {
    pageNum.value = 1
    noMore.value = false
    listData.value = []
    await loadData(true)
}

// 监听 params 变化,自动重新加载
watch(() => props.params, async (newParams, oldParams) => {
    console.log('RefreshLoadList watch 触发')
    console.log('新参数:', JSON.stringify(newParams))
    console.log('旧参数:', JSON.stringify(oldParams))

    // 深度比较参数是否真的变化了
    if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
        console.log('参数确实变化了,重新加载数据')
        await reload()
    } else {
        console.log('参数未变化,跳过加载')
    }
}, { deep: true })

// 暴露方法给父组件
defineExpose({
    reload,
    loadData,
    listData
})

// 组件挂载时自动加载
onMounted(() => {
    if (props.autoLoad) {
        loadData(true)
    }
})
</script>

<style scoped lang="scss">
.refresh-load-list {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

.scroll-container {
    flex: 1;
    height: 100%;
}

/* 加载状态 */
.loading-status {
    padding: 30rpx 0;
    text-align: center;
}

.loading-text {
    font-size: 26rpx;
    color: #999;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
    opacity: 0.3;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>

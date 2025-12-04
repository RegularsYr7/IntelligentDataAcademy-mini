<template>
    <view class="page">
        <view class="container">
            <RefreshLoadList ref="listRef" :api="getShowcaseList" :params="requestParams" :dataMapping="mapShowcaseData"
                :pageSize="10" emptyIcon="🎨" emptyText="暂无风采展示" class="list-container">

                <template #header>
                    <!-- 搜索框 -->
                    <view class="search-box">
                        <u-search placeholder="搜索风采展示" v-model="keyword" :showAction="true" actionText="搜索"
                            :animation="true" @search="handleSearch" @custom="handleCustom" @clear="handleSearch">
                        </u-search>
                    </view>

                    <!-- 分类标签 -->
                    <view class="category-tabs">
                        <scroll-view scroll-x="true" class="tabs-scroll">
                            <view class="tab-item" v-for="(category, index) in categories" :key="index"
                                :class="{ active: currentCategory === category.id }" @tap="switchCategory(category.id)">
                                {{ category.name }}
                            </view>
                        </scroll-view>
                    </view>
                </template>

                <!-- 自定义列表项样式 -->
                <template #default="{ items }">
                    <view class="showcase-list">
                        <view class="showcase-item" v-for="item in items" :key="item.id" @tap="goToDetail(item.id)">
                            <image class="item-image" :src="item.coverImage" mode="aspectFill"></image>
                            <view class="item-content">
                                <view class="item-header">
                                    <text class="item-title">{{ item.title }}</text>
                                    <view class="item-type" :class="getTypeClass(item.type)">
                                        {{ getTypeName(item.type) }}
                                    </view>
                                </view>
                                <text class="item-desc">{{ item.description }}</text>
                                <view class="item-footer">
                                    <text class="item-meta">
                                        <text class="meta-icon">👁</text>
                                        {{ item.views }} 次浏览
                                    </text>
                                    <text class="item-meta">
                                        <text class="meta-icon">🕒</text>
                                        {{ item.publishTime }}
                                    </text>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </RefreshLoadList>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getShowcaseList, getShowcaseTypesMap } from '@/api/showcase'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'

// 列表组件引用
const listRef = ref(null)

// 分类数据
const categories = ref([
    { id: 'all', name: '全部' }
])

// 当前选中分类
const currentCategory = ref('all')
// 搜索关键字
const keyword = ref('')
const searchKeyword = ref('')

// 计算请求参数
const requestParams = computed(() => {
    const params = {}

    // 如果有选中的分类且不是"全部",直接使用value值
    if (currentCategory.value !== 'all') {
        params.type = currentCategory.value
    }

    // 如果有搜索关键字
    if (searchKeyword.value) {
        params.keyword = searchKeyword.value
    }

    return params
})

// 搜索处理
const handleSearch = () => {
    searchKeyword.value = keyword.value
}

// 点击搜索按钮
const handleCustom = () => {
    handleSearch()
}

// 数据映射函数(后端 -> 前端)
const mapShowcaseData = (item) => {
    const showcaseTypeMap = {
        '1': 'student',    // 优秀学生
        '2': 'teacher',    // 优秀教师
        '3': 'organization' // 优秀组织
    }

    return {
        id: item.showcaseId,
        title: item.showcaseName,
        type: showcaseTypeMap[item.showcaseType] || 'student',
        coverImage: item.coverImageUrl || 'https://picsum.photos/400/300?random=' + item.showcaseId,
        description: item.displayInfo || item.introduction || '',
        views: item.viewCount || 0,
        publishTime: item.displayTime || ''
    }
}

// 切换分类
const switchCategory = (categoryId) => {
    currentCategory.value = categoryId
    // requestParams 变化会自动触发组件重新加载
}

// 获取类型名称
const getTypeName = (type) => {
    const typeMap = {
        'student': '优秀学生',
        'teacher': '优秀教师',
        'organization': '优秀组织'
    }
    return typeMap[type] || ''
}

// 获取类型样式类
const getTypeClass = (type) => {
    return `type-${type}`
}

// 跳转详情页
const goToDetail = (id) => {
    uni.navigateTo({
        url: `/pages/showcase-detail/showcase-detail?id=${id}`
    })
}

// 获取风采展示类型映射
const fetchTypesMap = async () => {
    try {
        const res = await getShowcaseTypesMap()
        console.log('风采展示类型映射原始数据:', res)

        // 接口直接返回数组(与competition一样)
        const dataArray = Array.isArray(res) ? res : (res.data || [])
        console.log('数据数组:', dataArray)

        if (Array.isArray(dataArray) && dataArray.length > 0) {
            const categoryList = dataArray.map(item => ({
                id: item.value,
                name: item.label
            }))

            console.log('转换后的分类:', categoryList)

            // 保留"全部"选项,添加接口返回的分类
            categories.value = [
                { id: 'all', name: '全部' },
                ...categoryList
            ]

            console.log('最终的分类数据:', categories.value)
        } else {
            console.log('数据格式不正确或数据为空')
        }
    } catch (error) {
        console.error('获取风采展示类型映射失败:', error)
    }
}

onLoad(() => {
    // 页面加载完成,获取类型映射
    fetchTypesMap()
})

</script>

<style scoped lang="scss">
.page {
    height: 100vh;
    overflow: hidden;
}

.container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
}

.list-container {
    flex: 1;
    height: 0;
    width: 100%;
}

/* 搜索框 */
.search-box {
    padding: 20rpx;
    background: #fff;
    border-bottom: 1rpx solid #f0f0f0;
}

/* 分类标签 */
.category-tabs {
    background: #fff;
    padding: 20rpx 0;
    margin-bottom: 20rpx;
}

.tabs-scroll {
    white-space: nowrap;
}

.tab-item {
    display: inline-block;
    padding: 12rpx 32rpx;
    margin: 0 10rpx;
    font-size: 28rpx;
    color: #666;
    border-radius: 40rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        color: #fff;
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        font-weight: bold;
    }

    &:first-child {
        margin-left: 20rpx;
    }

    &:last-child {
        margin-right: 20rpx;
    }
}

/* 风采列表 */
.showcase-list {
    padding: 0 20rpx 20rpx 20rpx;
}

.showcase-item {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
}

.item-image {
    width: 100%;
    height: 360rpx;
}

.item-content {
    padding: 24rpx;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
}

.item-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-right: 20rpx;
}

.item-type {
    flex-shrink: 0;
    padding: 6rpx 16rpx;
    font-size: 22rpx;
    border-radius: 20rpx;

    &.type-student {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #f5576c;
    }

    &.type-teacher {
        background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
        color: #667eea;
    }

    &.type-organization {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: #ff8a00;
    }
}

.item-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.item-footer {
    display: flex;
    gap: 30rpx;
}

.item-meta {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
}

.meta-icon {
    margin-right: 6rpx;
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

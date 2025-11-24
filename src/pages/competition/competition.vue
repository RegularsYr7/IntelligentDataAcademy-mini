<template>
    <view class="page">
        <view class="container">
            <RefreshLoadList ref="listRef" :api="getCompetitionList" :params="requestParams"
                :dataMapping="mapCompetitionData" :pageSize="10" emptyIcon="📋" emptyText="暂无竞赛信息"
                class="list-container">

                <template #header>
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
                    <view class="competition-list">
                        <view class="competition-item" v-for="item in items" :key="item.id" @tap="goToDetail(item.id)">
                            <view class="item-header">
                                <text class="item-title">{{ item.title }}</text>
                                <view class="item-status" :class="getStatusClass(item.status)">
                                    {{ item.status }}
                                </view>
                            </view>
                            <view class="item-info">
                                <view class="info-row">
                                    <text class="info-label">报名时间：</text>
                                    <text class="info-value">{{ item.registrationTime }}</text>
                                </view>
                                <view class="info-row">
                                    <text class="info-label">竞赛时间：</text>
                                    <text class="info-value">{{ item.competitionTime }}</text>
                                </view>
                                <view class="info-row">
                                    <text class="info-label">浏览次数：</text>
                                    <text class="info-value">{{ item.views }} 次</text>
                                </view>
                            </view>
                            <view class="item-footer">
                                <text class="category-tag">{{ item.category }}</text>
                                <text class="view-detail">查看详情 ></text>
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
import { getCompetitionList, getCompetitionCategoriesMap } from '@/api/competition'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'

// 列表组件引用
const listRef = ref(null)

// 分类数据
const categories = ref([
    { id: 'all', name: '全部' }
])

// 当前选中分类
const currentCategory = ref('all')

// 竞赛分类映射: 后端类型 -> 中文名称
const competitionCategoryMap = {
    '1': '学科竞赛',
    '2': '技能竞赛',
    '3': '创新创业',
    '4': '文化艺术',
    '5': '体育竞技'
}

// 竞赛状态映射: 后端状态 -> 前端文本
const competitionStatusMap = {
    '0': '报名中',
    '1': '进行中',
    '2': '已结束',
    '3': '已取消'
}

// 计算请求参数
const requestParams = computed(() => {
    const params = {}

    // 如果有选中的分类且不是"全部",直接使用value值
    if (currentCategory.value !== 'all') {
        params.category = currentCategory.value
    }

    return params
})

// 数据映射函数(后端 -> 前端)
const mapCompetitionData = (item) => {
    const mappedCategory = competitionCategoryMap[item.competitionCategory] || '其他'

    return {
        id: item.competitionId,
        title: item.competitionName,
        category: mappedCategory,
        categoryId: item.competitionCategory, // 保留原始ID用于筛选
        status: competitionStatusMap[item.competitionStatus] || '未知',
        registrationTime: formatTimeRange(item.registrationStartTime, item.registrationEndTime),
        competitionTime: formatDateTime(item.competitionStartTime),
        views: item.viewCount || 0,
        publishTime: item.publishTime || ''
    }
}

// 切换分类
const switchCategory = (categoryId) => {
    currentCategory.value = categoryId
    // requestParams 变化会自动触发组件重新加载
}

// 格式化时间范围
const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return '暂无'
    // 去掉时间部分,只保留日期
    const start = startTime.split(' ')[0]
    const end = endTime.split(' ')[0]
    return `${start} 至 ${end}`
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
    if (!dateTime) return '暂无'
    return dateTime
}

// 获取分类名称
const getCategoryName = (categoryId) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category ? category.name : ''
}

// 获取状态样式类
const getStatusClass = (status) => {
    const statusMap = {
        '报名中': 'status-active',
        '进行中': 'status-ongoing',
        '即将开始': 'status-upcoming',
        '已结束': 'status-ended'
    }
    return statusMap[status] || ''
}

// 跳转详情页
const goToDetail = (id) => {
    uni.navigateTo({
        url: `/pages/competition-detail/competition-detail?id=${id}`
    })
}

// 获取竞赛分类映射
const fetchCategoriesMap = async () => {
    try {
        const res = await getCompetitionCategoriesMap()
        const dataArray = Array.isArray(res) ? res : (res.data || [])
        if (Array.isArray(dataArray) && dataArray.length > 0) {
            const uniqueCategories = []
            const valueSet = new Set()

            dataArray.forEach(item => {
                if (!valueSet.has(item.value)) {
                    valueSet.add(item.value)
                    uniqueCategories.push({
                        id: item.value,
                        name: item.label
                    })
                }
            })


            categories.value = [
                { id: 'all', name: '全部' },
                ...uniqueCategories
            ]
        } else {
            console.log('数据格式不正确或数据为空')
        }
    } catch (error) {
        console.error('获取竞赛分类映射失败:', error)
    }
}

onLoad(() => {
    // 页面加载完成,获取分类映射
    fetchCategoriesMap()
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

/* 分类标签 */
.category-tabs {
    background: #fff;
    padding: 20rpx 0;
    margin-bottom: 20rpx;
}

.list-container {
    flex: 1;
    height: 0;
    width: 100%;
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
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
        font-weight: bold;
    }

    &:first-child {
        margin-left: 20rpx;
    }

    &:last-child {
        margin-right: 20rpx;
    }
}

/* 竞赛列表 */
.competition-list {
    padding: 0 20rpx 20rpx 20rpx;
}

.competition-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
}

.item-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-right: 20rpx;
}

.item-status {
    flex-shrink: 0;
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    border-radius: 30rpx;
    background: #f5f5f5;
    color: #999;

    &.status-active {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #ff6b6b;
    }

    &.status-ongoing {
        background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
        color: #667eea;
    }

    &.status-upcoming {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: #f5576c;
    }

    &.status-ended {
        background: #f5f5f5;
        color: #999;
    }
}

.item-info {
    margin-bottom: 20rpx;
}

.info-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    font-size: 26rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.info-label {
    color: #999;
    flex-shrink: 0;
}

.info-value {
    color: #666;
    flex: 1;
}

.item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.category-tag {
    font-size: 24rpx;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
}

.view-detail {
    font-size: 26rpx;
    color: #999;
}
</style>

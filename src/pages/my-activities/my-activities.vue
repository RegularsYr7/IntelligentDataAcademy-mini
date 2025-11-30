<template>
    <view class="page">
        <view class="container">
            <!-- 活动列表 - 使用组件 -->
            <RefreshLoadList ref="listRef" :api="getMyActivities" :params="listParams" :dataMapping="mapActivityData"
                :pageSize="10" emptyIcon="📅" :emptyText="'暂无' + getCurrentFilterText() + '活动'"
                @load-success="onLoadSuccess" :customDataExtractor="extractActivityList">

                <template #header>
                    <!-- 页面头部统计 -->
                    <view class="stats-header">
                        <view class="stat-item">
                            <text class="stat-value">{{ totalActivities }}</text>
                            <text class="stat-label">参与活动</text>
                        </view>
                        <view class="stat-divider"></view>
                        <view class="stat-item">
                            <text class="stat-value">{{ totalCredits }}</text>
                            <text class="stat-label">获得学分</text>
                        </view>
                        <view class="stat-divider"></view>
                        <view class="stat-item">
                            <text class="stat-value">{{ totalPoints }}</text>
                            <text class="stat-label">活动积分</text>
                        </view>
                    </view>

                    <!-- 状态筛选 -->
                    <view class="filter-section">
                        <scroll-view class="filter-tabs" scroll-x>
                            <view class="filter-tab" v-for="(filter, index) in filters" :key="index"
                                :class="{ active: currentFilter === filter.value }" @tap="switchFilter(filter.value)">
                                <text class="tab-text">{{ filter.icon }} {{ filter.label }}</text>
                                <view class="tab-count" v-if="filter.count > 0">{{ filter.count }}</view>
                            </view>
                        </scroll-view>
                    </view>
                </template>

                <template #default="{ items }">
                    <view class="activity-list">
                        <view class="activity-item" v-for="activity in items" :key="activity.id"
                            @tap="goToDetail(activity)">
                            <view class="image-wrapper">
                                <image class="activity-image" :src="activity.image" mode="aspectFill"></image>
                                <view class="activity-status" :class="'status-' + activity.status">
                                    <text class="status-text">{{ getStatusText(activity.status) }}</text>
                                </view>
                            </view>
                            <view class="activity-info">
                                <text class="activity-title">{{ activity.title }}</text>
                                <view class="activity-meta">
                                    <view class="meta-item">
                                        <text class="meta-icon">📅</text>
                                        <text class="meta-text">{{ activity.date }}</text>
                                    </view>
                                    <view class="meta-item">
                                        <text class="meta-icon">📍</text>
                                        <text class="meta-text">{{ activity.location }}</text>
                                    </view>
                                </view>
                                <view class="activity-footer">
                                    <view class="footer-left">
                                        <text class="credit-badge">{{ activity.credit }} 学分</text>
                                    </view>
                                    <text class="organizer">{{ activity.organizer }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>

                <template #empty>
                    <view class="empty-action" @tap="goToActivityList">
                        <text class="action-text">去发现活动</text>
                    </view>
                </template>
            </RefreshLoadList>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'
import { getMyActivities } from '@/api/student'

const listRef = ref(null)
const currentFilter = ref('all')

// 筛选选项
const filters = ref([
    { label: '全部', value: 'all', icon: '📋', count: 0 },
    { label: '预热中', value: '1', icon: '⏰', count: 0 },
    { label: '报名中', value: '2', icon: '📝', count: 0 },
    { label: '待开始', value: '3', icon: '⏳', count: 0 },
    { label: '进行中', value: '4', icon: '🔥', count: 0 },
    { label: '已结束', value: '5', icon: '✅', count: 0 },
    { label: '已完结', value: '6', icon: '🏁', count: 0 }
])

// 统计数据
const totalActivities = ref(0)
const totalCredits = ref(0)
const totalPoints = ref(0)

// 列表请求参数
const listParams = computed(() => {
    const params = {}

    // 添加状态筛选 - 只有非 'all' 时才传递 currentStatus
    if (currentFilter.value !== 'all') {
        params.currentStatus = Number(currentFilter.value)
    }

    return params
})

// 格式化时间
const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '时间待定'

    try {
        const date = new Date(dateTimeStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (error) {
        console.error('时间格式化失败:', error)
        return dateTimeStr
    }
}

// 数据映射函数
const mapActivityData = (item) => {
    return {
        id: item.activityId,
        title: item.activityName || item.name,
        image: item.coverImage || item.activityImage || 'https://picsum.photos/400/300?random=' + item.activityId,
        date: formatDateTime(item.activityStartTime || item.startTime || item.date),
        location: item.activityLocation || item.location || '未知地点',
        status: mapActivityStatus(item.currentStatus),
        credit: item.creditValue || item.credit || 0,
        points: item.scoreValue || item.points || 0,
        organizer: item.organizerNames || item.organizer
    }
}

// 映射活动状态 - 后端状态码转前端显示状态
const mapActivityStatus = (status) => {
    const statusMap = {
        1: 'upcoming',      // 预热中
        2: 'recruiting',    // 报名中
        3: 'waiting',       // 等待中
        4: 'ongoing',       // 进行中
        5: 'finished',      // 已结束
        6: 'completed'      // 已完结
    }
    return statusMap[status] || 'recruiting'
}

// 自定义数据提取函数 - 从后端响应中提取活动列表和统计数据
const extractActivityList = (response) => {
    console.log('后端响应数据:', response)

    // 仅在“全部”筛选下更新顶部统计数据
    if (currentFilter.value === 'all') {
        if (response.totalCredits !== undefined) {
            totalCredits.value = response.totalCredits
        }
        if (response.totalPoints !== undefined) {
            totalPoints.value = response.totalPoints
        }
        if (response.participantCount !== undefined) {
            totalActivities.value = response.participantCount
        }
    }

    // 更新当前选中标签的计数 (如果后端返回了总数)
    // 注意：这里假设 participantCount 是当前查询的总数
    if (response.participantCount !== undefined) {
        const filter = filters.value.find(f => f.value === currentFilter.value)
        if (filter) {
            filter.count = response.participantCount
        }
    }

    // 返回活动列表
    return response.activityList || []
}

// 数据加载成功回调
const onLoadSuccess = (result) => {
    console.log('活动列表加载成功:', result)
}

onLoad(() => {
    console.log('我的活动页面加载')
})

// 切换筛选
const switchFilter = (value) => {
    currentFilter.value = value
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        upcoming: '预热中',
        recruiting: '报名中',
        waiting: '等待中',
        ongoing: '进行中',
        finished: '已结束',
        completed: '已完结'
    }
    return statusMap[status] || ''
}

// 获取当前筛选文本
const getCurrentFilterText = () => {
    const filter = filters.value.find(f => f.value === currentFilter.value)
    return filter && filter.value !== 'all' ? filter.label : ''
}

// 跳转到活动详情
const goToDetail = (activity) => {
    uni.navigateTo({
        url: `/pages/activity-detail/activity-detail?id=${activity.id}`
    })
}

// 跳转到活动列表
const goToActivityList = () => {
    uni.switchTab({
        url: '/pages/activity/activity'
    })
}
</script>

<style scoped lang="scss">
.container {
    height: 100vh;
    background: #f5f5f5;
    overflow: hidden;
}

/* 统计头部 */
.stats-header {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    padding: 40rpx 30rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #fff;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 44rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
}

.stat-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

.stat-divider {
    width: 2rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
}

/* 筛选区域 */
.filter-section {
    background: #fff;
    margin: 0 20rpx 20rpx;
    border-radius: 16rpx;
    padding: 16rpx 24rpx;
}

.filter-tabs {
    white-space: nowrap;

    &::-webkit-scrollbar {
        display: none;
    }
}

.filter-tab {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    margin-right: 16rpx;
    background-color: #f5f5f5;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s;
    position: relative;

    &.active {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);

        .tab-text {
            color: #fff;
        }

        .tab-count {
            background: rgba(255, 255, 255, 0.3);
            color: #fff;
        }
    }

    &:last-child {
        margin-right: 0;
    }
}

.tab-text {
    white-space: nowrap;
}

.tab-count {
    min-width: 36rpx;
    height: 36rpx;
    padding: 0 8rpx;
    background: #e0e0e0;
    color: #666;
    border-radius: 18rpx;
    font-size: 20rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 活动列表 */
.activity-list {
    padding: 0 20rpx;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
}

.activity-item {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    position: relative;

    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }
}

.image-wrapper {
    position: relative;
    width: 100%;
    height: 240rpx;
}

.activity-image {
    width: 100%;
    height: 100%;
}

.activity-info {
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.activity-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    min-height: 78rpx;
}

.activity-status {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    padding: 6rpx 16rpx;
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);

    &.status-ongoing {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    }

    &.status-upcoming {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.status-recruiting {
        background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
    }

    &.status-waiting {
        background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
    }

    &.status-finished {
        background: linear-gradient(135deg, #999 0%, #666 100%);
    }

    &.status-completed {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
}

.status-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: bold;
}

.activity-meta {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
}

.meta-icon {
    font-size: 20rpx;
    line-height: 1;
    display: flex;
    align-items: center;
}

.meta-text {
    font-size: 22rpx;
    color: #999;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.activity-footer {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid #f0f0f0;
}

.footer-left {
    display: flex;
    gap: 8rpx;
}

.credit-badge,
.points-badge {
    padding: 4rpx 10rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.credit-badge {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.points-badge {
    background: rgba(243, 156, 18, 0.1);
    color: #f39c12;
}

.organizer {
    font-size: 22rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 空状态 */
.empty-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
}

.empty-action {
    padding: 16rpx 40rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
}
</style>

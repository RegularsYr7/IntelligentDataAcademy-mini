<template>
    <view class="page">
        <view class="container">
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

            <!-- 活动列表 -->
            <view class="activity-list">
                <view class="activity-item" v-for="(activity, index) in displayActivities" :key="index"
                    @tap="goToDetail(activity)">
                    <image class="activity-image" :src="activity.image" mode="aspectFill"></image>
                    <view class="activity-info">
                        <view class="activity-header">
                            <text class="activity-title">{{ activity.title }}</text>
                            <view class="activity-status" :class="'status-' + activity.status">
                                <text class="status-text">{{ getStatusText(activity.status) }}</text>
                            </view>
                        </view>
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
                                <text class="points-badge">{{ activity.points }} 积分</text>
                            </view>
                            <text class="organizer">{{ activity.organizer }}</text>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view class="empty-state" v-if="displayActivities.length === 0">
                    <text class="empty-icon">📅</text>
                    <text class="empty-text">暂无{{ getCurrentFilterText() }}活动</text>
                    <view class="empty-action" @tap="goToActivityList">
                        <text class="action-text">去发现活动</text>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const currentFilter = ref('all')

// 筛选选项
const filters = ref([
    { label: '全部', value: 'all', icon: '📋', count: 0 },
    { label: '进行中', value: 'ongoing', icon: '🔥', count: 0 },
    { label: '即将开始', value: 'upcoming', icon: '⏰', count: 0 },
    { label: '已完成', value: 'completed', icon: '✅', count: 0 }
])

// 我的活动数据
const myActivities = ref([
    {
        id: 1,
        title: '人工智能前沿技术讲座',
        image: 'https://picsum.photos/400/300?random=30',
        date: '2025-11-05 14:00',
        location: '学术报告厅A101',
        status: 'upcoming',
        credit: 2,
        points: 10,
        organizer: '科技创新协会'
    },
    {
        id: 2,
        title: '校园运动会志愿者服务',
        image: 'https://picsum.photos/400/300?random=31',
        date: '2025-11-03 08:00',
        location: '田径场',
        status: 'ongoing',
        credit: 1,
        points: 5,
        organizer: '学生会'
    },
    {
        id: 3,
        title: '编程马拉松大赛',
        image: 'https://picsum.photos/400/300?random=32',
        date: '2025-10-20 09:00',
        location: '计算机楼301',
        status: 'completed',
        credit: 3,
        points: 15,
        organizer: '计算机协会'
    },
    {
        id: 4,
        title: '职业规划讲座',
        image: 'https://picsum.photos/400/300?random=33',
        date: '2025-10-15 15:00',
        location: '多功能厅',
        status: 'completed',
        credit: 1,
        points: 5,
        organizer: '就业指导中心'
    },
    {
        id: 5,
        title: '社团招新活动',
        image: 'https://picsum.photos/400/300?random=34',
        date: '2025-10-10 14:00',
        location: '学生活动中心',
        status: 'completed',
        credit: 0,
        points: 3,
        organizer: '社团联合会'
    },
    {
        id: 6,
        title: '创新创业分享会',
        image: 'https://picsum.photos/400/300?random=35',
        date: '2025-11-12 16:00',
        location: '创业园B座',
        status: 'upcoming',
        credit: 2,
        points: 8,
        organizer: '创业实践社'
    }
])

// 筛选后的活动列表
const displayActivities = computed(() => {
    if (currentFilter.value === 'all') {
        return myActivities.value
    }
    return myActivities.value.filter(activity => activity.status === currentFilter.value)
})

// 统计数据
const totalActivities = computed(() => myActivities.value.length)

const totalCredits = computed(() => {
    return myActivities.value.reduce((sum, activity) => sum + activity.credit, 0)
})

const totalPoints = computed(() => {
    return myActivities.value.reduce((sum, activity) => sum + activity.points, 0)
})

// 更新筛选项计数
const updateFilterCounts = () => {
    filters.value[0].count = myActivities.value.length
    filters.value[1].count = myActivities.value.filter(a => a.status === 'ongoing').length
    filters.value[2].count = myActivities.value.filter(a => a.status === 'upcoming').length
    filters.value[3].count = myActivities.value.filter(a => a.status === 'completed').length
}

onLoad(() => {
    console.log('我的活动页面加载')
    updateFilterCounts()

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【我的活动页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取我的活动列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/activities/my')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        status: 'all', // all | upcoming | ongoing | finished
        page: 1,
        pageSize: 10
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            list: [
                {
                    id: 1,
                    title: '大数据技术分享会',
                    cover: 'https://example.com/cover.jpg',
                    category: 'lecture',
                    status: 'upcoming',
                    startTime: '2024-11-05 14:00',
                    endTime: '2024-11-05 16:00',
                    location: '教学楼A301',
                    organization: { id: 1, name: '数据科学社团' },
                    participants: 45,
                    maxParticipants: 100,
                    registrationTime: '2024-10-20 10:30', // 报名时间
                    isSignedIn: false, // 是否已签到
                    signInTime: null // 签到时间
                }
            ],
            total: 25,
            statusCounts: {
                all: 25,
                upcoming: 8,
                ongoing: 2,
                finished: 15
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 取消报名')
    console.log('━'.repeat(80))
    console.log('请求方式: DELETE')
    console.log('接口路径: /api/activities/:id/register')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('📝 只能取消upcoming状态的活动,ongoing和finished不允许取消')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        ongoing: '进行中',
        upcoming: '即将开始',
        completed: '已完成'
    }
    return statusMap[status] || ''
}

// 获取当前筛选文本
const getCurrentFilterText = () => {
    const filter = filters.value.find(f => f.value === currentFilter.value)
    return filter && filter.value !== 'all' ? filter.label : ''
}

// 切换筛选
const switchFilter = (value) => {
    currentFilter.value = value
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
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}

/* 统计头部 */
.stats-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40rpx 30rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20rpx;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

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

    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }
}

.activity-image {
    width: 100%;
    height: 240rpx;
}

.activity-info {
    padding: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.activity-header {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.activity-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
    min-height: 78rpx;
}

.activity-status {
    align-self: flex-start;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &.status-ongoing {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.status-upcoming {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

<template>
    <view class="page">
        <view class="container">
            <!-- 页面头部统计 -->
            <view class="stats-header">
                <view class="stat-item">
                    <text class="stat-value">{{ totalScore }}</text>
                    <text class="stat-label">当前总分</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ monthlyGain }}</text>
                    <text class="stat-label">本月获得</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ recordCount }}</text>
                    <text class="stat-label">成长记录</text>
                </view>
            </view>

            <!-- 成长趋势图 -->
            <view class="chart-section">
                <view class="section-title">
                    <text class="title-icon">📊</text>
                    <text class="title-text">成长趋势</text>
                </view>
                <view class="growth-chart">
                    <view class="chart-item" v-for="(record, index) in monthlyTrend" :key="index">
                        <view class="chart-bar">
                            <view class="bar-fill" :style="{ height: (record.score / 100 * 100) + '%' }"></view>
                        </view>
                        <text class="chart-label">{{ record.month }}</text>
                        <text class="chart-score">{{ record.score }}</text>
                    </view>
                </view>
            </view>

            <!-- 类型筛选 -->
            <view class="filter-section">
                <scroll-view class="filter-tabs" scroll-x>
                    <view class="filter-tab" v-for="(filter, index) in filters" :key="index"
                        :class="{ active: currentFilter === filter.value }" @tap="switchFilter(filter.value)">
                        <text class="tab-text">{{ filter.icon }} {{ filter.label }}</text>
                        <view class="tab-count" v-if="filter.count > 0">{{ filter.count }}</view>
                    </view>
                </scroll-view>
            </view>

            <!-- 成长记录列表 -->
            <view class="record-list">
                <view class="record-item" v-for="(record, index) in displayRecords" :key="index">
                    <view class="record-date">
                        <text class="date-day">{{ record.day }}</text>
                        <text class="date-month">{{ record.month }}</text>
                    </view>
                    <view class="record-content">
                        <view class="record-header">
                            <view class="record-type" :class="'type-' + record.type">
                                <text class="type-icon">{{ getTypeIcon(record.type) }}</text>
                                <text class="type-text">{{ getTypeText(record.type) }}</text>
                            </view>
                            <view class="record-score"
                                :class="{ positive: record.score > 0, negative: record.score < 0 }">
                                <text class="score-text">{{ record.score > 0 ? '+' : '' }}{{ record.score }}</text>
                            </view>
                        </view>
                        <text class="record-title">{{ record.title }}</text>
                        <text class="record-time">{{ record.time }}</text>
                    </view>
                </view>

                <!-- 空状态 -->
                <view class="empty-state" v-if="displayRecords.length === 0">
                    <text class="empty-icon">📝</text>
                    <text class="empty-text">暂无{{ getCurrentFilterText() }}记录</text>
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
    { label: '活动', value: 'activity', icon: '🎯', count: 0 },
    { label: '证书', value: 'certificate', icon: '🏆', count: 0 },
    { label: '竞赛', value: 'competition', icon: '🥇', count: 0 },
    { label: '其他', value: 'other', icon: '✨', count: 0 }
])

// 月度趋势数据
const monthlyTrend = ref([
    { month: '5月', score: 78 },
    { month: '6月', score: 82 },
    { month: '7月', score: 85 },
    { month: '8月', score: 88 },
    { month: '9月', score: 92 },
    { month: '10月', score: 95 }
])

// 成长记录数据
const growthRecords = ref([
    {
        id: 1,
        type: 'activity',
        title: '参加人工智能前沿技术讲座',
        score: 2,
        time: '2025-10-28 14:00',
        day: '28',
        month: '10月'
    },
    {
        id: 2,
        type: 'certificate',
        title: '获得全国计算机等级考试二级证书',
        score: 5,
        time: '2025-10-25 10:30',
        day: '25',
        month: '10月'
    },
    {
        id: 3,
        type: 'activity',
        title: '参加校园运动会志愿者服务',
        score: 1,
        time: '2025-10-20 08:00',
        day: '20',
        month: '10月'
    },
    {
        id: 4,
        type: 'competition',
        title: '编程马拉松大赛获得三等奖',
        score: 8,
        time: '2025-10-15 16:30',
        day: '15',
        month: '10月'
    },
    {
        id: 5,
        type: 'activity',
        title: '参加职业规划讲座',
        score: 1,
        time: '2025-10-12 15:00',
        day: '12',
        month: '10月'
    },
    {
        id: 6,
        type: 'certificate',
        title: '获得CET-6英语六级证书',
        score: 3,
        time: '2025-10-08 09:00',
        day: '08',
        month: '10月'
    },
    {
        id: 7,
        type: 'activity',
        title: '参加社团招新活动',
        score: 0.5,
        time: '2025-10-05 14:00',
        day: '05',
        month: '10月'
    },
    {
        id: 8,
        type: 'competition',
        title: '数学建模竞赛获得二等奖',
        score: 10,
        time: '2025-09-28 17:00',
        day: '28',
        month: '09月'
    },
    {
        id: 9,
        type: 'other',
        title: '发表学术论文一篇',
        score: 15,
        time: '2025-09-20 10:00',
        day: '20',
        month: '09月'
    },
    {
        id: 10,
        type: 'activity',
        title: '参加创新创业分享会',
        score: 2,
        time: '2025-09-15 16:00',
        day: '15',
        month: '09月'
    },
    {
        id: 11,
        type: 'certificate',
        title: '获得Java程序设计认证证书',
        score: 4,
        time: '2025-09-10 11:00',
        day: '10',
        month: '09月'
    },
    {
        id: 12,
        type: 'other',
        title: '完成校级科研项目',
        score: 12,
        time: '2025-09-05 09:30',
        day: '05',
        month: '09月'
    }
])

// 筛选后的记录列表
const displayRecords = computed(() => {
    if (currentFilter.value === 'all') {
        return growthRecords.value
    }
    return growthRecords.value.filter(record => record.type === currentFilter.value)
})

// 统计数据
const totalScore = computed(() => {
    return monthlyTrend.value[monthlyTrend.value.length - 1].score
})

const monthlyGain = computed(() => {
    const currentMonth = growthRecords.value.filter(r => r.month === '10月')
    return currentMonth.reduce((sum, record) => sum + record.score, 0)
})

const recordCount = computed(() => growthRecords.value.length)

// 更新筛选项计数
const updateFilterCounts = () => {
    filters.value[0].count = growthRecords.value.length
    filters.value[1].count = growthRecords.value.filter(r => r.type === 'activity').length
    filters.value[2].count = growthRecords.value.filter(r => r.type === 'certificate').length
    filters.value[3].count = growthRecords.value.filter(r => r.type === 'competition').length
    filters.value[4].count = growthRecords.value.filter(r => r.type === 'other').length
}

onLoad(() => {
    console.log('成长记录页面加载')
    updateFilterCounts()

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【成长记录页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取成长记录列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/growth-records')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        type: 'all', // all | activity | organization | competition | sign_in | post
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        pageSize: 20
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            list: [
                {
                    id: 1,
                    type: 'activity',
                    title: '参加数据分析讲座',
                    description: '完成活动签到并参与互动',
                    score: 10, // 量化分数
                    date: '2024-11-01',
                    relatedId: 1,
                    relatedType: 'activity',
                    tags: ['学习', '数据分析']
                }
            ],
            total: 156,
            statistics: {
                totalScore: 850,
                activityCount: 45,
                organizationCount: 3,
                competitionCount: 2,
                signInCount: 98,
                postCount: 8
            },
            typeCounts: {
                all: 156,
                activity: 45,
                organization: 3,
                competition: 2,
                sign_in: 98,
                post: 8
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 获取成长统计数据')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/growth-records/statistics')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        months: 6 // 最近几个月
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            monthlyData: [
                {
                    month: '2024-06',
                    score: 120,
                    count: 15
                }
            ],
            typeDistribution: {
                activity: 45,
                organization: 3,
                competition: 2,
                sign_in: 98,
                post: 8
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('type类型:')
    console.log('  - activity: 活动记录')
    console.log('  - organization: 组织记录')
    console.log('  - competition: 竞赛记录')
    console.log('  - sign_in: 签到记录')
    console.log('  - post: 发帖记录')
    console.log('\n量化分数规则:')
    console.log('  - 参加活动: 10分/次')
    console.log('  - 加入组织: 20分/个')
    console.log('  - 参加竞赛: 50分/次')
    console.log('  - 课堂签到: 5分/次')
    console.log('  - 发布帖子: 5分/篇')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 获取类型图标
const getTypeIcon = (type) => {
    const iconMap = {
        activity: '🎯',
        certificate: '🏆',
        competition: '🥇',
        other: '✨'
    }
    return iconMap[type] || '📝'
}

// 获取类型文本
const getTypeText = (type) => {
    const textMap = {
        activity: '活动',
        certificate: '证书',
        competition: '竞赛',
        other: '其他'
    }
    return textMap[type] || '未知'
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

/* 成长趋势图 */
.chart-section {
    background: #fff;
    margin: 0 20rpx 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 24rpx;
}

.title-icon {
    font-size: 32rpx;
    line-height: 1;
    display: flex;
    align-items: center;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    line-height: 1;
}

.growth-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 200rpx;
    padding: 0 10rpx;
}

.chart-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.chart-bar {
    width: 40rpx;
    height: 140rpx;
    background: #f0f0f0;
    border-radius: 20rpx 20rpx 0 0;
    position: relative;
    margin-bottom: 8rpx;
}

.bar-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 20rpx 20rpx 0 0;
    transition: height 0.3s ease;
}

.chart-label {
    font-size: 22rpx;
    color: #999;
    margin-bottom: 4rpx;
}

.chart-score {
    font-size: 20rpx;
    color: #667eea;
    font-weight: bold;
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

/* 记录列表 */
.record-list {
    padding: 0 20rpx;
}

.record-item {
    display: flex;
    gap: 20rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.record-date {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 80rpx;
    padding: 12rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 12rpx;
}

.date-day {
    font-size: 36rpx;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
    margin-bottom: 4rpx;
}

.date-month {
    font-size: 20rpx;
    color: #999;
}

.record-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.record-type {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 6rpx 16rpx;
    border-radius: 12rpx;
    font-size: 22rpx;

    &.type-activity {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.type-certificate {
        background: rgba(243, 156, 18, 0.1);
        color: #f39c12;
    }

    &.type-competition {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
    }

    &.type-other {
        background: rgba(46, 204, 113, 0.1);
        color: #2ecc71;
    }
}

.type-icon {
    font-size: 20rpx;
    line-height: 1;
    display: flex;
    align-items: center;
}

.type-text {
    font-weight: bold;
    line-height: 1;
}

.record-score {
    padding: 6rpx 16rpx;
    border-radius: 12rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;

    &.positive {
        background: rgba(46, 204, 113, 0.1);

        .score-text {
            color: #2ecc71;
        }
    }

    &.negative {
        background: rgba(231, 76, 60, 0.1);

        .score-text {
            color: #e74c3c;
        }
    }
}

.score-text {
    font-size: 24rpx;
}

.record-title {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    line-height: 1.5;
}

.record-time {
    font-size: 24rpx;
    color: #999;
}

/* 空状态 */
.empty-state {
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
}
</style>

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
import { getMyGrowthRecords } from '@/api/student'

const currentFilter = ref('all')

// 筛选选项
const filters = ref(
    [
        { label: '全部', value: 'all', icon: '📋', count: 0 },
        { label: '活动', value: 'activity', icon: '🎯', count: 0 },
        { label: '证书', value: 'certificate', icon: '🏆', count: 0 },
        { label: '竞赛', value: 'competition', icon: '🥇', count: 0 },
        { label: '其他', value: 'other', icon: '✨', count: 0 }
    ])

// 月度趋势数据
const monthlyTrend = ref([])

// 成长记录数据
const growthRecords = ref([])

// 筛选后的记录列表
const displayRecords = computed(() => {
    return growthRecords.value
})

// 统计数据
const totalScore = ref(0)
const monthlyGain = ref(0)
const recordCount = ref(0)

// 更新筛选项计数
const updateFilterCounts = () => {
    const current = filters.value.find(f => f.value === currentFilter.value)
    if (current) {
        current.count = recordCount.value
    }
}

const fetchGrowthData = async () => {
    const userInfo = uni.getStorageSync('userInfo')
    if (!userInfo) return

    // 映射前端筛选类型到后端参数
    // 1=活动，2=证书，3=竞赛，4=其他
    const typeMap = {
        'activity': '1',
        'certificate': '2',
        'competition': '3',
        'other': '4'
    }

    try {
        const res = await getMyGrowthRecords({
            studentId: userInfo.studentId,
            recordType: typeMap[currentFilter.value]
        })
        console.log('Growth records response:', res)

        if (res) {
            totalScore.value = res.currentQuantitativeScore || 0
            monthlyGain.value = res.currentMonthScore || 0
            recordCount.value = res.recordCount || 0

            // 映射趋势数据
            let trendData = []
            if (res.growthTrend && res.growthTrend.length > 0) {
                // 1. 解析后端数据
                trendData = res.growthTrend.map(item => {
                    let year, month
                    if (item.month && item.month.includes('-')) {
                        const parts = item.month.split('-')
                        year = parseInt(parts[0])
                        month = parseInt(parts[1])
                    } else {
                        // 尝试直接解析，或者默认为当前年
                        const now = new Date()
                        year = now.getFullYear()
                        month = parseInt(item.month) || (now.getMonth() + 1)
                    }
                    return {
                        year,
                        month,
                        score: item.score || 0
                    }
                })

                // 按时间排序
                trendData.sort((a, b) => {
                    if (a.year !== b.year) return a.year - b.year
                    return a.month - b.month
                })
            }

            // 2. 补齐数据到6条
            const neededCount = 6
            if (trendData.length < neededCount) {
                // 如果没有数据，从当前月开始往前推
                if (trendData.length === 0) {
                    const now = new Date()
                    let y = now.getFullYear()
                    let m = now.getMonth() + 1

                    for (let i = 0; i < neededCount; i++) {
                        trendData.unshift({
                            year: y,
                            month: m,
                            score: 0
                        })
                        // 往前推一个月
                        if (m === 1) {
                            m = 12
                            y--
                        } else {
                            m--
                        }
                    }
                } else {
                    // 有数据，从最早的数据往前补
                    let y = trendData[0].year
                    let m = trendData[0].month
                    const missingCount = neededCount - trendData.length

                    for (let i = 0; i < missingCount; i++) {
                        // 往前推一个月
                        if (m === 1) {
                            m = 12
                            y--
                        } else {
                            m--
                        }

                        trendData.unshift({
                            year: y,
                            month: m,
                            score: 0
                        })
                    }
                }
            } else if (trendData.length > neededCount) {
                // 如果超过6条，取最近的6条
                trendData = trendData.slice(trendData.length - neededCount)
            }

            // 3. 格式化输出
            monthlyTrend.value = trendData.map(item => ({
                month: item.month + '月',
                score: item.score
            }))

            // 映射记录列表
            growthRecords.value = (res.recordList || []).map(item => {
                let day = ''
                let month = ''

                if (item.recordTime) {
                    // 兼容处理日期字符串
                    const dateStr = item.recordTime.replace(/-/g, '/')
                    const date = new Date(dateStr)
                    if (!isNaN(date.getTime())) {
                        month = (date.getMonth() + 1) + '月'
                        day = date.getDate().toString().padStart(2, '0')
                    }
                }

                // 映射类型
                const typeReverseMap = {
                    '1': 'activity',
                    '2': 'certificate',
                    '3': 'competition',
                    '4': 'other'
                }

                return {
                    id: item.recordId,
                    type: typeReverseMap[item.recordType] || 'other',
                    title: item.sourceName || '未命名记录',
                    score: item.score,
                    time: item.recordTime,
                    day: day,
                    month: month
                }
            })

            updateFilterCounts()
        } else {
            // 如果没有返回数据，生成默认趋势
            monthlyTrend.value = generateDefaultMonthlyTrend()
        }
    } catch (e) {
        console.error(e)
        // 出错时也生成默认趋势
        monthlyTrend.value = generateDefaultMonthlyTrend()
    }
}

// 生成默认的月度趋势数据（最近6个月，全为0）
const generateDefaultMonthlyTrend = () => {
    const months = []
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1

    for (let i = 0; i < 6; i++) {
        months.unshift({
            month: month + '月',
            score: 0
        })

        // 往前推一个月
        if (month === 1) {
            month = 12
            year--
        } else {
            month--
        }
    }

    return months
}

onLoad(() => {
    console.log('成长记录页面加载')
    fetchGrowthData()
    updateFilterCounts()
})


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
    fetchGrowthData()
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
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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

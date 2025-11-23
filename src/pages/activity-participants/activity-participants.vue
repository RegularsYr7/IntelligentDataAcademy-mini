<template>
    <view class="page">
        <view class="container">
            <RefreshLoadList ref="listRef" :api="getParticipantList" :params="listParams"
                :dataMapping="mapParticipantData" :pageSize="20" emptyIcon="👥" emptyText="暂无报名人员">

                <template #header>
                    <!-- 统计信息 -->
                    <view class="stats-card">
                        <view class="stat-item">
                            <text class="stat-value">{{ statistics.total }}</text>
                            <text class="stat-label">总报名</text>
                        </view>
                        <view class="stat-divider"></view>
                        <view class="stat-item">
                            <text class="stat-value">{{ statistics.signedIn }}</text>
                            <text class="stat-label">已签到</text>
                        </view>
                        <view class="stat-divider"></view>
                        <view class="stat-item">
                            <text class="stat-value">{{ statistics.rate }}%</text>
                            <text class="stat-label">出勤率</text>
                        </view>
                    </view>

                    <!-- 筛选选项 -->
                    <view class="filter-bar">
                        <view class="filter-item" v-for="(filter, index) in filters" :key="index"
                            :class="{ active: currentFilter === filter.value }" @tap="switchFilter(filter.value)">
                            <text class="filter-text">{{ filter.label }}</text>
                        </view>
                    </view>
                </template>

                <template #default="{ items }">
                    <view class="participant-list">
                        <view class="participant-item" v-for="(item, index) in items" :key="index">
                            <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
                            <view class="info">
                                <view class="name-row">
                                    <text class="name">{{ item.name }}</text>
                                    <view class="role-tag" :class="getRoleClass(item.role)">
                                        {{ getRoleText(item.role) }}
                                    </view>
                                </view>
                                <text class="time">报名时间: {{ item.enrollTime }}</text>
                                <text v-if="item.signInTime" class="time">签到时间: {{ item.signInTime }}</text>
                            </view>
                            <view class="status-badge" :class="getStatusClass(item.status)">
                                {{ getStatusText(item.status) }}
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
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'
import { getParticipants } from '@/api/activity'

const listRef = ref(null)
const activityId = ref(null)
const currentFilter = ref('all')
const operatorId = ref(null)

// 统计数据
const statistics = ref({
    total: 0,
    signedIn: 0,
    rate: 0
})

// 筛选选项
const filters = ref([
    { label: '全部', value: 'all' },
    { label: '已签到', value: 'signed' },
    { label: '未签到', value: 'unsigned' }
])

// 列表请求参数
const listParams = computed(() => {
    return {
        activityId: activityId.value,
        status: currentFilter.value
    }
})

// 获取参与人员列表
const getParticipantList = async (params) => {
    try {
        const { pageNum, pageSize } = params

        // 刷新时（第一页）重新加载统计数据
        if (pageNum === 1) {
            loadAllStatistics()
        }

        const res = await getParticipants(activityId.value, {
            operatorId: operatorId.value,
            filter: currentFilter.value,
            pageNum,
            pageSize
        })

        return {
            total: res.total || 0,
            rows: res.rows || []
        }
    } catch (error) {
        console.error('获取参与人员列表失败:', error)
        throw error
    }
}

// 更新统计数据（基于全部人员数据计算）
const updateStatistics = (data) => {
    const totalEnrolled = data.total || 0
    const signedCount = (data.rows || []).filter(item =>
        item.enrollStatus === '1' || item.enrollStatus === '2'
    ).length

    statistics.value = {
        total: totalEnrolled,
        signedIn: signedCount,
        rate: totalEnrolled > 0 ? Math.round((signedCount / totalEnrolled) * 100) : 0
    }
}

// 加载全部人员统计数据
const loadAllStatistics = async () => {
    try {
        const res = await getParticipants(activityId.value, {
            operatorId: operatorId.value,
            filter: 'all',
            pageNum: 1,
            pageSize: 1000  // 获取所有数据用于统计
        })

        const totalEnrolled = res.total || 0
        const allRows = res.rows || []
        const signedCount = allRows.filter(item =>
            item.enrollStatus === '1' || item.enrollStatus === '2'
        ).length

        statistics.value = {
            total: totalEnrolled,
            signedIn: signedCount,
            rate: totalEnrolled > 0 ? Math.round((signedCount / totalEnrolled) * 100) : 0
        }
    } catch (error) {
        console.error('加载统计数据失败:', error)
    }
}

// 数据映射
const mapParticipantData = (item) => {
    return {
        id: item.participantId,
        studentId: item.studentId,
        name: item.studentName || item.name || '未知用户',
        studentNumber: item.studentNumber,
        className: item.className,
        avatar: item.studentAvatar || 'https://picsum.photos/100/100',
        enrollTime: formatTime(item.enrollTime),
        signInTime: item.signInTime ? formatTime(item.signInTime) : null,
        completeTime: item.completeTime ? formatTime(item.completeTime) : null,
        status: item.enrollStatus, // "0"=已报名, "1"=已签到, "2"=已完成, "3"=已取消
        role: item.role || 'participant'
    }
}

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return ''
    // 只保留日期和时分
    return timeStr.substring(0, 16).replace('T', ' ')
}

// 切换筛选
const switchFilter = (value) => {
    currentFilter.value = value
    // 刷新列表 - 参数变化会自动触发 RefreshLoadList 的 watch，无需手动调用
    // listRef.value?.reload()
}

// 获取状态文本
const getStatusText = (status) => {
    const map = {
        '0': '已报名',
        '1': '已签到',
        '2': '已完成',
        '3': '已取消'
    }
    return map[status] || '未知'
}

// 获取状态样式
const getStatusClass = (status) => {
    const map = {
        '0': 'status-enrolled',
        '1': 'status-signed',
        '2': 'status-completed',
        '3': 'status-cancelled'
    }
    return map[status] || ''
}

// 获取角色文本
const getRoleText = (role) => {
    const map = {
        'leader': '负责人',
        'organizer': '组织者',
        'participant': '参与者'
    }
    return map[role] || ''
}

// 获取角色样式
const getRoleClass = (role) => {
    const map = {
        'leader': 'role-leader',
        'organizer': 'role-organizer',
        'participant': 'role-participant'
    }
    return map[role] || ''
}

onLoad((options) => {
    activityId.value = options.id

    // 获取操作者ID
    const userInfo = uni.getStorageSync('userInfo')
    operatorId.value = userInfo?.studentId

    // 加载全部人员的统计数据
    loadAllStatistics()
})
</script>

<style scoped lang="scss">
.page {
    height: 100vh;
    background: #f5f5f5;
    overflow: hidden;
}

.container {
    height: 100%;
    padding: 20rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

/* 统计卡片 */
.stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 40rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
}

.stat-value {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
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

/* 筛选栏 */
.filter-bar {
    background: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    display: flex;
    gap: 20rpx;
}

.filter-item {
    flex: 1;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .filter-text {
            color: #fff;
            font-weight: bold;
        }
    }
}

.filter-text {
    font-size: 28rpx;
    color: #666;
}

/* 人员列表 */
.participant-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.participant-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    gap: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    border: 2rpx solid #f0f0f0;
}

.info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.role-tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 22rpx;

    &.role-leader {
        background: rgba(255, 193, 7, 0.15);
        color: #ff9800;
        border: 1rpx solid rgba(255, 193, 7, 0.3);
    }

    &.role-organizer {
        background: rgba(33, 150, 243, 0.15);
        color: #2196f3;
        border: 1rpx solid rgba(33, 150, 243, 0.3);
    }

    &.role-participant {
        background: rgba(156, 39, 176, 0.15);
        color: #9c27b0;
        border: 1rpx solid rgba(156, 39, 176, 0.3);
    }
}

.time {
    font-size: 24rpx;
    color: #999;
}

.status-badge {
    padding: 12rpx 24rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;

    &.status-enrolled {
        background: rgba(33, 150, 243, 0.15);
        color: #2196f3;
    }

    &.status-signed {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
    }

    &.status-completed {
        background: rgba(156, 39, 176, 0.15);
        color: #9c27b0;
    }

    &.status-cancelled {
        background: rgba(244, 67, 54, 0.15);
        color: #f44336;
    }
}
</style>

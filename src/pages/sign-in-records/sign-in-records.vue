<template>
    <view class="page">
        <view class="container">
            <!-- 统计卡片 -->
            <view class="stats-card">
                <view class="stat-item">
                    <text class="stat-value">{{ totalRecords }}</text>
                    <text class="stat-label">累计签到</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ thisMonthRecords }}</text>
                    <text class="stat-label">本月签到</text>
                </view>
            </view>

            <!-- 筛选选项 -->
            <view class="filter-section">
                <view class="filter-tabs">
                    <view class="filter-tab" :class="{ active: currentFilter === 'all' }" @tap="changeFilter('all')">
                        全部
                    </view>
                    <view class="filter-tab" :class="{ active: currentFilter === 'thisMonth' }"
                        @tap="changeFilter('thisMonth')">
                        本月
                    </view>
                    <view class="filter-tab" :class="{ active: currentFilter === 'thisWeek' }"
                        @tap="changeFilter('thisWeek')">
                        本周
                    </view>
                </view>
            </view>

            <!-- 签到记录列表 -->
            <view class="records-list" v-if="filteredRecords.length > 0">
                <view class="record-item" v-for="record in filteredRecords" :key="record.id"
                    @tap="viewDetail(record.id)">
                    <view class="record-photo">
                        <image class="photo-thumb" :src="record.photo" mode="aspectFill"></image>
                    </view>
                    <view class="record-content">
                        <view class="record-header">
                            <text class="record-time">{{ formatTime(record.time) }}</text>
                            <view class="record-status" :class="'status-' + record.status">
                                <text>{{ getStatusText(record.status) }}</text>
                            </view>
                        </view>
                        <view class="record-info">
                            <text class="info-item">
                                <text class="info-icon">📍</text>
                                {{ record.location.address || '位置未知' }}
                            </text>
                        </view>
                    </view>
                    <view class="record-arrow">
                        <text class="arrow-icon">›</text>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-else>
                <text class="empty-icon">📝</text>
                <text class="empty-text">暂无签到记录</text>
                <button class="go-sign-btn" @tap="goToSignIn">
                    去签到
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMyRecords } from '@/api/checkin'

// 签到记录列表
const records = ref([])

// 当前筛选
const currentFilter = ref('all')

// 加载中状态
const loading = ref(false)

// 加载记录
const loadRecords = async () => {
    try {
        loading.value = true

        // 调用签到记录接口
        const res = await getMyRecords({
            pageNum: 1,
            pageSize: 100
        })

        // 适配后端返回的数据结构
        records.value = (res.rows || []).map(item => {
            // 处理图片URL - 将localhost替换为实际服务器地址
            let photoUrl = item.photoUrl || ''
            if (photoUrl) {
                // 如果是localhost地址,替换为实际服务器地址
                if (photoUrl.includes('localhost')) {
                    photoUrl = photoUrl.replace('http://localhost:8081', 'https://intelligentmini.rainyweb.cn')
                }
                // 如果只是相对路径,添加服务器前缀
                else if (photoUrl.startsWith('/profile')) {
                    photoUrl = 'https://intelligentmini.rainyweb.cn' + photoUrl
                }
            }

            return {
                id: item.recordId,              // 记录ID
                taskId: item.taskId,            // 任务ID
                time: item.createTime,          // 签到时间 "2025-11-19 22:01:14"
                photo: photoUrl,                // 处理后的照片URL
                status: item.checkinStatus,     // 签到状态 (1=正常 2=迟到 3=缺勤)
                location: {
                    latitude: item.latitude,
                    longitude: item.longitude,
                    address: item.address
                },
                remark: item.remark,            // 备注
                studentName: item.studentName,  // 学生姓名
                studentNo: item.studentNo       // 学号
            }
        })

        console.log('签到记录加载成功:', records.value)

    } catch (error) {
        console.error('获取签到记录失败:', error)
        uni.showToast({
            title: '获取记录失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}


// 筛选后的记录
const filteredRecords = computed(() => {
    if (currentFilter.value === 'all') {
        return records.value
    }

    const now = new Date()
    const filtered = records.value.filter(record => {
        const recordDate = new Date(record.time)

        if (currentFilter.value === 'thisMonth') {
            return recordDate.getMonth() === now.getMonth() &&
                recordDate.getFullYear() === now.getFullYear()
        }

        if (currentFilter.value === 'thisWeek') {
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - now.getDay())
            weekStart.setHours(0, 0, 0, 0)
            return recordDate >= weekStart
        }

        return true
    })

    return filtered
})

// 统计数据
const totalRecords = computed(() => records.value.length)

const thisMonthRecords = computed(() => {
    const now = new Date()
    return records.value.filter(record => {
        const recordDate = new Date(record.time)
        return recordDate.getMonth() === now.getMonth() &&
            recordDate.getFullYear() === now.getFullYear()
    }).length
})

// 切换筛选
const changeFilter = (filter) => {
    currentFilter.value = filter
}

// 格式化时间
const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    const now = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    // 判断是否是今天
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        return `今天 ${hours}:${minutes}`
    }

    // 判断是否是昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    if (isYesterday) {
        return `昨天 ${hours}:${minutes}`
    }

    return `${month}月${day}日 ${hours}:${minutes}`
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        '1': '正常',
        '2': '迟到',
        '3': '缺勤'
    }
    return statusMap[status] || '未知'
}

// 查看详情
const viewDetail = (id) => {
    uni.navigateTo({
        url: `/pages/sign-in-detail/sign-in-detail?id=${id}`
    })
}

// 去签到
const goToSignIn = () => {
    uni.navigateTo({
        url: '/pages/sign-in/sign-in'
    })
}

onLoad(() => {

    loadRecords()
})


onShow(() => {
    loadRecords()
})
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
}

/* 统计卡片 */
.stats-card {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    padding: 50rpx 30rpx;
    display: flex;
    justify-content: center;
    gap: 100rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
}

.stat-value {
    font-size: 56rpx;
    font-weight: bold;
    color: #fff;
}

.stat-label {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
}

.stat-divider {
    width: 2rpx;
    height: 100rpx;
    background: rgba(255, 255, 255, 0.3);
    align-self: center;
}

/* 筛选区域 */
.filter-section {
    background: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
}

.filter-tabs {
    display: flex;
    gap: 20rpx;
}

.filter-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: #666;
    background: #f5f5f5;
    border-radius: 8rpx;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
        color: #fff;
        font-weight: bold;
    }
}

/* 记录列表 */
.records-list {
    padding: 0 20rpx 20rpx;
}

.record-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.record-photo {
    width: 120rpx;
    height: 160rpx;
    border-radius: 12rpx;
    overflow: hidden;
    flex-shrink: 0;
}

.photo-thumb {
    width: 100%;
    height: 100%;
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

.record-time {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.record-status {
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;

    // 状态 1=正常
    &.status-1 {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }

    // 状态 2=迟到
    &.status-2 {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    // 状态 3=缺勤
    &.status-3 {
        background: rgba(245, 87, 108, 0.1);
        color: #f5576c;
    }
}

.record-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.info-item {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
}

.info-icon {
    margin-right: 6rpx;
}

.record-arrow {
    flex-shrink: 0;
}

.arrow-icon {
    font-size: 40rpx;
    color: #ddd;
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
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
}

.go-sign-btn {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    padding: 0 60rpx;
    height: 70rpx;
    line-height: 70rpx;
    border-radius: 35rpx;
    border: none;
}
</style>

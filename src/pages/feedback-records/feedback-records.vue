<template>
    <view class="page">
        <view class="container">
            <!-- 统计卡片 -->
            <view class="stats-card">
                <view class="stat-item">
                    <text class="stat-value">{{ totalRecords }}</text>
                    <text class="stat-label">全部反馈</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ pendingRecords }}</text>
                    <text class="stat-label">待处理</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ resolvedRecords }}</text>
                    <text class="stat-label">已解决</text>
                </view>
            </view>

            <!-- 筛选选项 -->
            <view class="filter-section">
                <view class="filter-tabs">
                    <view class="filter-tab" :class="{ active: currentStatus === 'all' }" @tap="changeStatus('all')">
                        全部
                    </view>
                    <view class="filter-tab" :class="{ active: currentStatus === 'pending' }"
                        @tap="changeStatus('pending')">
                        待处理
                    </view>
                    <view class="filter-tab" :class="{ active: currentStatus === 'processing' }"
                        @tap="changeStatus('processing')">
                        处理中
                    </view>
                    <view class="filter-tab" :class="{ active: currentStatus === 'resolved' }"
                        @tap="changeStatus('resolved')">
                        已解决
                    </view>
                </view>
            </view>

            <!-- 反馈列表 -->
            <view class="records-list" v-if="filteredRecords.length > 0">
                <view class="record-item" v-for="record in filteredRecords" :key="record.id"
                    @tap="viewDetail(record.id)">
                    <view class="record-header">
                        <view class="type-badge" :class="'type-' + record.type">
                            <text>{{ getTypeText(record.type) }}</text>
                        </view>
                        <view class="status-badge" :class="'status-' + record.status">
                            <text>{{ getStatusText(record.status) }}</text>
                        </view>
                    </view>
                    <text class="record-title">{{ record.title }}</text>
                    <text class="record-desc">{{ record.description }}</text>
                    <view class="record-footer">
                        <text class="record-time">
                            <text class="time-icon">🕒</text>
                            {{ formatTime(record.createTime) }}
                        </text>
                        <view class="reply-count" v-if="record.replies && record.replies.length > 0">
                            <text class="reply-icon">💬</text>
                            <text class="reply-text">{{ record.replies.length }} 条回复</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-else>
                <text class="empty-icon">📝</text>
                <text class="empty-text">暂无反馈记录</text>
                <button class="add-btn" @tap="goToFeedback">
                    去反馈
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getFeedbackList } from '@/api/feedback'

// 当前状态
const currentStatus = ref('all')

// 反馈记录列表
const records = ref([])

// 加载中状态
const loading = ref(false)



// 加载记录
const loadRecords = async () => {
    try {
        loading.value = true

        const token = uni.getStorageSync('userToken')
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            loading.value = false
            return
        }

        // 调用反馈列表接口
        const res = await getFeedbackList({
            pageNum: 1,
            pageSize: 100
            // 如果需要按状态筛选，可以传递 status 参数
            // status: currentStatus.value === 'all' ? undefined : statusMap[currentStatus.value]
        })

        console.log('反馈列表返回:', res)

        // 状态映射：后端 -> 前端
        const statusMap = {
            '0': 'pending',    // 待处理
            '1': 'processing', // 处理中
            '2': 'resolved'    // 已解决
        }

        // 类型映射：后端 -> 前端
        const typeMap = {
            '1': 'course',      // 课程内容
            '2': 'teaching',    // 教学方式
            '3': 'environment', // 教学环境
            '4': 'other'        // 其他建议
        }

        // 适配后端返回的数据结构
        records.value = (res.rows || []).map(item => ({
            id: item.feedbackId,
            type: typeMap[item.feedbackType] || 'other',
            title: item.title,
            description: item.description,
            photos: item.imageUrls ? item.imageUrls.split(',') : [],
            contact: item.contactInfo,
            status: statusMap[item.feedbackStatus] || 'pending',
            createTime: item.createTime,
            submitTime: item.submitTime,
            replies: item.replyRecords ? JSON.parse(item.replyRecords) : [],
            studentName: item.studentName,
            studentNo: item.studentNo,
            currentHandlerName: item.currentHandlerName,
            firstReplyTime: item.firstReplyTime,
            resolveTime: item.resolveTime
        }))

        console.log('反馈记录加载成功:', records.value)

    } catch (error) {
        console.error('获取反馈记录失败:', error)
    } finally {
        loading.value = false
    }
}

// 筛选后的记录
const filteredRecords = computed(() => {
    if (currentStatus.value === 'all') {
        return records.value
    }
    return records.value.filter(record => record.status === currentStatus.value)
})

// 统计数据
const totalRecords = computed(() => records.value.length)

const pendingRecords = computed(() => {
    return records.value.filter(record => record.status === 'pending').length
})

const resolvedRecords = computed(() => {
    return records.value.filter(record => record.status === 'resolved').length
})

// 切换状态
const changeStatus = (status) => {
    currentStatus.value = status
}

// 获取类型文本
const getTypeText = (type) => {
    const typeMap = {
        'course': '课程内容',
        'teaching': '教学方式',
        'environment': '教学环境',
        'other': '其他建议'
    }
    return typeMap[type] || ''
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决'
    }
    return statusMap[status] || ''
}

// 格式化时间
const formatTime = (timeStr) => {
    const date = new Date(timeStr)
    const now = new Date()
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

// 查看详情
const viewDetail = (id) => {
    uni.navigateTo({
        url: `/pages/feedback-detail/feedback-detail?id=${id}`
    })
}

// 去反馈
const goToFeedback = () => {
    uni.navigateTo({
        url: '/pages/feedback/feedback'
    })
}

onLoad(() => {
})


onShow(() => {
    // 页面显示时重新加载
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
    justify-content: space-around;
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
    font-size: 26rpx;
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
}

.record-header {
    display: flex;
    gap: 12rpx;
    margin-bottom: 16rpx;
}

.type-badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;

    &.type-course {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.type-teaching {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }

    &.type-environment {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.type-other {
        background: rgba(245, 87, 108, 0.1);
        color: #f5576c;
    }
}

.status-badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;

    &.status-pending {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.status-processing {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.status-resolved {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }
}

.record-title {
    display: block;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
}

.record-desc {
    display: block;
    font-size: 26rpx;
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

.record-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;
}

.record-time {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
}

.time-icon {
    margin-right: 6rpx;
}

.reply-count {
    display: flex;
    align-items: center;
    gap: 6rpx;
    font-size: 24rpx;
    color: #667eea;
}

.reply-icon {
    font-size: 26rpx;
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

.add-btn {
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

<template>
    <view class="pending-reviews-page">
        <view class="header">
            <text class="title">待审核列表</text>
            <text class="subtitle">共 {{ total }} 条申请</text>
        </view>

        <scroll-view scroll-y class="list-container" @scrolltolower="loadMore">
            <view v-if="list.length > 0" class="review-list">
                <view class="review-item" v-for="(item, index) in list" :key="item.memberId || index">
                    <view class="user-info">
                        <image class="avatar" :src="item.avatarUrl || '/static/default-avatar.png'" mode="aspectFill" />
                        <view class="info-content">
                            <view class="name-row">
                                <text class="name">{{ item.studentName }}</text>
                                <text class="time">{{ formatTime(item.applyTime) }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-text">学号：{{ item.studentNo || '未知' }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="action-buttons">
                        <button class="btn reject-btn" @tap="handleReject(item)" :disabled="item.loading">
                            <text>拒绝</text>
                        </button>
                        <button class="btn approve-btn" @tap="handleApprove(item)" :disabled="item.loading">
                            <text>同意</text>
                        </button>
                    </view>
                </view>
                <view class="loading-more" v-if="loading">
                    <text>加载中...</text>
                </view>
                <view class="no-more" v-if="!hasMore && list.length > 0">
                    <text>没有更多了</text>
                </view>
            </view>

            <view v-else-if="!loading" class="empty-state">
                <text class="empty-icon">📭</text>
                <text class="empty-text">暂无待审核申请</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrganizationApplications, approveApplication } from '@/api/organization'

const organizationId = ref('')
const list = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasMore = ref(true)

onLoad((options) => {
    if (options.orgId) {
        organizationId.value = options.orgId
        loadData()
    } else {
        uni.showToast({
            title: '参数错误',
            icon: 'none'
        })
        setTimeout(() => uni.navigateBack(), 1500)
    }
})

const loadData = async (reset = false) => {
    if (loading.value) return
    if (reset) {
        pageNum.value = 1
        hasMore.value = true
        list.value = []
    }
    if (!hasMore.value) return

    const token = uni.getStorageSync('userToken')
    if (!token) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        return
    }

    loading.value = true
    try {
        const res = await getOrganizationApplications(organizationId.value, {
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            status: '0' // 0: pending, 1: approved, 2: rejected
        })

        console.log('API返回数据:', res)

        // request.js 已经自动解析了 data.data，所以 res 直接就是数组
        if (res && Array.isArray(res)) {
            const newData = res
            if (reset) {
                list.value = newData
            } else {
                list.value = [...list.value, ...newData]
            }
            // Assuming no total count in response, check if returned data is less than page size
            hasMore.value = newData.length >= pageSize.value
            total.value = list.value.length // Approximate total
            pageNum.value++
        } else {
            hasMore.value = false
        }
    } catch (error) {
        console.error('获取申请列表失败:', error)

    } finally {
        loading.value = false
    }
}

const loadMore = () => {
    loadData()
}

const handleApprove = (item) => {
    processApplication(item, true) // true: approved
}

const handleReject = (item) => {
    processApplication(item, false) // false: rejected
}

const processApplication = async (item, approved) => {
    if (item.loading) return

    item.loading = true
    uni.showLoading({ title: '处理中...' })

    const token = uni.getStorageSync('userToken')
    if (!token) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        item.loading = false
        uni.hideLoading()
        return
    }

    try {
        await approveApplication({
            targetStudentId: item.studentId,
            organizationId: organizationId.value,
            approved: approved
        })

        uni.showToast({
            title: approved ? '已同意' : '已拒绝',
            icon: 'success'
        })

        // Remove from list
        const index = list.value.findIndex(i => i.memberId === item.memberId)
        if (index > -1) {
            list.value.splice(index, 1)
            total.value--
        }

        // If list becomes empty, try to load more to fill the screen
        if (list.value.length < 5 && hasMore.value) {
            loadData()
        }

    } catch (error) {
        console.error('处理申请失败:', error)
        uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
        })
    } finally {
        item.loading = false
        uni.hideLoading()
    }
}

const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now - date

    // Less than 24 hours
    if (diff < 86400000) {
        if (diff < 3600000) {
            return Math.max(1, Math.floor(diff / 60000)) + '分钟前'
        }
        return Math.floor(diff / 3600000) + '小时前'
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
}
</script>

<style scoped lang="scss">
.pending-reviews-page {
    min-height: 100vh;
    background-color: #f5f7fa;
    display: flex;
    flex-direction: column;
}

.header {
    padding: 30rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid #eee;
}

.title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.subtitle {
    font-size: 26rpx;
    color: #999;
}

.list-container {
    flex: 1;
    height: 0;
}

.review-list {
    padding: 20rpx;
}

.review-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.user-info {
    display: flex;
    margin-bottom: 24rpx;
}

.avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 24rpx;
    background-color: #eee;
}

.info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.name-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
}

.name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.time {
    font-size: 24rpx;
    color: #999;
}

.detail-row {
    margin-bottom: 12rpx;
}

.detail-text {
    font-size: 26rpx;
    color: #666;
}

.reason-box {
    background-color: #f9f9f9;
    padding: 16rpx;
    border-radius: 8rpx;
    font-size: 26rpx;
    line-height: 1.4;
}

.reason-label {
    color: #999;
}

.reason-text {
    color: #333;
}

.action-buttons {
    display: flex;
    gap: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.btn {
    flex: 1;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 36rpx;
    font-size: 28rpx;
    margin: 0;

    &::after {
        border: none;
    }
}

.reject-btn {
    background-color: #f5f5f5;
    color: #666;

    &:active {
        background-color: #e0e0e0;
    }
}

.approve-btn {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;

    &:active {
        opacity: 0.9;
    }
}

.loading-more,
.no-more {
    padding: 30rpx;
    text-align: center;

    text {
        font-size: 24rpx;
        color: #999;
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
}

.empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>
<template>
    <view class="page">
        <view class="container">
            <view class="header">
                <text class="title">活动管理</text>
                <text class="subtitle">{{ activity.title }}</text>
            </view>

            <!-- 功能列表 -->
            <view class="action-list">
                <!-- 签到二维码: 只有活动进行中才能查看和生成 -->
                <view class="action-item" :class="{ disabled: currentStatus !== 4 }" @tap="handleQRCodeAction">
                    <view class="item-left">
                        <text class="item-icon">📷</text>
                        <view class="item-content">
                            <text class="item-title">{{ hasQRCode ? '查看签到二维码' : '生成签到二维码' }}</text>
                            <text class="item-desc">{{ getQRCodeDesc() }}</text>
                        </view>
                    </view>
                    <text class="item-arrow">›</text>
                </view>

                <!-- 报名人员列表 -->
                <view class="action-item" @tap="goToParticipants">
                    <view class="item-left">
                        <text class="item-icon">👥</text>
                        <view class="item-content">
                            <text class="item-title">报名人员列表</text>
                            <text class="item-desc">查看所有报名参与者</text>
                        </view>
                    </view>
                    <text class="item-arrow">›</text>
                </view>

                <!-- 结束活动 (活动时间过了才展示) -->
                <view v-if="canFinishActivity" class="action-item danger" @tap="finishActivity">
                    <view class="item-left">
                        <text class="item-icon">🔚</text>
                        <view class="item-content">
                            <text class="item-title">结束活动</text>
                            <text class="item-desc">结束活动并生成报告</text>
                        </view>
                    </view>
                    <text class="item-arrow">›</text>
                </view>
            </view>

            <!-- 活动状态信息 -->
            <view class="status-info">
                <view class="info-item">
                    <text class="label">当前状态:</text>
                    <text class="value">{{ getStatusText() }}</text>
                </view>
                <view class="info-item">
                    <text class="label">报名人数:</text>
                    <text class="value">{{ activity.currentCount }}/{{ activity.maxCount }}</text>
                </view>
            </view>
        </view>

        <!-- 二维码弹窗 (自定义实现) -->
        <view v-if="showQrModal" class="modal-mask" @tap="closeQRPopup">
            <view class="qr-popup" @tap.stop>
                <view class="popup-header">
                    <text class="popup-title">活动签到二维码</text>
                </view>
                <view class="qr-container">
                    <image v-if="qrCodeData.qrCodeUrl" :src="qrCodeData.qrCodeUrl" class="qr-image" mode="aspectFit"
                        show-menu-by-longpress @error="handleImageError"></image>
                    <view v-else class="qr-loading">
                        <text>加载中...</text>
                    </view>
                    <view v-if="imageLoadError" class="error-tip">
                        <text>二维码加载失败，请稍后重试</text>
                    </view>
                </view>
                <view class="popup-footer">
                    <text class="popup-tip">参与者扫描此二维码进行签到</text>
                    <text class="popup-tip-sub">长按二维码可保存图片</text>
                    <button class="close-btn" @tap="closeQRPopup">关闭</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { generateQRCode as genQRCodeAPI, finishActivity as finishActivityAPI, getActivityDetail } from '@/api/activity'

const showQrModal = ref(false)
const imageLoadError = ref(false)

// 页面参数
const activityId = ref(null)
const currentStatus = ref(1)

// 活动信息
const activity = ref({
    title: '',
    currentCount: 0,
    maxCount: 0
})

// 二维码数据
const qrCodeData = ref({
    qrCodeUrl: '',
    validUntil: '',
    activityName: ''
})



// 是否有二维码
const hasQRCode = computed(() => {
    return !!qrCodeData.value.qrCodeUrl
})

// 只有活动进行中才能生成和查看二维码 (状态4: 进行中)
const canGenerateQR = computed(() => {
    return currentStatus.value === 4
})

// 是否可以结束活动 (活动已结束但未完结: status === 5)
const canFinishActivity = computed(() => {
    return currentStatus.value === 5
})

// 获取状态文本
const getStatusText = () => {
    const statusMap = {
        1: '预热中',
        2: '报名中',
        3: '等待中',
        4: '进行中',
        5: '已结束',
        6: '已完结'
    }
    return statusMap[currentStatus.value] || '未知'
}

// 获取二维码描述
const getQRCodeDesc = () => {
    if (currentStatus.value === 4) {
        return hasQRCode.value ? '点击查看签到二维码' : '点击生成签到二维码'
    }
    return '只有活动进行中才能查看二维码'
}

// 处理二维码操作
const handleQRCodeAction = () => {
    // 只有活动进行中才能查看和生成二维码
    if (currentStatus.value !== 4) {
        uni.showToast({
            title: '只有活动进行中才能查看二维码',
            icon: 'none'
        })
        return
    }

    // 如果已有二维码，直接显示
    if (hasQRCode.value) {
        showQrModal.value = true
        imageLoadError.value = false
        return
    }

    // 没有二维码，尝试生成
    generateQRCode()
}

// 生成签到二维码
const generateQRCode = async () => {
    if (!canGenerateQR.value) {
        uni.showToast({
            title: '报名结束且活动开始后才能生成二维码',
            icon: 'none'
        })
        return
    }

    const token = uni.getStorageSync('userToken')
    if (!token) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        return
    }

    try {
        uni.showLoading({ title: '生成中...' })
        imageLoadError.value = false

        // 调用后端接口生成二维码
        const res = await genQRCodeAPI(activityId.value)
        console.log('生成二维码响应:', res)

        // 兼容处理：如果后端返回的是 data 包装的
        const data = res.data || res

        qrCodeData.value = {
            qrCodeUrl: data.qrCodeUrl,
            validUntil: data.validUntil,
            activityName: data.activityName
        }

        // 显示二维码弹窗
        showQrModal.value = true

        uni.hideLoading()
    } catch (error) {
        uni.hideLoading()
        console.error('生成二维码失败:', error)
        uni.showToast({
            title: error.message || '生成失败',
            icon: 'none'
        })
    }
}

// 图片加载失败
const handleImageError = (e) => {
    console.error('二维码图片加载失败:', e)
    imageLoadError.value = true

}

// 关闭二维码弹窗
const closeQRPopup = () => {
    showQrModal.value = false
}

// 跳转到报名人员列表
const goToParticipants = () => {
    uni.navigateTo({
        url: `/pages/activity-participants/activity-participants?id=${activityId.value}`
    })
}

// 结束活动
const finishActivity = async () => {
    if (!canFinishActivity.value) {
        uni.showToast({
            title: '活动时间还未结束',
            icon: 'none'
        })
        return
    }

    const token = uni.getStorageSync('userToken')
    if (!token) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        return
    }

    uni.showModal({
        title: '结束活动',
        content: '确定要结束此活动吗？结束后将生成统计报告。',
        success: async (res) => {
            if (res.confirm) {
                try {
                    uni.showLoading({ title: '处理中...' })

                    const result = await finishActivityAPI({
                        activityId: activityId.value
                    })

                    uni.hideLoading()

                    if (result.success) {
                        const stats = result.statistics
                        uni.showModal({
                            title: '活动已结束',
                            content: `总报名人数: ${stats.totalEnrolled}\n总签到人数: ${stats.totalSignedIn}\n出勤率: ${(stats.attendanceRate * 100).toFixed(1)}%`,
                            showCancel: false,
                            success: () => {
                                // 返回上一页
                                uni.navigateBack()
                            }
                        })
                    } else {
                        uni.showToast({
                            title: '结束活动失败',
                            icon: 'none'
                        })
                    }
                } catch (error) {
                    uni.hideLoading()
                    console.error('结束活动失败:', error)
                    uni.showToast({
                        title: error.message || '操作失败',
                        icon: 'none'
                    })
                }
            }
        }
    })
}

// 加载活动信息
const loadActivityInfo = async () => {
    try {
        const res = await getActivityDetail(activityId.value)
        console.log('活动管理页-加载活动信息响应:', res)

        // 后端返回的数据在 res.activity 中
        const activityData = res.activity || res

        activity.value = {
            title: activityData.activityName || '',
            currentCount: activityData.currentParticipants || 0,
            maxCount: activityData.maxParticipants || 0
        }
        // 更新状态
        currentStatus.value = res.currentStatus || 1

        // 如果详情接口返回了二维码信息，直接设置
        // 优先从 res 中获取 (因为 qrCodeUrl 可能在 activity 对象外层)
        const qrUrl = res.qrCodeUrl || activityData.qrCodeUrl

        if (qrUrl) {
            qrCodeData.value = {
                qrCodeUrl: qrUrl,
                validUntil: res.validUntil || activityData.validUntil || '',
                activityName: res.activityName || activityData.activityName || ''
            }
        }

        console.log('活动信息:', activity.value, '当前状态:', currentStatus.value)
    } catch (error) {
        console.error('加载活动信息失败:', error)
    }
}

onLoad((options) => {
    activityId.value = options.id
    currentStatus.value = Number(options.status) || 1

    loadActivityInfo()
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: #f5f5f5;
}

.container {
    padding: 20rpx;
}

.header {
    background: #fff;
    padding: 40rpx 30rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
}

.title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
}

.subtitle {
    display: block;
    font-size: 28rpx;
    color: #666;
}

.action-list {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
}

.action-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    transition: background 0.3s;

    &:last-child {
        border-bottom: none;
    }

    &:active:not(.disabled) {
        background: #f8f8f8;
    }

    &.disabled {
        opacity: 0.5;

        .item-desc {
            color: #ff6b6b;
        }
    }

    &.danger {

        .item-icon,
        .item-title {
            color: #ff4d4f;
        }
    }
}

.item-left {
    display: flex;
    align-items: center;
    gap: 24rpx;
    flex: 1;
}

.item-icon {
    font-size: 48rpx;
}

.item-content {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.item-title {
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
}

.item-desc {
    font-size: 24rpx;
    color: #999;
}

.item-arrow {
    font-size: 48rpx;
    color: #ccc;
}

.status-info {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
}

.label {
    font-size: 28rpx;
    color: #666;
}

.value {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
}

/* 二维码弹窗 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
}

.qr-popup {
    width: 600rpx;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
    animation: scaleIn 0.3s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes scaleIn {
    from {
        transform: scale(0.9);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.popup-header {
    padding: 40rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.qr-container {
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400rpx;
}

.qr-canvas,
.qr-image {
    width: 400rpx;
    height: 400rpx;
}

.error-tip {
    margin-top: 20rpx;
    color: #ff4d4f;
    font-size: 24rpx;
}

.popup-footer {
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.popup-tip {
    text-align: center;
    font-size: 24rpx;
    color: #999;
}

.popup-tip-sub {
    text-align: center;
    font-size: 22rpx;
    color: #ccc;
}

.close-btn {
    height: 80rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 40rpx;
    border: none;
}
</style>

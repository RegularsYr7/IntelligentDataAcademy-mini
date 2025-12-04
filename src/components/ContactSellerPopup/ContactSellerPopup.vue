<template>
    <!-- 联系卖家弹窗 -->
    <view v-if="visible || isClosing" class="contact-modal"
        :class="{ 'modal-show': visible && !isClosing, 'modal-hide': isClosing }" @tap="handleMaskClick">
        <view class="modal-content" :class="{ 'content-show': visible && !isClosing, 'content-hide': isClosing }"
            @tap.stop>
            <view class="modal-header">
                <text class="modal-title">联系卖家</text>
                <text class="close-btn" @tap="handleClose">×</text>
            </view>
            <view class="modal-body">
                <view class="contact-item">
                    <view class="contact-label">
                        <text class="contact-icon">📱</text>
                        <text>手机号</text>
                    </view>
                    <view class="contact-value">
                        <text class="value-text">{{ sellerInfo.phone || '暂无' }}</text>
                        <button class="copy-btn" @tap="copyText(sellerInfo.phone, '手机号')"
                            v-if="sellerInfo.phone">复制</button>
                    </view>
                </view>
                <view class="contact-item">
                    <view class="contact-label">
                        <text class="contact-icon">💬</text>
                        <text>微信号</text>
                    </view>
                    <view class="contact-value">
                        <text class="value-text">{{ sellerInfo.wechat || '暂无' }}</text>
                        <button class="copy-btn" @tap="copyText(sellerInfo.wechat, '微信号')"
                            v-if="sellerInfo.wechat">复制</button>
                    </view>
                </view>
            </view>
            <view class="modal-footer">
                <button class="modal-btn" @tap="handleClose">关闭</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    sellerInfo: {
        type: Object,
        default: () => ({
            phone: '',
            wechat: ''
        })
    }
})

const emit = defineEmits(['close'])

const isClosing = ref(false)

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
    console.log('=== ContactSellerPopup visible changed ===')
    console.log('新值:', newVal)

    if (newVal) {
        console.log('✅ 弹窗打开')
        isClosing.value = false
    } else {
        console.log('❌ 弹窗关闭')
    }
})

const handleMaskClick = () => {
    console.log('🖱️ 遮罩层被点击')

    if (!props.visible) {
        console.log('⚠️ 弹窗未显示,忽略点击')
        return
    }

    handleClose()
}

const handleClose = () => {
    console.log('🔴 handleClose 被调用')

    if (!props.visible) {
        console.log('⚠️ 弹窗未显示,不执行关闭')
        return
    }

    if (isClosing.value) {
        console.log('⚠️ 防止重复触发,直接返回')
        return
    }

    console.log('🎬 开始关闭动画')
    isClosing.value = true

    setTimeout(() => {
        console.log('⏰ 动画完成,触发 close 事件')
        isClosing.value = false
        emit('close')
    }, 300)
}

const copyText = (text, label) => {
    console.log('📋 复制文本:', label, text)

    if (!text) {
        uni.showToast({
            title: '内容为空',
            icon: 'none'
        })
        return
    }

    uni.setClipboardData({
        data: text,
        success: () => {
            uni.showToast({
                title: `${label}已复制`,
                icon: 'none'
            })
        },
        fail: () => {

        }
    })
}
</script>

<style scoped>
/* 联系卖家弹窗 */
.contact-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    opacity: 0;
}

.modal-show {
    animation: fadeIn 0.3s ease-out forwards;
}

.modal-hide {
    animation: fadeOut 0.3s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

.modal-content {
    width: 620rpx;
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    transform: scale(0.8);
    opacity: 0;
}

.content-show {
    animation: scaleIn 0.3s ease-out forwards;
}

.content-hide {
    animation: scaleOut 0.3s ease-out forwards;
}

@keyframes scaleIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes scaleOut {
    from {
        transform: scale(1);
        opacity: 1;
    }

    to {
        transform: scale(0.8);
        opacity: 0;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.close-btn {
    font-size: 56rpx;
    color: #999;
    line-height: 1;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-body {
    padding: 32rpx;
}

.contact-item {
    margin-bottom: 32rpx;
}

.contact-item:last-child {
    margin-bottom: 0;
}

.contact-label {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 26rpx;
    color: #666;
}

.contact-icon {
    font-size: 32rpx;
    margin-right: 8rpx;
}

.contact-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f8f8;
    padding: 20rpx 24rpx;
    border-radius: 12rpx;
}

.value-text {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
    flex: 1;
    word-break: break-all;
}

.copy-btn {
    padding: 8rpx 24rpx;
    height: 56rpx;
    line-height: 56rpx;
    background: linear-gradient(to right, #ff6b6b, #ff8787);
    color: #fff;
    border: none;
    border-radius: 8rpx;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 16rpx;
}

.copy-btn::after {
    border: none;
}

.modal-footer {
    padding: 0 32rpx 32rpx 32rpx;
}

.modal-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #f5f5f5;
    color: #666;
    border: none;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.modal-btn::after {
    border: none;
}
</style>

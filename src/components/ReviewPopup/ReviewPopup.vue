<template>
    <!-- 评价弹出层 -->
    <view v-if="visible || isClosing" class="review-mask"
        :class="{ 'mask-show': visible && !isClosing, 'mask-hide': isClosing }" @tap="handleMaskClick">
        <view class="review-popup" :class="{ 'popup-show': visible && !isClosing, 'popup-hide': isClosing }" @tap.stop>
            <!-- 上部:星级评价 -->
            <view class="review-header">
                <view class="review-title">商品评价</view>
                <view class="review-subtitle">{{ orderInfo.goods }}</view>
                <view class="star-rating">
                    <text v-for="star in 5" :key="star" class="star-icon" :class="{ 'star-active': star <= rating }"
                        @tap="setRating(star)">
                        {{ star <= rating ? '⭐' : '☆' }} </text>
                </view>
                <view class="rating-text">{{ ratingTexts[rating - 1] || '请选择评分' }}</view>
            </view>

            <!-- 中部:文字评价 -->
            <view class="review-body">
                <textarea class="review-textarea" v-model="reviewContent" placeholder="分享您的使用感受,帮助其他同学更好地了解商品～"
                    placeholder-style="color: #999;" maxlength="200" />
                <view class="textarea-counter">{{ reviewContent.length }}/200</view>
            </view>

            <!-- 下部:提交按钮 -->
            <view class="review-footer">
                <button class="cancel-btn" @tap="handleClose">取消</button>
                <button class="submit-btn" @tap="handleSubmit">提交评价</button>
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
    orderInfo: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['close', 'submit'])

const isClosing = ref(false)
const rating = ref(5)
const reviewContent = ref('')
const ratingTexts = ['非常差', '比较差', '一般般', '比较好', '非常好']

// 监听 visible 变化,重置状态
watch(() => props.visible, (newVal, oldVal) => {
    if (newVal) {
        isClosing.value = false
        rating.value = 5
        reviewContent.value = ''
    }
})

const setRating = (star) => {
    console.log('⭐ 设置评分:', star)
    rating.value = star
}

const handleMaskClick = (e) => {
    console.log('🖱️ 遮罩层被点击')
    console.log('事件对象:', e)
    console.log('visible:', props.visible)
    console.log('isClosing:', isClosing.value)

    if (!props.visible) {
        console.log('⚠️ 弹窗未显示,忽略点击')
        return
    }

    handleClose()
}

const handleClose = () => {
    if (!props.visible) {
        console.log('⚠️ 弹窗未显示,不执行关闭')
        return
    }

    if (isClosing.value) {
        console.log('⚠️ 防止重复触发,直接返回')
        return
    }

    isClosing.value = true

    setTimeout(() => {
        isClosing.value = false
        emit('close')
    }, 300)
}

const handleSubmit = () => {
    if (rating.value === 0) {
        uni.showToast({
            title: '请选择评分',
            icon: 'none'
        })
        return
    }

    if (!reviewContent.value.trim()) {
        uni.showToast({
            title: '请填写评价内容',
            icon: 'none'
        })
        return
    }

    emit('submit', {
        rating: rating.value,
        content: reviewContent.value
    })

    uni.showToast({
        title: '评价成功',
        icon: 'none'
    })

    setTimeout(() => {
        handleClose()
    }, 1500)
}
</script>

<style scoped>
/* 评价弹出层样式 */
.review-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 999;
    opacity: 0;
}

.mask-show {
    animation: fadeIn 0.3s ease-out forwards;
}

.mask-hide {
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

.review-popup {
    width: 100%;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 40rpx 32rpx;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    opacity: 0;
}

.popup-show {
    animation: slideUp 0.3s ease-out forwards;
}

.popup-hide {
    animation: slideDown 0.3s ease-out forwards;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(0);
        opacity: 1;
    }

    to {
        transform: translateY(100%);
        opacity: 0;
    }
}

/* 上部:星级评价 */
.review-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.review-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
}

.review-subtitle {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 32rpx;
    max-width: 80%;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.star-rating {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;
}

.star-icon {
    font-size: 64rpx;
    cursor: pointer;
    transition: transform 0.2s;
    color: #ddd;
}

.star-active {
    color: #ffb800;
}

.star-icon:active {
    transform: scale(1.2);
}

.rating-text {
    font-size: 28rpx;
    color: #ff6b6b;
    font-weight: bold;
}

/* 中部:文字评价 */
.review-body {
    flex: 1;
    padding: 32rpx 0;
    display: flex;
    flex-direction: column;
}

.review-textarea {
    flex: 1;
    width: 100%;
    min-height: 240rpx;
    background: #f8f8f8;
    border-radius: 16rpx;
    padding: 24rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    box-sizing: border-box;
}

.textarea-counter {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
}

/* 下部:提交按钮 */
.review-footer {
    display: flex;
    gap: 24rpx;
    padding-top: 24rpx;
}

.cancel-btn,
.submit-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cancel-btn::after,
.submit-btn::after {
    border: none;
}

.cancel-btn {
    background: #f5f5f5;
    color: #666;
}

.submit-btn {
    background: linear-gradient(to right, #ff6b6b, #ff8787);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
}
</style>

<template>
    <view class="wechat-phone-login">
        <!-- 微信手机号一键登录按钮 -->
        <button class="wechat-login-btn" open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber">
            <text class="wechat-icon">📱</text>
            <text class="btn-text">手机号一键登录</text>
        </button>
    </view>
</template>

<script setup>
const emit = defineEmits(['getPhoneNumber', 'mockLogin'])

// 获取手机号
const handleGetPhoneNumber = (e) => {
    emit('getPhoneNumber', e)
}

// 模拟登录
const handleMockLogin = () => {
    emit('mockLogin')
}
</script>

<style lang="scss" scoped>
.wechat-phone-login {
    width: 100%;
}

/* 微信登录按钮 */
.wechat-login-btn {
    width: 100%;
    height: 100rpx;
    background: #fff;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    border: none;
    margin-bottom: 24rpx;
    transition: all 0.3s;

    &::after {
        border: none;
    }

    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }
}

.wechat-icon {
    font-size: 48rpx;
}

.btn-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

/* 模拟登录按钮 */
.mock-login-btn {
    width: 100%;
    height: 100rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    margin-bottom: 40rpx;
    backdrop-filter: blur(10rpx);
    transition: all 0.3s;

    &::after {
        border: none;
    }

    &:active {
        transform: scale(0.98);
        background: rgba(255, 255, 255, 0.3);
    }

    .mock-icon {
        font-size: 48rpx;
    }

    .btn-text {
        color: #fff;
    }
}
</style>

<template>
    <view class="skeleton-wrapper">
        <!-- 骨架屏头部 -->
        <view class="skeleton-profile-card">
            <view class="skeleton-profile-layout">
                <view class="skeleton-profile-left">
                    <view class="skeleton-avatar"></view>
                    <view class="skeleton-user-detail">
                        <view class="skeleton-name"></view>
                        <view class="skeleton-tags">
                            <view class="skeleton-tag"></view>
                            <view class="skeleton-tag"></view>
                        </view>
                    </view>
                </view>
                <view class="skeleton-profile-right">
                    <view class="skeleton-score-value"></view>
                    <view class="skeleton-score-label"></view>
                </view>
            </view>
        </view>

        <!-- 骨架屏功能模块 -->
        <view class="skeleton-function-section">
            <view class="skeleton-module-card" v-for="i in 4" :key="i">
                <view class="skeleton-module-header">
                    <view class="skeleton-module-title"></view>
                    <view class="skeleton-arrow"></view>
                </view>
                <view class="skeleton-module-content"></view>
            </view>
        </view>

        <!-- 登录引导 -->
        <view class="login-guide">
            <text class="guide-icon">🔐</text>
            <text class="guide-text">请先登录查看个人信息</text>
            <button class="guide-login-btn" @tap="goToLogin">立即登录</button>
        </view>
    </view>
</template>

<script setup>
const goToLogin = () => {
    uni.navigateTo({
        url: '/pages/login/login'
    })
}
</script>

<style scoped lang="scss">
/* 骨架屏样式 */
.skeleton-wrapper {
    min-height: 100vh;
}

.skeleton-profile-card {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    padding: 5vh 30rpx 40rpx 30rpx;
    margin-bottom: 20rpx;
    position: relative;
    overflow: hidden;
}

.skeleton-profile-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.skeleton-profile-left {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 20rpx;
}

.skeleton-profile-right {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 20rpx;
    min-width: 160rpx;
    height: 120rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.skeleton-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    margin-right: 24rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    flex-shrink: 0;
}

.skeleton-user-detail {
    flex: 1;
}

.skeleton-name {
    width: 200rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    margin-bottom: 16rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-tags {
    display: flex;
    gap: 12rpx;
}

.skeleton-tag {
    width: 100rpx;
    height: 32rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-score-value {
    width: 80rpx;
    height: 50rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8rpx;
    margin-bottom: 12rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-score-label {
    width: 100rpx;
    height: 24rpx;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-function-section {
    padding: 0 20rpx;
}

.skeleton-module-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.skeleton-module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.skeleton-module-title {
    width: 180rpx;
    height: 36rpx;
    background: #f0f0f0;
    border-radius: 18rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-arrow {
    width: 20rpx;
    height: 20rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-module-content {
    height: 120rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }

    100% {
        opacity: 1;
    }
}

/* 登录引导 */
.login-guide {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24rpx;
    z-index: 100;
}

.guide-icon {
    font-size: 100rpx;
    animation: float 2s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-20rpx);
    }
}

.guide-text {
    font-size: 28rpx;
    color: #666;
}

.guide-login-btn {
    width: 300rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 30rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

    &::after {
        border: none;
    }

    &:active {
        transform: scale(0.95);
        box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
    }
}
</style>

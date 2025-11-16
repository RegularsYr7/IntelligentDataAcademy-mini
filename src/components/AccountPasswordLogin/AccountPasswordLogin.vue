<template>
    <view class="account-password-login">
        <!-- 账号密码登录表单 -->
        <view class="input-group">
            <view class="input-wrapper">
                <text class="input-icon">👤</text>
                <input class="input-field" v-model="formData.username" placeholder="请输入学号/工号"
                    placeholder-style="color: #fff; opacity: 0.9;" @input="handleInput" />
            </view>
        </view>
        <view class="input-group">
            <view class="input-wrapper">
                <text class="input-icon">🔒</text>
                <input class="input-field" v-model="formData.password" type="password" placeholder="请输入密码"
                    placeholder-style="color: #fff; opacity: 0.9;" @input="handleInput" />
            </view>
        </view>
        <button class="account-login-btn" @tap="handleLogin" :disabled="!canLogin" :loading="loading">
            <text class="btn-text">{{ loading ? '登录中...' : '登录' }}</text>
        </button>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['login', 'update:username', 'update:password'])

const formData = ref({
    username: '',
    password: ''
})

// 是否可以登录
const canLogin = computed(() => {
    return formData.value.username.trim() && formData.value.password.trim() && !props.loading
})

// 输入事件
const handleInput = () => {
    emit('update:username', formData.value.username)
    emit('update:password', formData.value.password)
}

// 登录
const handleLogin = () => {
    if (!canLogin.value) return
    emit('login', {
        username: formData.value.username,
        password: formData.value.password
    })
}
</script>

<style lang="scss" scoped>
.account-password-login {
    width: 100%;
}

.input-group {
    margin-bottom: 24rpx;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50rpx;
    padding: 0 30rpx;
    backdrop-filter: blur(10rpx);
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s;
}

.input-icon {
    font-size: 36rpx;
    margin-right: 20rpx;
}

.input-field {
    flex: 1;
    height: 90rpx;
    font-size: 28rpx;
    color: #fff;
    background: transparent;
    border: none;
}

.account-login-btn {
    width: 100%;
    height: 100rpx;
    background: #fff;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    border: none;
    margin-top: 30rpx;
    transition: all 0.3s;
}

.account-login-btn::after {
    border: none;
}

.account-login-btn:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.account-login-btn[disabled] {
    opacity: 0.5;
}

.btn-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}
</style>

<template>
    <view class="good-card" @tap="goToDetail">
        <image class="good-image" :src="good.image" mode="aspectFill"></image>
        <view class="good-info">
            <text class="good-title">{{ good.title }}</text>
            <view class="price-box">
                <text class="current-price">¥{{ good.price }}</text>
                <text class="original-price" v-if="good.originalPrice">¥{{ good.originalPrice }}</text>
            </view>
        </view>
    </view>
</template>

<script setup>
const props = defineProps({
    good: {
        type: Object,
        required: true,
        default: () => ({
            id: '',
            image: '',
            title: '',
            price: 0,
            originalPrice: 0
        })
    }
})

const goToDetail = () => {
    uni.navigateTo({
        url: `/pages/detail/detail?id=${props.good.id}`
    })
}
</script>

<style scoped>
.good-card {
    background: #fff;
    border-radius: 12rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.good-image {
    width: 100%;
    height: 340rpx;
    display: block;
}

.good-info {
    padding: 20rpx;
}

.good-title {
    font-size: 28rpx;
    color: #333;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    height: 78rpx;
}

.price-box {
    display: flex;
    align-items: center;
    margin-top: 16rpx;
}

.current-price {
    font-size: 32rpx;
    color: #ff6b6b;
    font-weight: bold;
    margin-right: 12rpx;
}

.original-price {
    font-size: 24rpx;
    color: #999;
    text-decoration: line-through;
}
</style>

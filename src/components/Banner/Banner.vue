<template>
    <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500"
        indicator-color="rgba(255, 255, 255, 0.5)" indicator-active-color="#ff6b6b" :circular="true">
        <swiper-item v-for="(item, index) in banners" :key="index">
            <image class="banner-image" :src="item.image" mode="aspectFill" @tap="onBannerClick(item)"></image>
        </swiper-item>
    </swiper>
</template>

<script setup>
const props = defineProps({
    banners: {
        type: Array,
        default: () => []
    }
})

const onBannerClick = (item) => {
    console.log('轮播图点击:', item)

    if (item.link) {
        // 判断是否是外部链接(http/https开头)
        if (item.link.startsWith('http://') || item.link.startsWith('https://')) {
            // 外部链接,跳转到 webview 页面
            const encodedUrl = encodeURIComponent(item.link)
            console.log('跳转到 WebView,URL:', item.link)
            uni.navigateTo({
                url: `/pages/webview/webview?url=${encodedUrl}`
            })
        } else {
            // 内部页面链接
            console.log('跳转到内部页面:', item.link)
            // 判断是否是 tabbar 页面
            const tabbarPages = [
                '/pages/index/index',
                '/pages/category/category',
                '/pages/special/special',
                '/pages/user/user'
            ]

            if (tabbarPages.includes(item.link)) {
                uni.switchTab({
                    url: item.link
                })
            } else {
                uni.navigateTo({
                    url: item.link
                })
            }
        }
    } else {
        console.log('轮播图没有配置跳转链接')
    }
}
</script>

<style scoped>
.banner-swiper {
    width: 100%;
    height: 360rpx;
    border-radius: 12rpx;
    overflow: hidden;
}

.banner-image {
    width: 100%;
    height: 100%;
    display: block;
}
</style>

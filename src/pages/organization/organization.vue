<template>
    <view class="page">
        <view class="container">
            <RefreshLoadList ref="listRef" :api="getOrganizationList" :params="listParams"
                :dataMapping="mapOrganizationData" :pageSize="10" emptyIcon="📭" emptyText="暂无相关组织">
                <template #header>
                    <!-- 搜索栏 -->
                    <view class="search-bar">
                        <view class="search-box">
                            <text class="search-icon">🔍</text>
                            <input class="search-input" placeholder="搜索组织名称..." v-model="searchKeyword"
                                @input="onSearch" @confirm="onSearchConfirm" />
                            <text class="clear-icon" v-if="searchKeyword" @tap="clearSearch">✕</text>
                        </view>
                    </view>

                    <!-- 组织轮播图 -->
                    <view class="swiper-container">
                        <swiper class="organization-swiper" :indicator-dots="true" :autoplay="true" :interval="3000"
                            :duration="500" indicator-color="rgba(255, 255, 255, 0.5)" indicator-active-color="#fff">
                            <swiper-item v-for="(banner, index) in banners" :key="index">
                                <view class="swiper-item-wrapper">
                                    <image class="swiper-image" :src="banner.image" mode="aspectFill"
                                        @tap="goToBanner(banner)">
                                    </image>
                                    <view class="swiper-overlay">
                                        <text class="swiper-title">{{ banner.title }}</text>
                                        <text class="swiper-desc">{{ banner.desc }}</text>
                                    </view>
                                </view>
                            </swiper-item>
                        </swiper>
                    </view>

                    <!-- 组织筛选 -->
                    <view class="filter-section">
                        <scroll-view class="filter-tabs" scroll-x>
                            <view class="filter-tab" v-for="(filter, index) in filters" :key="index"
                                :class="{ active: currentFilter === filter.value }" @tap="switchFilter(filter.value)">
                                <text class="tab-text">{{ filter.icon }} {{ filter.label }}</text>
                            </view>
                        </scroll-view>
                    </view>
                </template>

                <template #default="{ items }">
                    <!-- 组织列表 -->
                    <view class="organization-list">
                        <view class="organization-item" v-for="(org, index) in items" :key="index"
                            @tap="goToDetail(org)">
                            <image class="org-logo" :src="org.logo" mode="aspectFill"></image>
                            <view class="org-info">
                                <view class="org-header">
                                    <text class="org-name">{{ org.name }}</text>
                                    <view class="org-level" :class="'level-' + org.level">
                                        <text class="level-text">{{ getLevelText(org.level) }}</text>
                                    </view>
                                </view>
                                <text class="org-intro">{{ org.intro }}</text>
                                <view class="org-meta">
                                    <text class="meta-item">👥 {{ org.memberCount }}人</text>
                                    <text class="meta-item">📅 成立于{{ org.foundedYear }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </template>
            </RefreshLoadList>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'
import { getOrganizationList, getCarouselOrganizations, getOrganizationLevelsMap } from '@/api/organization'

const listRef = ref(null)
const searchKeyword = ref('')
const currentFilter = ref('all')

// 轮播图数据
const banners = ref([])

// 筛选选项
const filters = ref([
    { label: '全部', value: 'all', icon: '📍' }
])

// 加载组织级别映射
const loadOrganizationLevels = async () => {
    try {
        const res = await getOrganizationLevelsMap()
        console.log('组织级别映射原始数据:', res)

        // 接口直接返回数组(与其他map接口一样)
        const dataArray = Array.isArray(res) ? res : (res.data || [])
        console.log('数据数组:', dataArray)

        if (Array.isArray(dataArray) && dataArray.length > 0) {
            const levels = dataArray.map(item => ({
                label: item.label,
                value: item.value,
                icon: getIconByLevel(item.value)
            }))

            console.log('转换后的级别:', levels)

            // 保留"全部"选项,添加接口返回的级别
            filters.value = [
                { label: '全部', value: 'all', icon: '📍' },
                ...levels
            ]

            console.log('最终的筛选数据:', filters.value)
        } else {
            console.log('数据格式不正确或数据为空')
        }
    } catch (error) {
        console.error('加载组织级别失败:', error)
    }
}

// 根据级别获取图标
const getIconByLevel = (level) => {
    const iconMap = {
        '1': '🏫',  // 校级
        '2': '🎓',  // 院级
        '3': '👥'   // 班级
    }
    return iconMap[level] || '📍'
}



// 列表请求参数
const listParams = computed(() => {
    const params = {}
    if (searchKeyword.value) {
        params.search = searchKeyword.value
    }
    if (currentFilter.value !== 'all') {
        params.level = currentFilter.value
    }
    return params
})

// 数据映射函数
const mapOrganizationData = (org) => {
    return {
        id: org.organizationId,
        name: org.organizationName,
        logo: org.organizationLogo || 'https://picsum.photos/200/200?random=' + org.organizationId,
        intro: org.displayText || org.introduction || '暂无简介',
        introduction: org.introduction || org.displayText || '暂无简介',
        level: org.organizationLevel,
        memberCount: org.memberCount || 0,
        foundedYear: org.establishYear || '未知'
    }
}

// 加载轮播图数据
const loadCarouselOrganizations = async () => {
    try {
        console.log('加载轮播组织')
        const res = await getCarouselOrganizations()
        console.log('轮播组织响应:', res)

        // request.js 已经自动解析了 data.data，所以 res 直接就是数组
        const list = Array.isArray(res) ? res : []
        console.log('轮播组织列表:', list)

        if (list.length > 0) {
            banners.value = list.map(org => {
                const banner = {
                    id: org.organizationId,
                    image: org.recommendImage,
                    title: org.organizationName,
                    desc: org.displayText || org.introduction || '欢迎加入我们'
                }
                console.log('轮播图项:', banner)
                return banner
            })
            console.log('最终轮播图数据:', banners.value)
        }
    } catch (error) {
        console.error('加载轮播组织失败:', error)
    }
}

onLoad(() => {
    console.log('组织页面加载')
    // 加载组织级别映射
    loadOrganizationLevels()
    // 加载轮播图
    loadCarouselOrganizations()
})



// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        '1': '校级',
        '2': '院级',
        '3': '班级'
    }
    return levelMap[level] || '未知'
}

// 搜索输入
const onSearch = () => {
    // 实时搜索 - RefreshLoadList 会自动监听 params 变化
}

// 搜索确认
const onSearchConfirm = () => {
    // 搜索确认 - RefreshLoadList 会自动监听 params 变化
}

// 清除搜索
const clearSearch = () => {
    searchKeyword.value = ''
}

// 切换筛选
const switchFilter = (value) => {
    currentFilter.value = value
}

// 跳转轮播图详情
const goToBanner = (banner) => {
    // 跳转到对应组织详情
    console.log('点击轮播图', banner)
    if (banner && banner.id) {
        uni.navigateTo({
            url: `/pages/organization-detail/organization-detail?id=${banner.id}`
        })
    }
}

// 跳转组织详情
const goToDetail = (org) => {
    uni.navigateTo({
        url: `/pages/organization-detail/organization-detail?id=${org.id}`
    })
}
</script>

<style scoped lang="scss">
.container {
    height: 100vh;
    background: #f5f5f5;
    overflow: hidden;
}

/* 搜索栏 */
.search-bar {
    background: #fff;
    padding: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-box {
    display: flex;
    align-items: center;
    height: 72rpx;
    padding: 0 24rpx;
    background-color: #f5f5f5;
    border-radius: 36rpx;
    gap: 12rpx;
}

.search-icon {
    font-size: 32rpx;
    color: #999;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    height: 100%;
}

.clear-icon {
    font-size: 28rpx;
    color: #999;
    padding: 8rpx;
}

/* 轮播图 */
.swiper-container {
    margin: 20rpx;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.organization-swiper {
    width: 100%;
    height: 400rpx;
}

.swiper-item-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}

.swiper-image {
    width: 100%;
    height: 100%;
    display: block;
}

.swiper-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    padding: 40rpx 30rpx 30rpx;
    display: flex;
    flex-direction: column;
}

.swiper-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
}

.swiper-desc {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

/* 筛选区域 */
.filter-section {
    background: #fff;
    margin: 20rpx 20rpx 0;
    border-radius: 16rpx;
    padding: 16rpx 24rpx;
}

.filter-tabs {
    white-space: nowrap;

    &::-webkit-scrollbar {
        display: none;
    }
}

.filter-tab {
    display: inline-block;
    padding: 12rpx 24rpx;
    margin-right: 16rpx;
    background-color: #f5f5f5;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);

        .tab-text {
            color: #fff;
        }
    }

    &:last-child {
        margin-right: 0;
    }
}

.tab-text {
    white-space: nowrap;
}

/* 组织列表 */
.organization-list {
    padding: 20rpx;
}

.organization-item {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    gap: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s;

    &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }
}

.org-logo {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
}

.org-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    min-width: 0;
}

.org-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.org-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.org-level {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &.level-1,
    &.level-school {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    }

    &.level-2,
    &.level-college {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.level-3,
    &.level-class {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
}

.level-text {
    font-size: 20rpx;
    color: #fff;
    white-space: nowrap;
}

.org-intro {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.org-meta {
    display: flex;
    gap: 24rpx;
}

.meta-item {
    font-size: 24rpx;
    color: #999;
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
    margin-bottom: 24rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>

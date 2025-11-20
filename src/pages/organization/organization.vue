<template>
    <view class="page">
        <view class="container">
            <!-- 搜索栏 -->
            <view class="search-bar">
                <view class="search-box">
                    <text class="search-icon">🔍</text>
                    <input class="search-input" placeholder="搜索组织名称..." v-model="searchKeyword" @input="onSearch"
                        @confirm="onSearchConfirm" />
                    <text class="clear-icon" v-if="searchKeyword" @tap="clearSearch">✕</text>
                </view>
            </view>

            <!-- 组织轮播图 -->
            <view class="swiper-container">
                <swiper class="organization-swiper" :indicator-dots="true" :autoplay="true" :interval="3000"
                    :duration="500" indicator-color="rgba(255, 255, 255, 0.5)" indicator-active-color="#fff">
                    <swiper-item v-for="(banner, index) in banners" :key="index">
                        <image class="swiper-image" :src="banner.image" mode="aspectFill" @tap="goToBanner(banner)">
                        </image>
                        <view class="swiper-overlay">
                            <text class="swiper-title">{{ banner.title }}</text>
                            <text class="swiper-desc">{{ banner.desc }}</text>
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

            <!-- 组织列表 -->
            <view class="organization-list">
                <view class="organization-item" v-for="(org, index) in displayOrganizations" :key="index"
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

                <!-- 空状态 -->
                <view class="empty-state" v-if="displayOrganizations.length === 0">
                    <text class="empty-icon">📭</text>
                    <text class="empty-text">暂无相关组织</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrganizationList, getCarouselOrganizations } from '@/api/organization'

const searchKeyword = ref('')
const currentFilter = ref('all')

// 轮播图数据
const banners = ref([])

// 筛选选项
const filters = ref([
    { label: '全部', value: 'all', icon: '📍' },
    { label: '校级', value: '1', icon: '🏫' },
    { label: '院级', value: '2', icon: '🎓' },
    { label: '班级', value: '3', icon: '👥' }
])

// 组织数据
const organizations = ref([])

// 搜索过滤
const filteredBySearch = computed(() => {
    if (!searchKeyword.value) return organizations.value
    const keyword = searchKeyword.value.toLowerCase()
    return organizations.value.filter(org =>
        org.name.toLowerCase().includes(keyword) ||
        (org.intro && org.intro.toLowerCase().includes(keyword)) ||
        (org.introduction && org.introduction.toLowerCase().includes(keyword))
    )
})

// 显示的组织列表
const displayOrganizations = computed(() => {
    let result = filteredBySearch.value
    if (currentFilter.value !== 'all') {
        result = result.filter(org => org.level === currentFilter.value)
    }
    return result
})

// 加载轮播图数据
const loadCarouselOrganizations = async () => {
    try {
        console.log('加载轮播组织')
        const res = await getCarouselOrganizations()
        console.log('轮播组织响应:', res)

        // 后端返回的是数组，直接使用
        if (res && Array.isArray(res)) {
            banners.value = res.map(org => ({
                id: org.organizationId,
                image: org.recommendImage || org.organizationLogo || 'https://picsum.photos/800/400?random=' + org.organizationId,
                title: org.organizationName,
                desc: org.displayText || org.introduction || '欢迎加入我们'
            }))
        }
    } catch (error) {
        console.error('加载轮播组织失败:', error)
        // 失败时使用默认轮播图
        banners.value = [
            {
                id: 1,
                image: 'https://picsum.photos/800/400?random=1',
                title: '精彩组织',
                desc: '探索更多精彩'
            }
        ]
    }
}

// 加载组织列表
const loadOrganizationList = async () => {
    try {
        console.log('加载组织列表')
        console.log('搜索关键词:', searchKeyword.value)
        console.log('筛选级别:', currentFilter.value)

        const params = {
            pageNum: 1,
            pageSize: 100
        }

        // 添加搜索关键词
        if (searchKeyword.value) {
            params.organizationName = searchKeyword.value
        }

        // 添加级别筛选
        if (currentFilter.value !== 'all') {
            params.level = currentFilter.value
        }

        const res = await getOrganizationList(params)
        console.log('组织列表响应:', res)

        if (res && res.rows) {
            organizations.value = res.rows.map(org => ({
                id: org.organizationId,
                name: org.organizationName,
                logo: org.organizationLogo || 'https://picsum.photos/200/200?random=' + org.organizationId,
                intro: org.displayText || org.introduction || '暂无简介',
                introduction: org.introduction || org.displayText || '暂无简介',
                level: org.organizationLevel,
                memberCount: org.memberCount || 0,
                foundedYear: org.establishYear || '未知'
            }))
            console.log('组织列表加载成功, 数量:', organizations.value.length)
        }
    } catch (error) {
        console.error('加载组织列表失败:', error)
        uni.showToast({
            title: error.message || '加载失败',
            icon: 'none'
        })
    }
}

onLoad(() => {
    console.log('组织页面加载')
    // 加载轮播图
    loadCarouselOrganizations()
    // 加载组织列表
    loadOrganizationList()
})


// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        '1': '校级',
        '2': '院级',
        '3': '班级',
        'school': '校级',
        'college': '院级',
        'class': '班级'
    }
    return levelMap[level] || '未知'
}

// 搜索输入
const onSearch = () => {
    // 实时搜索 - 重新加载列表
    loadOrganizationList()
}

// 搜索确认
const onSearchConfirm = () => {
    // 搜索确认 - 重新加载列表
    loadOrganizationList()
}

// 清除搜索
const clearSearch = () => {
    searchKeyword.value = ''
    loadOrganizationList()
}

// 切换筛选
const switchFilter = (value) => {
    currentFilter.value = value
    loadOrganizationList()
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
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
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
    height: 400rpx;
}

.swiper-image {
    width: 100%;
    height: 100%;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

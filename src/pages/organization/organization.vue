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

const searchKeyword = ref('')
const currentFilter = ref('all')

// 轮播图数据
const banners = ref([
    {
        id: 1,
        image: 'https://picsum.photos/800/400?random=1',
        title: '科技创新协会',
        desc: '探索科技前沿，创新引领未来'
    },
    {
        id: 2,
        image: 'https://picsum.photos/800/400?random=2',
        title: '学生会',
        desc: '服务同学，锻炼自我'
    },
    {
        id: 3,
        image: 'https://picsum.photos/800/400?random=3',
        title: '青年志愿者协会',
        desc: '奉献爱心，传递温暖'
    }
])

// 筛选选项
const filters = ref([
    { label: '全部', value: 'all', icon: '📍' },
    { label: '校级', value: 'school', icon: '🏫' },
    { label: '院级', value: 'college', icon: '🎓' },
    { label: '班级', value: 'class', icon: '👥' }
])

// 组织数据
const organizations = ref([
    {
        id: 1,
        name: '学生会',
        logo: 'https://picsum.photos/200/200?random=10',
        intro: '校学生会是在校党委领导、校团委指导下的学生组织，服务全校师生',
        level: 'school',
        memberCount: 120,
        foundedYear: '2010'
    },
    {
        id: 2,
        name: '科技创新协会',
        logo: 'https://picsum.photos/200/200?random=11',
        intro: '致力于培养学生科技创新能力，组织各类科技竞赛和技术交流活动',
        level: 'school',
        memberCount: 85,
        foundedYear: '2015'
    },
    {
        id: 3,
        name: '青年志愿者协会',
        logo: 'https://picsum.photos/200/200?random=12',
        intro: '传递爱心，服务社会，组织各类公益志愿活动',
        level: 'school',
        memberCount: 150,
        foundedYear: '2012'
    },
    {
        id: 4,
        name: '数据学院学生会',
        logo: 'https://picsum.photos/200/200?random=13',
        intro: '数据科学与大数据技术学院学生会，服务学院全体学生',
        level: 'college',
        memberCount: 45,
        foundedYear: '2018'
    },
    {
        id: 5,
        name: '计算机协会',
        logo: 'https://picsum.photos/200/200?random=14',
        intro: '计算机技术交流与学习平台，定期举办技术分享会',
        level: 'college',
        memberCount: 68,
        foundedYear: '2016'
    },
    {
        id: 6,
        name: '文学社',
        logo: 'https://picsum.photos/200/200?random=15',
        intro: '以文会友，品味文学之美，定期出版校园文学刊物',
        level: 'college',
        memberCount: 52,
        foundedYear: '2014'
    },
    {
        id: 7,
        name: '数据21-1班委会',
        logo: 'https://picsum.photos/200/200?random=16',
        intro: '数据科学21-1班班委会，为班级同学服务',
        level: 'class',
        memberCount: 8,
        foundedYear: '2021'
    },
    {
        id: 8,
        name: '计算机22-2班委会',
        logo: 'https://picsum.photos/200/200?random=17',
        intro: '计算机科学22-2班班委会，组织班级活动',
        level: 'class',
        memberCount: 7,
        foundedYear: '2022'
    },
    {
        id: 9,
        name: '摄影协会',
        logo: 'https://picsum.photos/200/200?random=18',
        intro: '用镜头记录美好，定期组织摄影采风活动',
        level: 'school',
        memberCount: 42,
        foundedYear: '2017'
    },
    {
        id: 10,
        name: '创业实践社',
        logo: 'https://picsum.photos/200/200?random=19',
        intro: '培养创业意识，提供创业实践平台',
        level: 'college',
        memberCount: 35,
        foundedYear: '2019'
    }
])

// 搜索过滤
const filteredBySearch = computed(() => {
    if (!searchKeyword.value) return organizations.value
    const keyword = searchKeyword.value.toLowerCase()
    return organizations.value.filter(org =>
        org.name.toLowerCase().includes(keyword) ||
        org.intro.toLowerCase().includes(keyword)
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

onLoad(() => {
    console.log('组织页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【组织页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取组织列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/organizations')
    console.log('请求参数:')
    console.log(JSON.stringify({
        level: 'all', // all | school | college | class
        keyword: '', // 搜索关键词
        page: 1,
        pageSize: 10
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            list: [
                {
                    id: 1,
                    name: '数据科学社团',
                    logo: 'https://example.com/logo.jpg',
                    level: 'school',
                    memberCount: 156,
                    activityCount: 28,
                    intro: '致力于数据科学...',
                    tags: ['数据分析', '人工智能'],
                    isJoined: false // 当前用户是否已加入
                }
            ],
            total: 45,
            levelCounts: {
                all: 45,
                school: 12,
                college: 18,
                class: 15
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 申请加入组织')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/organizations/:id/join')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        reason: '申请理由'
    }, null, 2))
    console.log('📝 部分组织需要审核,部分组织可直接加入')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        school: '校级',
        college: '院级',
        class: '班级'
    }
    return levelMap[level] || '未知'
}

// 搜索输入
const onSearch = () => {
    // 实时搜索
}

// 搜索确认
const onSearchConfirm = () => {
    // 搜索确认
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
    // 可以跳转到对应组织详情
    console.log('点击轮播图', banner)
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

    &.level-school {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.level-college {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

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

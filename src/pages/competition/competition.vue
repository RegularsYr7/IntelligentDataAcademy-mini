<template>
    <view class="page">
        <view class="container">
            <!-- 分类标签 -->
            <view class="category-tabs">
                <scroll-view scroll-x="true" class="tabs-scroll">
                    <view class="tab-item" v-for="(category, index) in categories" :key="index"
                        :class="{ active: currentCategory === category.id }" @tap="switchCategory(category.id)">
                        {{ category.name }}
                    </view>
                </scroll-view>
            </view>

            <!-- 竞赛列表 -->
            <view class="competition-list">
                <view class="competition-item" v-for="item in filteredCompetitions" :key="item.id"
                    @tap="goToDetail(item.id)">
                    <view class="item-header">
                        <text class="item-title">{{ item.title }}</text>
                        <view class="item-status" :class="getStatusClass(item.status)">
                            {{ item.status }}
                        </view>
                    </view>
                    <view class="item-info">
                        <view class="info-row">
                            <text class="info-label">报名时间：</text>
                            <text class="info-value">{{ item.registrationTime }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">竞赛时间：</text>
                            <text class="info-value">{{ item.competitionTime }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">浏览次数：</text>
                            <text class="info-value">{{ item.views }} 次</text>
                        </view>
                    </view>
                    <view class="item-footer">
                        <text class="category-tag">{{ getCategoryName(item.categoryId) }}</text>
                        <text class="view-detail">查看详情 ></text>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="filteredCompetitions.length === 0">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无竞赛信息</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 分类数据
const categories = ref([
    { id: 'all', name: '全部' },
    { id: 'academic', name: '学科竞赛' },
    { id: 'skills', name: '技能竞赛' },
    { id: 'innovation', name: '创新创业' },
    { id: 'culture', name: '文化艺术' },
    { id: 'sports', name: '体育竞技' }
])

// 当前选中分类
const currentCategory = ref('all')

// 竞赛列表数据
const competitions = ref([
    {
        id: 1,
        title: '全国大学生数学建模竞赛',
        categoryId: 'academic',
        status: '报名中',
        registrationTime: '2025-09-01 至 2025-09-30',
        competitionTime: '2025-10-15 09:00',
        views: 1234,
        publishTime: '2025-08-25 10:30'
    },
    {
        id: 2,
        title: '互联网+大学生创新创业大赛',
        categoryId: 'innovation',
        status: '进行中',
        registrationTime: '2025-08-15 至 2025-09-15',
        competitionTime: '2025-10-01 14:00',
        views: 2345,
        publishTime: '2025-08-10 15:20'
    },
    {
        id: 3,
        title: 'ACM程序设计竞赛',
        categoryId: 'skills',
        status: '已结束',
        registrationTime: '2025-07-01 至 2025-07-20',
        competitionTime: '2025-08-05 09:00',
        views: 3456,
        publishTime: '2025-06-20 09:00'
    },
    {
        id: 4,
        title: '全国大学生电子设计竞赛',
        categoryId: 'skills',
        status: '报名中',
        registrationTime: '2025-09-10 至 2025-10-10',
        competitionTime: '2025-11-01 08:30',
        views: 1567,
        publishTime: '2025-09-01 11:00'
    },
    {
        id: 5,
        title: '校园歌手大赛',
        categoryId: 'culture',
        status: '即将开始',
        registrationTime: '2025-10-01 至 2025-10-20',
        competitionTime: '2025-11-10 19:00',
        views: 892,
        publishTime: '2025-09-25 16:30'
    },
    {
        id: 6,
        title: '篮球联赛',
        categoryId: 'sports',
        status: '进行中',
        registrationTime: '2025-08-20 至 2025-09-10',
        competitionTime: '2025-09-25 15:00',
        views: 2103,
        publishTime: '2025-08-15 10:00'
    }
])

// 过滤后的竞赛列表
const filteredCompetitions = computed(() => {
    if (currentCategory.value === 'all') {
        return competitions.value
    }
    return competitions.value.filter(item => item.categoryId === currentCategory.value)
})

// 切换分类
const switchCategory = (categoryId) => {
    currentCategory.value = categoryId
}

// 获取分类名称
const getCategoryName = (categoryId) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category ? category.name : ''
}

// 获取状态样式类
const getStatusClass = (status) => {
    const statusMap = {
        '报名中': 'status-active',
        '进行中': 'status-ongoing',
        '即将开始': 'status-upcoming',
        '已结束': 'status-ended'
    }
    return statusMap[status] || ''
}

// 跳转详情页
const goToDetail = (id) => {
    uni.navigateTo({
        url: `/pages/competition-detail/competition-detail?id=${id}`
    })
}

onLoad(() => {
    console.log('竞赛章程页加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【竞赛章程页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取竞赛分类
    console.log('📍 接口1: 获取竞赛分类')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/competitions/categories')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            categories: [
                { id: 'all', name: '全部' },
                { id: 'academic', name: '学科竞赛' },
                { id: 'skills', name: '技能竞赛' },
                { id: 'innovation', name: '创新创业' },
                { id: 'culture', name: '文化艺术' },
                { id: 'sports', name: '体育竞技' }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 获取竞赛列表
    console.log('📍 接口2: 获取竞赛列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/competitions')
    console.log('请求参数:')
    console.log(JSON.stringify({
        categoryId: 'all', // 分类ID,从接口1获取的categories中的id字段,'all'表示全部
        level: '', // 可选,国家级、省级、校级
        keyword: '', // 可选,搜索关键词
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
                    title: '全国大学生数据分析大赛',
                    cover: 'https://example.com/cover.jpg',
                    level: '国家级',
                    categoryId: 'academic', // 对应分类的id
                    status: '报名中', // 状态文本
                    registrationTime: '2024-10-01 至 2024-11-30',
                    competitionTime: '2024-12-01 至 2025-03-31',
                    registrationDeadline: '2024-11-30',
                    startDate: '2024-12-01',
                    endDate: '2025-03-31',
                    organizer: '教育部',
                    prize: '一等奖10000元',
                    participants: 1256,
                    views: 5432,
                    isRegistered: false
                }
            ],
            total: 25
        }
    }, null, 2))
    console.log('\n')

    // 数据字典
    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('分类对象结构:')
    console.log(JSON.stringify({
        id: '分类ID(用于筛选参数)',
        name: '分类显示名称'
    }, null, 2))
    console.log('\n竞赛对象必填字段:')
    console.log(JSON.stringify({
        id: '竞赛ID',
        title: '竞赛标题',
        categoryId: '分类ID(对应categories中的id)',
        status: '状态文本',
        registrationTime: '报名时间文本',
        competitionTime: '竞赛时间文本',
        views: '浏览次数'
    }, null, 2))
    console.log('\n竞赛对象可选字段:')
    console.log(JSON.stringify({
        cover: '封面图片',
        level: '级别(国家级、省级、校级)',
        registrationDeadline: '报名截止日期',
        startDate: '开始日期',
        endDate: '结束日期',
        organizer: '主办方',
        prize: '奖项',
        participants: '参与人数',
        isRegistered: '是否已报名'
    }, null, 2))
    console.log('\n')

    // 说明
    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 工作流程:')
    console.log('   - 页面加载时先调用接口1获取分类列表')
    console.log('   - 用分类的id字段作为参数调用接口2获取竞赛列表')
    console.log('   - categoryId="all"时返回所有竞赛,其他值返回对应分类的竞赛')
    console.log('2. 分类筛选: 通过categoryId参数精确匹配竞赛的categoryId字段')
    console.log('3. 搜索功能: 支持按title模糊搜索,不区分大小写')
    console.log('4. 级别筛选: 支持按level精确筛选')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}

/* 分类标签 */
.category-tabs {
    background: #fff;
    padding: 20rpx 0;
    margin-bottom: 20rpx;
}

.tabs-scroll {
    white-space: nowrap;
}

.tab-item {
    display: inline-block;
    padding: 12rpx 32rpx;
    margin: 0 10rpx;
    font-size: 28rpx;
    color: #666;
    border-radius: 40rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        color: #fff;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-weight: bold;
    }

    &:first-child {
        margin-left: 20rpx;
    }

    &:last-child {
        margin-right: 20rpx;
    }
}

/* 竞赛列表 */
.competition-list {
    padding: 0 20rpx;
}

.competition-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
}

.item-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-right: 20rpx;
}

.item-status {
    flex-shrink: 0;
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    border-radius: 30rpx;
    background: #f5f5f5;
    color: #999;

    &.status-active {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #ff6b6b;
    }

    &.status-ongoing {
        background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
        color: #667eea;
    }

    &.status-upcoming {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: #f5576c;
    }

    &.status-ended {
        background: #f5f5f5;
        color: #999;
    }
}

.item-info {
    margin-bottom: 20rpx;
}

.info-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    font-size: 26rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.info-label {
    color: #999;
    flex-shrink: 0;
}

.info-value {
    color: #666;
    flex: 1;
}

.item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.category-tag {
    font-size: 24rpx;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
}

.view-detail {
    font-size: 26rpx;
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
    margin-bottom: 20rpx;
    opacity: 0.3;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>

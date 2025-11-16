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

            <!-- 风采列表 -->
            <view class="showcase-list">
                <view class="showcase-item" v-for="item in filteredShowcases" :key="item.id" @tap="goToDetail(item.id)">
                    <image class="item-image" :src="item.coverImage" mode="aspectFill"></image>
                    <view class="item-content">
                        <view class="item-header">
                            <text class="item-title">{{ item.title }}</text>
                            <view class="item-type" :class="getTypeClass(item.type)">
                                {{ getTypeName(item.type) }}
                            </view>
                        </view>
                        <text class="item-desc">{{ item.description }}</text>
                        <view class="item-footer">
                            <text class="item-meta">
                                <text class="meta-icon">👁</text>
                                {{ item.views }} 次浏览
                            </text>
                            <text class="item-meta">
                                <text class="meta-icon">🕒</text>
                                {{ item.publishTime }}
                            </text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="filteredShowcases.length === 0">
                <text class="empty-icon">🎨</text>
                <text class="empty-text">暂无风采展示</text>
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
    { id: 'student', name: '优秀学生' },
    { id: 'teacher', name: '优秀教师' },
    { id: 'organization', name: '优秀组织' }
])

// 当前选中分类
const currentCategory = ref('all')

// 风采展示列表数据
const showcases = ref([
    {
        id: 1,
        title: '李明同学荣获国家奖学金',
        type: 'student',
        coverImage: 'https://picsum.photos/400/300?random=student1',
        description: '计算机学院李明同学品学兼优，连续三年综合测评排名第一，荣获国家奖学金。',
        views: 1523,
        publishTime: '2025-10-20'
    },
    {
        id: 2,
        title: '张教授获评省级教学名师',
        type: 'teacher',
        coverImage: 'https://picsum.photos/400/300?random=teacher1',
        description: '数学学院张教授潜心教学三十载，深受学生喜爱，获评省级教学名师。',
        views: 2341,
        publishTime: '2025-10-18'
    },
    {
        id: 3,
        title: '科技创新社团荣获全国优秀社团',
        type: 'organization',
        coverImage: 'https://picsum.photos/400/300?random=org1',
        description: '我校科技创新社团在本年度全国高校社团评选中脱颖而出，荣获全国优秀社团称号。',
        views: 1876,
        publishTime: '2025-10-15'
    },
    {
        id: 4,
        title: '王华同学创业项目融资千万',
        type: 'student',
        coverImage: 'https://picsum.photos/400/300?random=student2',
        description: '管理学院王华同学创业项目获得知名投资机构千万级融资，成为创业典范。',
        views: 3245,
        publishTime: '2025-10-12'
    },
    {
        id: 5,
        title: '刘教授团队科研成果发表国际顶刊',
        type: 'teacher',
        coverImage: 'https://picsum.photos/400/300?random=teacher2',
        description: '物理学院刘教授团队在量子计算领域取得重大突破，成果发表于《Nature》期刊。',
        views: 2567,
        publishTime: '2025-10-10'
    },
    {
        id: 6,
        title: '志愿者协会获评全国十佳志愿服务组织',
        type: 'organization',
        coverImage: 'https://picsum.photos/400/300?random=org2',
        description: '我校志愿者协会长期开展公益活动，累计服务时长超万小时，获评全国十佳。',
        views: 1932,
        publishTime: '2025-10-08'
    },
    {
        id: 7,
        title: '陈雨同学获全国演讲比赛冠军',
        type: 'student',
        coverImage: 'https://picsum.photos/400/300?random=student3',
        description: '文学院陈雨同学在全国大学生演讲比赛中凭借出色表现夺得冠军。',
        views: 1654,
        publishTime: '2025-10-05'
    },
    {
        id: 8,
        title: '赵老师荣获青年教师教学竞赛一等奖',
        type: 'teacher',
        coverImage: 'https://picsum.photos/400/300?random=teacher3',
        description: '外语学院赵老师教学方法创新，在全国青年教师教学竞赛中荣获一等奖。',
        views: 1423,
        publishTime: '2025-10-02'
    }
])

// 过滤后的风采列表
const filteredShowcases = computed(() => {
    if (currentCategory.value === 'all') {
        return showcases.value
    }
    return showcases.value.filter(item => item.type === currentCategory.value)
})

// 切换分类
const switchCategory = (categoryId) => {
    currentCategory.value = categoryId
}

// 获取类型名称
const getTypeName = (type) => {
    const typeMap = {
        'student': '优秀学生',
        'teacher': '优秀教师',
        'organization': '优秀组织'
    }
    return typeMap[type] || ''
}

// 获取类型样式类
const getTypeClass = (type) => {
    return `type-${type}`
}

// 跳转详情页
const goToDetail = (id) => {
    uni.navigateTo({
        url: `/pages/showcase-detail/showcase-detail?id=${id}`
    })
}

onLoad(() => {
    console.log('风采展示页加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【风采展示页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取风采展示列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/showcase')
    console.log('请求参数:')
    console.log(JSON.stringify({
        category: 'all', // all | achievement | honor | activity | other
        keyword: '',
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
                    title: '2024年数据分析大赛一等奖',
                    cover: 'https://example.com/cover.jpg',
                    category: 'achievement',
                    description: '在全国大学生数据分析大赛中...',
                    images: ['https://example.com/img1.jpg'],
                    date: '2024-10-15',
                    participants: [
                        {
                            id: 1,
                            name: '张三',
                            avatar: 'https://example.com/avatar.jpg'
                        }
                    ],
                    likeCount: 256,
                    viewCount: 1523,
                    isLiked: false
                }
            ],
            total: 45
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 点赞/取消点赞')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/showcase/:id/like 或 /api/showcase/:id/unlike')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('category分类:')
    console.log('  - achievement: 成果展示')
    console.log('  - honor: 荣誉奖项')
    console.log('  - activity: 活动回顾')
    console.log('  - other: 其他')
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
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        font-weight: bold;
    }

    &:first-child {
        margin-left: 20rpx;
    }

    &:last-child {
        margin-right: 20rpx;
    }
}

/* 风采列表 */
.showcase-list {
    padding: 0 20rpx;
}

.showcase-item {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
}

.item-image {
    width: 100%;
    height: 360rpx;
}

.item-content {
    padding: 24rpx;
}

.item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
}

.item-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.4;
    margin-right: 20rpx;
}

.item-type {
    flex-shrink: 0;
    padding: 6rpx 16rpx;
    font-size: 22rpx;
    border-radius: 20rpx;

    &.type-student {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #f5576c;
    }

    &.type-teacher {
        background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
        color: #667eea;
    }

    &.type-organization {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: #ff8a00;
    }
}

.item-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.item-footer {
    display: flex;
    gap: 30rpx;
}

.item-meta {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
}

.meta-icon {
    margin-right: 6rpx;
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

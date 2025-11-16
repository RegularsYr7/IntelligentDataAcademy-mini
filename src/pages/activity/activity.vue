<template>
    <view class="page">
        <view class="activity-container">
            <!-- 搜索框 -->
            <view class="search-section">
                <view class="search-box">
                    <text class="search-icon">🔍</text>
                    <input class="search-input" v-model="searchKeyword" placeholder="搜索活动名称" @confirm="onSearch" />
                    <text class="clear-icon" v-if="searchKeyword" @tap="onClear">×</text>
                </view>
            </view>

            <!-- 活动分类 -->
            <view class="category-section">
                <scroll-view class="category-scroll" scroll-x>
                    <view class="category-list">
                        <view class="category-item" v-for="(item, index) in categoryList" :key="index"
                            :class="{ active: currentCategory === index }" @tap="onCategoryChange(index)">
                            <text class="category-text">{{ item.name }}</text>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 活动列表 (两列布局) -->
            <view class="activity-grid">
                <view class="activity-card" v-for="item in filteredActivityList" :key="item.id"
                    @tap="viewActivity(item)">
                    <view class="card-image-wrapper">
                        <image class="card-image" :src="item.image" mode="aspectFill"></image>
                        <!-- 积分和状态标签 -->
                        <view class="overlay-badges">
                            <view class="points-badge">
                                <text class="points-icon">⭐</text>
                                <text class="points-text">{{ item.points }}</text>
                            </view>
                            <view class="status-badge" :class="'status-' + item.status">
                                {{ getStatusText(item.status) }}
                            </view>
                        </view>
                    </view>
                    <view class="card-content">
                        <view class="card-header">
                            <text class="activity-name">{{ item.title }}</text>
                        </view>
                        <view class="activity-time-range">
                            <text class="time-icon">🕒</text>
                            <text class="time-text">{{ item.startTime }} - {{ item.endTime }}</text>
                        </view>
                        <view class="card-tags">
                            <view class="tag type-tag" :class="'type-' + item.type">
                                {{ getTypeText(item.type) }}
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="filteredActivityList.length === 0">
                <text class="empty-icon">📭</text>
                <text class="empty-text">暂无活动</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 搜索关键词
const searchKeyword = ref('')

// 当前分类
const currentCategory = ref(0)

// 分类列表
const categoryList = ref([
    { name: '全部' },
    { name: '学术讲座' },
    { name: '文体活动' },
    { name: '志愿服务' },
    { name: '社团活动' }
])

// 活动列表数据
const activityList = ref([
    {
        id: 1,
        image: 'https://picsum.photos/300/200?random=21',
        title: '人工智能前沿讲座',
        type: 'academic',
        status: 'recruiting',
        startTime: '11-05 14:00',
        endTime: '16:00',
        points: 10,
        category: '学术讲座'
    },
    {
        id: 2,
        image: 'https://picsum.photos/300/200?random=22',
        title: '校园篮球赛',
        type: 'sports',
        status: 'ongoing',
        startTime: '11-08 09:00',
        endTime: '17:00',
        points: 15,
        category: '文体活动'
    },
    {
        id: 3,
        image: 'https://picsum.photos/300/200?random=23',
        title: '社区志愿服务',
        type: 'volunteer',
        status: 'recruiting',
        startTime: '11-10 08:00',
        endTime: '12:00',
        points: 20,
        category: '志愿服务'
    },
    {
        id: 4,
        image: 'https://picsum.photos/300/200?random=24',
        title: '音乐社团纳新',
        type: 'club',
        status: 'recruiting',
        startTime: '11-12 15:00',
        endTime: '18:00',
        points: 5,
        category: '社团活动'
    },
    {
        id: 5,
        image: 'https://picsum.photos/300/200?random=25',
        title: '数据科学研讨会',
        type: 'academic',
        status: 'finished',
        startTime: '10-25 14:00',
        endTime: '16:30',
        points: 12,
        category: '学术讲座'
    },
    {
        id: 6,
        image: 'https://picsum.photos/300/200?random=26',
        title: '校园歌手大赛',
        type: 'sports',
        status: 'recruiting',
        startTime: '11-18 19:00',
        endTime: '21:00',
        points: 15,
        category: '文体活动'
    },
    {
        id: 7,
        image: 'https://picsum.photos/300/200?random=27',
        title: '敬老院献爱心',
        type: 'volunteer',
        status: 'ongoing',
        startTime: '11-06 09:00',
        endTime: '12:00',
        points: 25,
        category: '志愿服务'
    },
    {
        id: 8,
        image: 'https://picsum.photos/300/200?random=28',
        title: '摄影社作品展',
        type: 'club',
        status: 'recruiting',
        startTime: '11-20 10:00',
        endTime: '17:00',
        points: 8,
        category: '社团活动'
    }
])

// 筛选后的活动列表
const filteredActivityList = computed(() => {
    let list = activityList.value

    // 按分类筛选
    if (currentCategory.value > 0) {
        const categoryName = categoryList.value[currentCategory.value].name
        list = list.filter(item => item.category === categoryName)
    }

    // 按搜索关键词筛选
    if (searchKeyword.value.trim()) {
        list = list.filter(item =>
            item.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
    }

    return list
})

// 获取类型文本
const getTypeText = (type) => {
    const typeMap = {
        'academic': '学术',
        'sports': '文体',
        'volunteer': '志愿',
        'club': '社团'
    }
    return typeMap[type] || ''
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'recruiting': '报名中',
        'ongoing': '进行中',
        'finished': '已结束'
    }
    return statusMap[status] || ''
}

// 搜索
const onSearch = () => {
    console.log('搜索:', searchKeyword.value)
}

// 清空搜索
const onClear = () => {
    searchKeyword.value = ''
}

// 切换分类
const onCategoryChange = (index) => {
    currentCategory.value = index
}

// 查看活动详情
const viewActivity = (activity) => {
    uni.navigateTo({
        url: `/pages/activity-detail/activity-detail?id=${activity.id}`
    })
}

onLoad(() => {
    console.log('活动页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【活动列表页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取活动分类
    console.log('📍 接口1: 获取活动分类')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/activities/categories')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            categories: [
                { id: 'all', name: '全部' },
                { id: 'lecture', name: '学术讲座' },
                { id: 'sports', name: '文体活动' },
                { id: 'volunteer', name: '志愿服务' },
                { id: 'club', name: '社团活动' }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 获取活动列表
    console.log('📍 接口2: 获取活动列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/activities')
    console.log('请求参数:')
    console.log(JSON.stringify({
        categoryId: 'all', // 分类ID,从接口1获取的categories中的id字段,'all'表示全部
        status: '', // 可选,recruiting-招募中、ongoing-进行中、finished-已结束
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
                    title: '人工智能前沿讲座',
                    image: 'https://example.com/cover.jpg',
                    categoryId: 'lecture', // 对应分类的id
                    type: 'academic', // 活动类型
                    status: 'recruiting', // recruiting-招募中、ongoing-进行中、finished-已结束
                    startTime: '11-05 14:00',
                    endTime: '16:00',
                    points: 10, // 可获得积分
                    location: '教学楼A301',
                    organization: '数据科学社团',
                    participants: 45, // 参与人数
                    maxParticipants: 100, // 最大人数
                    description: '活动简介...'
                }
            ],
            total: 50
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
    console.log('\n活动对象必填字段:')
    console.log(JSON.stringify({
        id: '活动ID',
        title: '活动标题',
        categoryId: '分类ID(对应categories中的id)',
        status: '状态(recruiting|ongoing|finished)',
        startTime: '开始时间',
        endTime: '结束时间',
        points: '可获得积分'
    }, null, 2))
    console.log('\n活动对象可选字段:')
    console.log(JSON.stringify({
        image: '活动封面图片',
        type: '活动类型',
        location: '活动地点',
        organization: '主办组织',
        participants: '参与人数',
        maxParticipants: '最大人数',
        description: '活动简介'
    }, null, 2))
    console.log('\n')

    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 工作流程:')
    console.log('   - 页面加载时先调用接口1获取分类列表')
    console.log('   - 用分类的id字段作为参数调用接口2获取活动列表')
    console.log('   - categoryId="all"时返回所有活动,其他值返回对应分类的活动')
    console.log('2. 分类筛选: 通过categoryId参数精确匹配活动的categoryId字段')
    console.log('3. 搜索功能: 支持按title模糊搜索,不区分大小写')
    console.log('4. 状态筛选: 支持按status精确筛选')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}
</script>

<style scoped lang="scss">
.activity-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 20rpx;
}

/* 搜索框 */
.search-section {
    background: #fff;
    padding: 20rpx;
}

.search-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 50rpx;
    padding: 0 24rpx;
    height: 70rpx;
}

.search-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
    color: #999;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    height: 70rpx;
}

.clear-icon {
    font-size: 48rpx;
    color: #999;
    font-weight: 300;
    padding: 0 8rpx;
}

/* 分类标签 */
.category-section {
    background: #fff;
    padding: 0 20rpx 20rpx;
    margin-bottom: 20rpx;
}

.category-scroll {
    white-space: nowrap;
}

.category-list {
    display: inline-flex;
    gap: 20rpx;
}

.category-item {
    display: inline-block;
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .category-text {
            color: #fff;
        }
    }
}

.category-text {
    font-size: 28rpx;
    color: #666;
    font-weight: bold;
    white-space: nowrap;
}

/* 活动网格 (两列) */
.activity-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    padding: 0 20rpx;
}

.activity-card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-image-wrapper {
    position: relative;
    width: 100%;
    height: 200rpx;
}

.card-image {
    width: 100%;
    height: 100%;
}

.overlay-badges {
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.points-badge {
    display: flex;
    align-items: center;
    gap: 4rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
}

.points-icon {
    font-size: 20rpx;
}

.points-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: bold;
}

.status-badge {
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
    font-weight: bold;
    text-align: center;

    &.status-recruiting {
        background: rgba(82, 196, 26, 0.9);
        color: #fff;
    }

    &.status-ongoing {
        background: rgba(102, 126, 234, 0.9);
        color: #fff;
    }

    &.status-finished {
        background: rgba(153, 153, 153, 0.9);
        color: #fff;
    }
}

.card-content {
    padding: 20rpx;
}

.card-header {
    margin-bottom: 12rpx;
}

.activity-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
}

.activity-time-range {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-bottom: 12rpx;
}

.time-icon {
    font-size: 20rpx;
}

.time-text {
    font-size: 22rpx;
    color: #999;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-tags {
    display: flex;
    gap: 8rpx;
    margin-bottom: 12rpx;
}

.tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
}

.type-tag {
    &.type-academic {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.type-sports {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.type-volunteer {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }

    &.type-club {
        background: rgba(245, 87, 108, 0.1);
        color: #f5576c;
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;
    gap: 20rpx;
}

.empty-icon {
    font-size: 100rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>

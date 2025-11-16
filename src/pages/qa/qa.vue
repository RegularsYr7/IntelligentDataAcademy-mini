<template>
    <view class="page">
        <view class="community-container">
            <!-- 顶部搜索栏 -->
            <view class="top-bar">
                <view class="search-box">
                    <text class="search-icon">🔍</text>
                    <input class="search-input" placeholder="搜索话题、帖子..." v-model="searchKeyword"
                        @confirm="searchContent" />
                </view>
                <view class="message-icon" @tap="goToMessage">
                    <text class="icon">✉️</text>
                    <view class="badge" v-if="unreadCount > 0">{{ unreadCount }}</view>
                </view>
            </view>

            <!-- 分类导航 -->
            <scroll-view class="category-nav" scroll-x>
                <view class="category-list">
                    <view class="category-item" v-for="(category, index) in categories" :key="index"
                        :class="{ active: currentCategory === category.id }" @tap="switchCategory(category.id)">
                        <text class="category-icon">{{ category.icon }}</text>
                        <text class="category-name">{{ category.name }}</text>
                    </view>
                </view>
            </scroll-view>

            <!-- 排序选项 -->
            <view class="sort-bar">
                <view class="sort-item" v-for="(sort, index) in sortOptions" :key="index"
                    :class="{ active: currentSort === sort.value }" @tap="switchSort(sort.value)">
                    <text class="sort-text">{{ sort.label }}</text>
                </view>
            </view>

            <!-- 帖子列表 -->
            <view class="post-list">
                <view class="post-item" v-for="(item, index) in postList" :key="index" @tap="viewPost(item)">
                    <view class="post-header">
                        <image class="user-avatar" :src="item.userAvatar" mode="aspectFill"></image>
                        <view class="user-info">
                            <view class="user-name-row">
                                <text class="user-name">{{ item.userName }}</text>
                            </view>
                            <text class="post-time">{{ item.time }}</text>
                        </view>
                        <view class="follow-btn" v-if="!item.isFollowed" @tap.stop="followUser(item)">
                            <text class="follow-text">+ 关注</text>
                        </view>
                    </view>

                    <view class="post-content">
                        <text class="post-title">{{ item.title }}</text>
                        <text class="post-detail" v-if="item.detail">{{ item.detail }}</text>

                        <!-- 图片列表 -->
                        <view class="post-images" v-if="item.images && item.images.length > 0"
                            :class="'images-' + item.images.length">
                            <image class="post-image" v-for="(img, idx) in item.images" :key="idx" :src="img"
                                mode="aspectFill" @tap.stop="previewImage(item.images, idx)"></image>
                        </view>

                        <!-- 标签 -->
                        <view class="post-tags" v-if="item.tags && item.tags.length > 0">
                            <text class="tag" v-for="(tag, idx) in item.tags" :key="idx" @tap.stop="searchTag(tag)">#{{
                                tag }}</text>
                        </view>
                    </view>

                    <view class="post-footer">
                        <view class="footer-item" @tap.stop="toggleLike(item)">
                            <text class="icon" :class="{ liked: item.isLiked }">{{ item.isLiked ? '❤️' : '🤍'
                                }}</text>
                            <text class="count" :class="{ liked: item.isLiked }">{{ item.likes }}</text>
                        </view>
                        <view class="footer-item" @tap.stop="viewComments(item)">
                            <text class="icon">💬</text>
                            <text class="count">{{ item.comments }}</text>
                        </view>
                        <view class="footer-item" @tap.stop="collectPost(item)">
                            <text class="icon">{{ item.isCollected ? '⭐' : '☆' }}</text>
                            <text class="count">{{ item.collects }}</text>
                        </view>
                        <view class="footer-item" @tap.stop="sharePost(item)">
                            <text class="icon">📤</text>
                            <text class="count">分享</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-if="postList.length === 0">
                <text class="empty-icon">📝</text>
                <text class="empty-text">暂无内容</text>
                <text class="empty-hint">快来发布第一条帖子吧~</text>
            </view>

            <!-- 发布按钮 -->
            <view class="fab-btn" @tap="publishPost">
                <text class="fab-icon">✏️</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const searchKeyword = ref('')
const unreadCount = ref(3)
const currentCategory = ref('all')
const currentSort = ref('hot')

// 分类列表
const categories = ref([
    { id: 'all', name: '推荐', icon: '🌟' },
    { id: 'study', name: '学习', icon: '📚' },
    { id: 'life', name: '生活', icon: '🏠' },
    { id: 'activity', name: '活动', icon: '🎉' },
    { id: 'job', name: '求职', icon: '💼' },
    { id: 'food', name: '美食', icon: '🍜' },
    { id: 'sport', name: '运动', icon: '⚽' },
    { id: 'tech', name: '技术', icon: '💻' }
])

// 热门话题
const hotTopics = ref([
    { id: 1, title: '期末复习攻略', count: 2365 },
    { id: 2, title: '校园美食推荐', count: 1892 },
    { id: 3, title: '实习经验分享', count: 1567 },
    { id: 4, title: '考研交流', count: 1234 },
    { id: 5, title: '社团招新', count: 998 }
])

// 排序选项
const sortOptions = ref([
    { label: '热门', value: 'hot' },
    { label: '最新', value: 'latest' },
    { label: '关注', value: 'follow' }
])

// 帖子列表
const postList = ref([
    {
        id: 1,
        userAvatar: 'https://picsum.photos/100/100?random=31',
        userName: '学习委员',
        time: '10分钟前',
        title: '高数期末复习重点整理,学弟学妹们快来看!',
        detail: '马上期末考试了,整理了一份高数的重点知识点和常考题型,希望能帮到大家。重点章节包括:极限、导数、积分、微分方程等...',
        images: ['https://picsum.photos/400/300?random=41', 'https://picsum.photos/400/300?random=42', 'https://picsum.photos/400/300?random=43'],
        tags: ['学习', '高数', '期末复习'],
        likes: 328,
        comments: 56,
        collects: 189,
        isLiked: false,
        isCollected: false,
        isFollowed: false
    },
    {
        id: 2,
        userAvatar: 'https://picsum.photos/100/100?random=32',
        userName: '代码诗人',
        time: '1小时前',
        title: 'Python爬虫实战教程,从入门到进阶',
        detail: '最近做了一个爬虫项目,踩了不少坑,分享一下经验。包括:反爬虫处理、数据清洗、多线程优化等技巧。',
        images: ['https://picsum.photos/400/300?random=44'],
        tags: ['编程', 'Python', '爬虫'],
        likes: 256,
        comments: 43,
        collects: 124,
        isLiked: true,
        isCollected: true,
        isFollowed: false
    },
    {
        id: 3,
        userAvatar: 'https://picsum.photos/100/100?random=33',
        userName: '美食探索家',
        time: '2小时前',
        title: '学校周边超好吃的10家餐厅推荐!',
        detail: '作为一个资深吃货,把学校附近好吃的店都吃了个遍,今天给大家推荐10家性价比超高的餐厅~',
        images: [
            'https://picsum.photos/400/300?random=45',
            'https://picsum.photos/400/300?random=46',
            'https://picsum.photos/400/300?random=47',
            'https://picsum.photos/400/300?random=48'
        ],
        tags: ['美食', '探店', '校园生活'],
        likes: 523,
        comments: 89,
        collects: 267,
        isLiked: false,
        isCollected: false,
        isFollowed: true
    },
    {
        id: 4,
        userAvatar: 'https://picsum.photos/100/100?random=34',
        userName: '运动达人',
        time: '5小时前',
        title: '健身房使用指南,新生必看!',
        detail: '学校健身房开放时间、收费标准、器材使用注意事项全攻略。',
        tags: ['运动', '健身', '新生指南'],
        likes: 167,
        comments: 34,
        collects: 92,
        isLiked: false,
        isCollected: false,
        isFollowed: false
    },
    {
        id: 5,
        userAvatar: 'https://picsum.photos/100/100?random=35',
        userName: '求职小白',
        time: '1天前',
        title: '字节跳动实习面试经验分享',
        detail: '刚拿到字节的实习offer,分享一下面试流程和准备经验,希望能帮到正在找实习的同学们。',
        images: ['https://picsum.photos/400/300?random=49', 'https://picsum.photos/400/300?random=50'],
        tags: ['实习', '面试经验', '字节跳动'],
        likes: 489,
        comments: 78,
        collects: 234,
        isLiked: true,
        isCollected: false,
        isFollowed: false
    },
    {
        id: 6,
        userAvatar: 'https://picsum.photos/100/100?random=36',
        userName: '英语学习者',
        time: '1天前',
        title: '四级考试高分秘籍,亲测有效!',
        detail: '上次考了620分,分享一下我的备考经验和学习方法。重点:词汇积累、听力训练、阅读技巧、写作模板。',
        tags: ['英语', '四级', '学习方法'],
        likes: 412,
        comments: 67,
        collects: 298,
        isLiked: false,
        isCollected: true,
        isFollowed: false
    },
    {
        id: 7,
        userAvatar: 'https://picsum.photos/100/100?random=37',
        userName: '社团负责人',
        time: '2天前',
        title: '计算机协会招新啦!欢迎新成员加入',
        detail: '我们是一个充满活力的技术社团,定期举办技术分享会、项目实战、竞赛培训等活动。无论你是小白还是大神,都欢迎加入!',
        images: ['https://picsum.photos/400/300?random=51'],
        tags: ['社团', '招新', '计算机'],
        likes: 234,
        comments: 45,
        collects: 67,
        isLiked: false,
        isCollected: false,
        isFollowed: false
    },
    {
        id: 8,
        userAvatar: 'https://picsum.photos/100/100?random=38',
        userName: '摄影爱好者',
        time: '3天前',
        title: '校园秋景大片来袭,美哭了!',
        detail: '趁着秋高气爽,拍了一组校园秋景照片,分享给大家~',
        images: [
            'https://picsum.photos/400/300?random=52',
            'https://picsum.photos/400/300?random=53',
            'https://picsum.photos/400/300?random=54',
            'https://picsum.photos/400/300?random=55',
            'https://picsum.photos/400/300?random=56',
            'https://picsum.photos/400/300?random=57'
        ],
        tags: ['摄影', '校园', '秋天'],
        likes: 678,
        comments: 123,
        collects: 345,
        isLiked: true,
        isCollected: true,
        isFollowed: true
    }
])

onLoad(() => {
    console.log('社区页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【社区问答页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取帖子列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/posts')
    console.log('请求参数:')
    console.log(JSON.stringify({
        tab: 'recommend', // recommend | latest | hot
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
                    title: '如何学好数据分析?',
                    content: '最近在学习数据分析...',
                    images: ['https://example.com/img1.jpg'],
                    author: {
                        id: 1,
                        name: '张三',
                        avatar: 'https://example.com/avatar.jpg'
                    },
                    likeCount: 128,
                    commentCount: 45,
                    viewCount: 1205,
                    isLiked: false,
                    isFavorited: false,
                    createTime: '2024-11-01 10:30',
                    tags: ['数据分析', '学习']
                }
            ],
            total: 156
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 点赞/取消点赞')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/posts/:id/like (点赞) 或 /api/posts/:id/unlike (取消)')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📍 接口3: 收藏/取消收藏')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/posts/:id/favorite (收藏) 或 /api/posts/:id/unfavorite (取消)')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('tab类型:')
    console.log('  - recommend: 推荐 (基于用户兴趣的算法推荐)')
    console.log('  - latest: 最新 (按发布时间倒序)')
    console.log('  - hot: 热门 (按点赞数+评论数综合排序)')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 搜索
const searchContent = () => {
    if (searchKeyword.value.trim()) {
        uni.showToast({
            title: '搜索: ' + searchKeyword.value,
            icon: 'none'
        })
    }
}

// 前往消息
const goToMessage = () => {
    uni.navigateTo({
        url: '/pages/message/message'
    })
}

// 切换分类
const switchCategory = (categoryId) => {
    currentCategory.value = categoryId
    uni.showToast({
        title: '切换到: ' + categories.value.find(c => c.id === categoryId).name,
        icon: 'none'
    })
}


// 切换排序
const switchSort = (sortValue) => {
    currentSort.value = sortValue
    uni.showToast({
        title: '切换排序: ' + sortOptions.value.find(s => s.value === sortValue).label,
        icon: 'none'
    })
}

// 查看帖子
const viewPost = (post) => {
    uni.navigateTo({
        url: `/pages/post-detail/post-detail?id=${post.id}`
    })
}

// 关注用户
const followUser = (post) => {
    post.isFollowed = true
    uni.showToast({
        title: '已关注 ' + post.userName,
        icon: 'success'
    })
}

// 预览图片
const previewImage = (images, current) => {
    uni.previewImage({
        urls: images,
        current: current
    })
}

// 搜索标签
const searchTag = (tag) => {
    uni.showToast({
        title: '搜索标签: ' + tag,
        icon: 'none'
    })
}

// 点赞
const toggleLike = (post) => {
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
    uni.showToast({
        title: post.isLiked ? '已点赞' : '取消点赞',
        icon: 'none'
    })
}

// 查看评论
const viewComments = (post) => {
    uni.showToast({
        title: '查看评论',
        icon: 'none'
    })
}

// 收藏
const collectPost = (post) => {
    post.isCollected = !post.isCollected
    post.collects += post.isCollected ? 1 : -1
    uni.showToast({
        title: post.isCollected ? '已收藏' : '取消收藏',
        icon: 'none'
    })
}

// 分享
const sharePost = (post) => {
    uni.showShareMenu({
        title: post.title,
        path: '/pages/qa/qa'
    })
}

// 发布帖子
const publishPost = () => {
    uni.navigateTo({
        url: '/pages/publish-post/publish-post'
    })
}
</script>

<style scoped lang="scss">
.community-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 100rpx;
}

/* 顶部搜索栏 */
.top-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    padding: 20rpx;
    background-color: #fff;
    gap: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.search-box {
    flex: 1;
    display: flex;
    align-items: center;
    height: 64rpx;
    padding: 0 20rpx;
    background-color: #f5f5f5;
    border-radius: 32rpx;
    gap: 8rpx;
}

.search-icon {
    font-size: 28rpx;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    height: 100%;
}

.message-icon {
    position: relative;
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 50%;

    .icon {
        font-size: 32rpx;
    }

    .badge {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        min-width: 32rpx;
        height: 32rpx;
        padding: 0 8rpx;
        background-color: #ff4d4f;
        color: #fff;
        font-size: 20rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }
}

/* 分类导航 */
.category-nav {
    background-color: #fff;
    white-space: nowrap;
    margin-bottom: 12rpx;
}

.category-list {
    display: inline-flex;
    padding: 16rpx 20rpx;
    gap: 24rpx;
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 20rpx;
    border-radius: 12rpx;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .category-icon,
        .category-name {
            transform: scale(1.1);
        }

        .category-name {
            color: #fff;
            font-weight: bold;
        }
    }
}

.category-icon {
    font-size: 36rpx;
    transition: transform 0.3s;
}

.category-name {
    font-size: 24rpx;
    color: #666;
    transition: all 0.3s;
}

/* 热门话题 */
.hot-topics {
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 12rpx;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.more-btn {
    font-size: 24rpx;
    color: #999;
}

.topics-scroll {
    white-space: nowrap;
}

.topic-item {
    display: inline-flex;
    flex-direction: column;
    padding: 16rpx 24rpx;
    margin-right: 16rpx;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
    border-radius: 12rpx;
    border: 2rpx solid #d4e0ff;
    min-width: 200rpx;

    &:last-child {
        margin-right: 0;
    }
}

.topic-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #667eea;
    margin-bottom: 8rpx;
}

.topic-count {
    font-size: 22rpx;
    color: #8b9ceb;
}

/* 排序栏 */
.sort-bar {
    display: flex;
    background-color: #fff;
    padding: 16rpx 20rpx;
    margin-bottom: 12rpx;
    gap: 32rpx;
}

.sort-item {
    position: relative;
    font-size: 28rpx;
    color: #666;
    padding: 8rpx 0;
    transition: all 0.3s;

    &.active {
        color: #667eea;
        font-weight: bold;

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2rpx;
        }
    }
}

/* 帖子列表 */
.post-list {
    padding: 0 20rpx;
}

.post-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.post-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.user-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    border: 2rpx solid #f0f0f0;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}

.user-name-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.user-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.user-badge {
    padding: 2rpx 12rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8rpx;
    font-size: 20rpx;
}

.badge-text {
    color: #fff;
    font-weight: bold;
}

.post-time {
    font-size: 24rpx;
    color: #999;
}

.follow-btn {
    padding: 8rpx 20rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20rpx;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
        opacity: 0.8;
        transform: scale(0.95);
    }
}

.follow-text {
    font-size: 24rpx;
    color: #fff;
}

.post-content {
    margin-bottom: 20rpx;
}

.post-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 12rpx;
    line-height: 1.5;
}

.post-detail {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    display: block;
    margin-bottom: 16rpx;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 图片网格 */
.post-images {
    display: grid;
    gap: 8rpx;
    margin-bottom: 16rpx;

    &.images-1 {
        grid-template-columns: 1fr;

        .post-image {
            height: 400rpx;
            border-radius: 12rpx;
        }
    }

    &.images-2,
    &.images-4 {
        grid-template-columns: 1fr 1fr;

        .post-image {
            height: 200rpx;
            border-radius: 8rpx;
        }
    }

    &.images-3 {
        grid-template-columns: 1fr 1fr 1fr;

        .post-image {
            height: 180rpx;
            border-radius: 8rpx;
        }
    }

    &.images-5,
    &.images-6,
    &.images-7,
    &.images-8,
    &.images-9 {
        grid-template-columns: 1fr 1fr 1fr;

        .post-image {
            height: 180rpx;
            border-radius: 8rpx;
        }
    }
}

.post-image {
    width: 100%;
    object-fit: cover;
}

.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.tag {
    font-size: 24rpx;
    color: #667eea;
    background-color: #f0f4ff;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    border: 1rpx solid #d4e0ff;
}

.post-footer {
    display: flex;
    justify-content: space-around;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;
}

.footer-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    transition: all 0.3s;

    &:active {
        background-color: #f5f5f5;
        transform: scale(0.95);
    }

    .icon {
        font-size: 32rpx;
        transition: all 0.3s;

        &.liked {
            animation: heartbeat 0.6s;
        }
    }

    .count {
        font-size: 24rpx;
        color: #999;
        transition: color 0.3s;

        &.liked {
            color: #667eea;
            font-weight: bold;
        }
    }
}

@keyframes heartbeat {
    0% {
        transform: scale(1);
    }

    25% {
        transform: scale(1.3);
    }

    50% {
        transform: scale(1);
    }

    75% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 100rpx 0;
    gap: 16rpx;

    .empty-icon {
        font-size: 120rpx;
        opacity: 0.5;
    }

    .empty-text {
        font-size: 32rpx;
        color: #999;
        font-weight: bold;
    }

    .empty-hint {
        font-size: 24rpx;
        color: #ccc;
    }
}

/* 悬浮发布按钮 */
.fab-btn {
    position: fixed;
    right: 30rpx;
    bottom: 120rpx;
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
    z-index: 99;
    transition: all 0.3s;

    &:active {
        transform: scale(0.9);
        box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
    }
}

.fab-icon {
    font-size: 48rpx;
}
</style>

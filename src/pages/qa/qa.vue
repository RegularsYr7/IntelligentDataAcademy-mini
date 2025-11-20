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

            <!-- 帖子列表 - 使用 RefreshLoadList 组件 -->
            <view class="list-container">
                <RefreshLoadList ref="listRef" :api="currentApi" :params="listParams" :dataMapping="mapPostData"
                    :pageSize="10" emptyIcon="📝" emptyText="暂无内容">
                    <template #default="{ items }">
                        <view class="post-list">
                            <view class="post-item" v-for="(item, index) in items" :key="index" @tap="viewPost(item)">
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
                                        <image class="post-image" v-for="(img, idx) in item.images" :key="idx"
                                            :src="img" mode="aspectFill" @tap.stop="previewImage(item.images, idx)">
                                        </image>
                                    </view>

                                    <!-- 标签 -->
                                    <view class="post-tags" v-if="item.tags && item.tags.length > 0">
                                        <text class="tag" v-for="(tag, idx) in item.tags" :key="idx"
                                            @tap.stop="searchTag(tag)">#{{ tag }}</text>
                                    </view>
                                </view>

                                <view class="post-footer">
                                    <view class="footer-item" @tap.stop="toggleLike(item)">
                                        <text class="icon" :class="{ liked: item.isLiked }">{{ item.isLiked ? '❤️' :
                                            '🤍'
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
                                </view>
                            </view>
                        </view>
                    </template>

                    <template #empty>
                        <!-- <view class="empty-action" @tap="publishPost">
                            <text class="action-text">快来发布第一条帖子吧~</text>
                        </view> -->
                    </template>
                </RefreshLoadList>
            </view> <!-- 发布按钮 -->
            <!-- <view class="fab-btn" @tap="publishPost">
                <text class="fab-icon">✏️</text>
            </view> -->
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'
import {
    getPostList,
    getPostsByCreateTime,
    getPostsByFollowing,
    getPostsByViewCount,
    likePost,
    unlikePost,
    collectPost as collectPostApi,
    uncollectPost,
    followUser as followUserApi,
    unfollowUser
} from '@/api/community'

const listRef = ref(null)
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

// 排序选项
const sortOptions = ref([
    { label: '热门', value: 'hot' },
    { label: '最新', value: 'latest' },
    { label: '关注', value: 'follow' }
])

// 根据排序类型返回对应的 API
const currentApi = computed(() => {
    switch (currentSort.value) {
        case 'hot':
            return getPostsByViewCount  // 按浏览量（热门）
        case 'latest':
            return getPostsByCreateTime  // 按创建时间（最新）
        case 'follow':
            return getPostsByFollowing   // 关注的人
        default:
            return getPostList           // 默认列表
    }
})

// 列表请求参数
const listParams = computed(() => {
    const params = {
        currentStudentId: uni.getStorageSync('userInfo')?.studentId // 当前学生ID，用于查询交互状态
    }

    // 分类筛选参数
    if (currentCategory.value === 'all') {
        // 推荐分类：设置 isRecommended = "Y"
        params.isRecommended = "Y"
    } else {
        // 其他分类：映射到后端 type 字段
        const typeMapping = {
            'study': '1',    // 学习
            'life': '2',     // 生活
            'activity': '3', // 活动
            'job': '4',      // 求职
            'food': '5',     // 美食
            'sport': '6',    // 运动
            'tech': '7'      // 技术
        }
        params.type = typeMapping[currentCategory.value]
    }

    // 搜索关键词参数
    if (searchKeyword.value) {
        params.search = searchKeyword.value
    }

    return params
})

onLoad(() => {
    console.log('社区页面加载')
})

// 数据映射函数 - 后端字段转前端格式
const mapPostData = (item) => {
    return {
        id: item.postId,
        studentId: item.studentId, // 保存学生ID，用于关注
        userAvatar: item.studentAvatar || 'https://picsum.photos/100/100?random=' + item.studentId,
        userName: item.studentName || '匿名用户',
        time: formatTime(item.createTime),
        title: item.title,
        detail: item.contentPreview || '',
        images: parseImages(item.images),
        tags: parseTags(item.tags),
        likes: item.likeCount || 0,
        comments: item.commentCount || 0,
        collects: item.collectCount || 0,
        isLiked: item.isLiked || false,
        isCollected: item.isCollected || false,
        isFollowed: item.isFollowed || false
    }
}

// 解析图片字符串 - "url1,url2,url3" -> ["url1", "url2", "url3"]
const parseImages = (imagesStr) => {
    if (!imagesStr) return []
    return imagesStr.split(',').filter(img => img.trim())
}

// 解析标签字符串 - "#学习,#高数,#期末复习" -> ["学习", "高数", "期末复习"]
const parseTags = (tagsStr) => {
    if (!tagsStr) return []
    return tagsStr.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag)
}

// 格式化时间
const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''

    try {
        const date = new Date(dateTimeStr)
        const now = new Date()
        const diff = now - date

        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return '刚刚'
        if (minutes < 60) return `${minutes}分钟前`
        if (hours < 24) return `${hours}小时前`
        if (days < 7) return `${days}天前`

        // 超过7天显示日期
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${month}-${day}`
    } catch (error) {
        return dateTimeStr
    }
}

// 搜索
const searchContent = () => {
    if (searchKeyword.value.trim()) {
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
    // RefreshLoadList 会自动监听 listParams 变化并重新加载
}

// 切换排序
const switchSort = (sortValue) => {
    currentSort.value = sortValue
    // RefreshLoadList 会自动监听 currentApi 和 listParams 变化并重新加载
}

// 查看帖子
const viewPost = (post) => {
    uni.navigateTo({
        url: `/pages/post-detail/post-detail?id=${post.id}`
    })
}

// 关注用户
const followUser = async (post) => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        // 调用关注接口 - 传递所有必需参数
        await followUserApi({
            followerId: userInfo.studentId,                    // 关注者ID（当前用户）
            followeeId: post.studentId,                        // 被关注者ID
            followerName: userInfo.name,                       // 关注者姓名
            followerAvatar: userInfo.avatar || '',             // 关注者头像（可选）
            followeeName: post.userName,                       // 被关注者姓名
            followeeAvatar: post.userAvatar || ''              // 被关注者头像（可选）
        })

        post.isFollowed = true
        uni.showToast({
            title: '已关注 ' + post.userName,
            icon: 'success'
        })
    } catch (error) {
        console.error('关注失败:', error)
        uni.showToast({
            title: '关注失败',
            icon: 'none'
        })
    }
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
const toggleLike = async (post) => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        const isLiking = !post.isLiked

        // 调用点赞/取消点赞接口 - 传递所有必需参数
        if (isLiking) {
            await likePost({
                studentId: userInfo.studentId,           // 当前用户ID
                postId: post.id,                         // 帖子ID
                studentName: userInfo.name,              // 学生姓名
                studentAvatar: userInfo.avatar || ''     // 学生头像（可选）
            })
        } else {
            await unlikePost({
                studentId: userInfo.studentId,           // 当前用户ID
                postId: post.id,                         // 帖子ID
                studentName: userInfo.name,              // 学生姓名
                studentAvatar: userInfo.avatar || ''     // 学生头像（可选）
            })
        }

        // 更新本地状态
        post.isLiked = isLiking
        post.likes += isLiking ? 1 : -1

        uni.showToast({
            title: isLiking ? '已点赞' : '取消点赞',
            icon: 'none'
        })
    } catch (error) {
        console.error('点赞操作失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    }
}

// 查看评论
const viewComments = (post) => {
    uni.showToast({
        title: '查看评论',
        icon: 'none'
    })
}

// 收藏
const collectPost = async (post) => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        const isCollecting = !post.isCollected

        // 调用收藏/取消收藏接口 - 传递所有必需参数
        if (isCollecting) {
            await collectPostApi({
                studentId: userInfo.studentId,      // 当前用户ID
                postId: post.id,                    // 帖子ID
                studentName: userInfo.name          // 学生姓名
            })
        } else {
            await uncollectPost({
                studentId: userInfo.studentId,      // 当前用户ID
                postId: post.id,                    // 帖子ID
                studentName: userInfo.name          // 学生姓名
            })
        }

        // 更新本地状态
        post.isCollected = isCollecting
        post.collects += isCollecting ? 1 : -1

        uni.showToast({
            title: isCollecting ? '已收藏' : '取消收藏',
            icon: 'none'
        })
    } catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    }
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

/* 列表容器 */
.list-container {
    height: calc(100vh - 180rpx); // 减去顶部栏(88rpx) + 分类导航(80rpx) + 排序栏(约60rpx)
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

.empty-action {
    margin-top: 20rpx;
    padding: 16rpx 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
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

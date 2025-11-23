<template>
    <view class="page">
        <view class="post-detail-container">
            <!-- 加载中 -->
            <view class="loading" v-if="loading">
                <text class="loading-text">加载中...</text>
            </view>

            <!-- 帖子内容 -->
            <view class="post-card" v-else-if="post">
                <!-- 用户信息 -->
                <view class="user-header">
                    <image class="avatar" :src="post.studentAvatar || defaultAvatar" mode="aspectFill"></image>
                    <view class="user-info">
                        <text class="username">{{ post.studentName || '匿名用户' }}</text>
                        <text class="time">{{ formatTime(post.createTime) }}</text>
                    </view>
                    <view class="follow-btn" v-if="!isFollowed && post.studentId !== currentUserId" @tap="toggleFollow">
                        <text class="follow-text">+ 关注</text>
                    </view>
                    <view class="followed-btn" v-else-if="isFollowed" @tap="toggleFollow">
                        <text class="followed-text">✓ 已关注</text>
                    </view>
                    <view class="delete-btn" v-if="post.studentId === currentUserId" @tap="deletePost">
                        <text class="delete-text">🗑️</text>
                    </view>
                </view>

                <!-- 帖子标题 -->
                <text class="post-title" v-if="post.title">{{ post.title }}</text>

                <!-- 帖子内容 -->
                <rich-text class="post-content" :nodes="formattedContent"></rich-text>

                <!-- 图片 -->
                <view class="images-grid" v-if="postImages.length > 0" :class="'grid-' + postImages.length">
                    <image class="post-image" v-for="(img, index) in postImages" :key="index" :src="img"
                        mode="aspectFill" @tap="previewImage(index)"></image>
                </view>

                <!-- 标签 -->
                <view class="tags" v-if="postTags.length > 0">
                    <text class="tag" v-for="(tag, index) in postTags" :key="index">#{{ tag }}</text>
                </view>

                <!-- 互动栏 -->
                <view class="action-bar">
                    <view class="action-item" @tap="toggleLike">
                        <text class="icon" :class="{ active: isLiked }">{{ isLiked ? '❤️' : '🤍' }}</text>
                        <text class="text" :class="{ active: isLiked }">{{ post.likeCount || 0 }}</text>
                    </view>
                    <view class="action-item">
                        <text class="icon">💬</text>
                        <text class="text">{{ post.commentCount || 0 }}</text>
                    </view>
                    <view class="action-item" @tap="toggleCollect">
                        <text class="icon" :class="{ active: isCollected }">{{ isCollected ? '⭐' : '☆' }}</text>
                        <text class="text" :class="{ active: isCollected }">{{ post.collectCount || 0 }}</text>
                    </view>

                </view>
            </view>

            <!-- 评论区 -->
            <view class="comments-section" v-if="!loading">
                <view class="section-title">
                    <text class="title-text">评论 {{ comments.length }}</text>
                </view>

                <!-- 评论列表 -->
                <view class="comment-list">
                    <!-- 一级评论 -->
                    <view class="comment-item" v-for="comment in topLevelComments" :key="comment.commentId">
                        <image class="comment-avatar" :src="comment.studentAvatar || defaultAvatar" mode="aspectFill">
                        </image>
                        <view class="comment-content">
                            <view class="comment-header">
                                <text class="comment-username">{{ comment.studentName || '匿名用户' }}</text>
                            </view>
                            <text class="comment-text">{{ comment.content }}</text>
                            <view class="comment-footer">
                                <text class="comment-time">{{ formatTime(comment.createTime) }}</text>
                                <view class="comment-actions">
                                    <view class="comment-action" @tap="likeComment(comment)">
                                        <text class="action-icon">🤍</text>
                                        <text class="action-count">{{ comment.likeCount || 0 }}</text>
                                    </view>
                                    <view class="comment-action" @tap="replyComment(comment)">
                                        <text class="action-icon">💬</text>
                                        <text class="action-text">回复</text>
                                    </view>
                                    <view class="comment-action" v-if="comment.studentId === currentUserId"
                                        @tap="deleteComment(comment)">
                                        <text class="action-icon">🗑️</text>
                                        <text class="action-text">删除</text>
                                    </view>
                                </view>
                            </view>

                            <!-- 二级回复列表 -->
                            <view class="reply-list" v-if="getReplies(comment.commentId).length > 0">
                                <view class="reply-item-wrapper" v-for="reply in getReplies(comment.commentId)"
                                    :key="reply.commentId">
                                    <view class="reply-item" @tap="replyToReply(reply, comment)">
                                        <text class="reply-user">{{ reply.studentName }}</text>
                                        <text class="reply-arrow" v-if="reply.replyToName"> 回复 </text>
                                        <text class="reply-target" v-if="reply.replyToName">{{ reply.replyToName
                                        }}</text>
                                        <text class="reply-content">{{ reply.replyToName ? ': ' : '' }}{{ reply.content
                                        }}</text>
                                    </view>
                                    <view class="reply-delete" v-if="reply.studentId === currentUserId"
                                        @tap.stop="deleteComment(reply)">
                                        <text class="delete-icon">🗑️</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view class="empty-comments" v-if="comments.length === 0">
                    <text class="empty-icon">💬</text>
                    <text class="empty-text">暂无评论，快来抢沙发~</text>
                </view>
            </view>
        </view>

        <!-- 底部评论输入框 -->
        <view class="comment-input-container">
            <!-- 回复提示条 -->
            <view class="reply-hint" v-if="replyTarget">
                <text class="reply-hint-text">回复 @{{ replyTarget.userName }}</text>
                <text class="cancel-reply" @tap="cancelReply">✕</text>
            </view>

            <view class="comment-input-bar">
                <input class="comment-input" :placeholder="replyTarget ? '说点什么...' : '说点什么...'" v-model="commentText"
                    @focus="onInputFocus" />
                <view class="send-btn" @tap="sendComment" :class="{ active: commentText.trim() }">
                    <text class="send-text">发送</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
    getPostDetail,
    likePost,
    unlikePost,
    collectPost as collectPostApi,
    uncollectPost,
    followUser as followUserApi,
    unfollowUser,
    deleteOwnPost,
    deleteOwnComment
} from '@/api/community'
import {
    commentPost,
    replyComment as replyCommentApi
} from '@/api/community'
import { formatRichText } from '@/utils/richtext'

const postId = ref(null)
const loading = ref(true)
const post = ref(null)
const comments = ref([])
const commentText = ref('')
const replyTarget = ref(null) // { type: 'comment' | 'reply', commentId, userName, parentCommentId, replyToId }

const defaultAvatar = 'https://picsum.photos/100/100?random=user'
const currentUserId = ref(null)

// 交互状态
const isFollowed = ref(false)
const isLiked = ref(false)
const isCollected = ref(false)

// 格式化富文本内容
const formattedContent = computed(() => {
    if (!post.value || !post.value.content) return ''
    return formatRichText(post.value.content)
})

// 解析图片
const postImages = computed(() => {
    if (!post.value || !post.value.images) return []
    if (typeof post.value.images === 'string') {
        return post.value.images.split(',').filter(img => img.trim())
    }
    return post.value.images
})

// 解析标签
const postTags = computed(() => {
    if (!post.value || !post.value.tags) return []
    if (typeof post.value.tags === 'string') {
        return post.value.tags.split(',').map(tag => tag.trim().replace('#', '')).filter(tag => tag)
    }
    return post.value.tags
})

// 顶级评论（parentId为null的评论）
const topLevelComments = computed(() => {
    return comments.value.filter(c => !c.parentId)
})

// 获取某个评论的回复
const getReplies = (commentId) => {
    return comments.value.filter(c => c.parentId === commentId)
}

onLoad((options) => {
    postId.value = options.id
    console.log('帖子详情页加载, ID:', postId.value)

    // 获取当前用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo && userInfo.studentId) {
        currentUserId.value = userInfo.studentId
    }

    // 加载帖子详情
    loadPostDetail()
})

// 加载帖子详情
const loadPostDetail = async () => {
    try {
        loading.value = true
        const userInfo = uni.getStorageSync('userInfo')
        const params = {}
        if (userInfo && userInfo.studentId) {
            params.currentStudentId = userInfo.studentId
        }

        // 调用详情接口
        const response = await getPostDetail(postId.value + (params.currentStudentId ? `?currentStudentId=${params.currentStudentId}` : ''))

        if (response && response.post) {
            post.value = response.post
            comments.value = response.comments || []
            isFollowed.value = response.isFollowed || false
            isLiked.value = response.isLiked || false
            isCollected.value = response.isCollected || false
        }
    } catch (error) {
        console.error('加载帖子详情失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
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

// 切换关注状态
const toggleFollow = async () => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        if (post.value.studentId === userInfo.studentId) {
            uni.showToast({
                title: '不能关注自己',
                icon: 'none'
            })
            return
        }

        const isFollowing = !isFollowed.value

        if (isFollowing) {
            // 关注
            await followUserApi({
                followerId: userInfo.studentId,
                followeeId: post.value.studentId,
                followerName: userInfo.name,
                followerAvatar: userInfo.avatar || '',
                followeeName: post.value.studentName,
                followeeAvatar: post.value.studentAvatar || '',
                studentId: userInfo.studentId
            })
        } else {
            // 取消关注
            await unfollowUser({
                followerId: userInfo.studentId,
                followeeId: post.value.studentId,
                studentId: userInfo.studentId
            })
        }

        isFollowed.value = isFollowing
        uni.showToast({
            title: isFollowing ? '已关注' : '已取消关注',
            icon: 'success'
        })
    } catch (error) {
        console.error('关注操作失败:', error)
        uni.showToast({
            title: '操作失败',
            icon: 'none'
        })
    }
}

// 点赞
const toggleLike = async () => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        if (post.value.studentId === userInfo.studentId) {
            uni.showToast({
                title: '不能给自己点赞',
                icon: 'none'
            })
            return
        }

        const isLiking = !isLiked.value

        if (isLiking) {
            await likePost({
                studentId: userInfo.studentId,
                postId: post.value.postId,
                studentName: userInfo.name,
                studentAvatar: userInfo.avatar || ''
            })
        } else {
            await unlikePost({
                studentId: userInfo.studentId,
                postId: post.value.postId,
                studentName: userInfo.name,
                studentAvatar: userInfo.avatar || ''
            })
        }

        isLiked.value = isLiking
        post.value.likeCount += isLiking ? 1 : -1

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

// 收藏
const toggleCollect = async () => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        if (post.value.studentId === userInfo.studentId) {
            uni.showToast({
                title: '不能收藏自己的帖子',
                icon: 'none'
            })
            return
        }

        const isCollecting = !isCollected.value

        if (isCollecting) {
            await collectPostApi({
                studentId: userInfo.studentId,
                postId: post.value.postId,
                studentName: userInfo.name
            })
        } else {
            await uncollectPost({
                studentId: userInfo.studentId,
                postId: post.value.postId,
                studentName: userInfo.name
            })
        }

        isCollected.value = isCollecting
        post.value.collectCount += isCollecting ? 1 : -1

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

// 预览图片
const previewImage = (index) => {
    uni.previewImage({
        urls: postImages.value,
        current: index
    })
}

// 分享
const share = () => {
    uni.showShareMenu({
        title: post.value.title || '分享帖子',
        path: `/pages/post-detail/post-detail?id=${postId.value}`
    })
}

// 回复评论
const replyComment = (comment) => {
    replyTarget.value = {
        type: 'comment',
        commentId: comment.commentId,
        userName: comment.studentName,
        parentCommentId: comment.commentId,
        replyToId: comment.studentId
    }
}

// 回复回复
const replyToReply = (reply, parentComment) => {
    replyTarget.value = {
        type: 'reply',
        commentId: reply.commentId,
        userName: reply.studentName,
        parentCommentId: parentComment.commentId,
        replyToId: reply.studentId
    }
}

// 取消回复
const cancelReply = () => {
    replyTarget.value = null
}

// 输入框获取焦点
const onInputFocus = () => {
    // 可以在这里处理焦点事件
}

// 发送评论
const sendComment = async () => {
    if (!commentText.value.trim()) {
        uni.showToast({
            title: '请输入评论内容',
            icon: 'none'
        })
        return
    }

    try {
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        if (replyTarget.value) {
            // 回复评论
            await replyCommentApi({
                studentId: userInfo.studentId,
                postId: post.value.postId,
                parentId: replyTarget.value.parentCommentId,
                replyToId: replyTarget.value.replyToId,
                replyToName: replyTarget.value.userName,
                content: commentText.value,
                studentName: userInfo.name,
                studentAvatar: userInfo.avatar || ''
            })
        } else {
            // 直接评论帖子
            await commentPost({
                studentId: userInfo.studentId,
                postId: post.value.postId,
                content: commentText.value,
                studentName: userInfo.name,
                studentAvatar: userInfo.avatar || ''
            })
        }

        uni.showToast({
            title: '评论成功',
            icon: 'success'
        })

        // 清空输入框和回复目标
        commentText.value = ''
        replyTarget.value = null

        // 重新加载评论列表
        loadPostDetail()
    } catch (error) {
        console.error('发送评论失败:', error)
        uni.showToast({
            title: error.message || '发送评论失败',
            icon: 'none'
        })
    }
}

// 点赞评论（TODO: 需要后端接口支持）
const likeComment = (comment) => {
    uni.showToast({
        title: '功能开发中',
        icon: 'none'
    })
}

// 删除帖子
const deletePost = async () => {
    try {
        const result = await uni.showModal({
            title: '确认删除',
            content: '确定要删除这条帖子吗？删除后无法恢复',
            confirmText: '删除',
            confirmColor: '#ff4444'
        })

        if (!result.confirm) {
            return
        }

        uni.showLoading({
            title: '删除中...'
        })

        const userInfo = uni.getStorageSync('userInfo')
        await deleteOwnPost({
            postId: post.value.postId,
            studentId: userInfo.studentId
        })

        uni.hideLoading()
        uni.showToast({
            title: '删除成功',
            icon: 'success'
        })

        // 延迟返回上一页,并传递刷新标识
        setTimeout(() => {
            uni.navigateBack({
                delta: 1,
                success: () => {
                    // 通过事件总线通知上一页刷新
                    uni.$emit('refreshPostList')
                }
            })
        }, 1500)
    } catch (error) {
        uni.hideLoading()
        console.error('删除帖子失败:', error)
        uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
        })
    }
}

// 删除评论
const deleteComment = async (comment) => {
    try {
        const result = await uni.showModal({
            title: '确认删除',
            content: '确定要删除这条评论吗？删除后无法恢复',
            confirmText: '删除',
            confirmColor: '#ff4444'
        })

        if (!result.confirm) {
            return
        }

        uni.showLoading({
            title: '删除中...'
        })

        const userInfo = uni.getStorageSync('userInfo')
        await deleteOwnComment({
            commentId: comment.commentId,
            studentId: userInfo.studentId
        })

        uni.hideLoading()
        uni.showToast({
            title: '删除成功',
            icon: 'success'
        })

        // 重新加载帖子详情（包含评论）
        loadPostDetail()
    } catch (error) {
        uni.hideLoading()
        console.error('删除评论失败:', error)
        uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
        })
    }
}
</script>

<style scoped lang="scss">
.post-detail-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 120rpx;
}

.loading {
    padding: 100rpx 0;
    text-align: center;

    .loading-text {
        font-size: 28rpx;
        color: #999;
    }
}

/* 帖子卡片 */
.post-card {
    background-color: #fff;
    padding: 32rpx;
    margin-bottom: 20rpx;
}

.user-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.username {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.time {
    font-size: 24rpx;
    color: #999;
}

.follow-btn,
.followed-btn {
    padding: 12rpx 32rpx;
    border-radius: 40rpx;
}

.follow-btn {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);

    .follow-text {
        color: #fff;
        font-size: 24rpx;
    }
}

.followed-btn {
    background: #f0f0f0;

    .followed-text {
        color: #999;
        font-size: 24rpx;
    }
}

.post-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
    line-height: 1.5;
}

.post-content {
    font-size: 30rpx;
    color: #666;
    line-height: 1.8;
    display: block;
    margin-bottom: 24rpx;
    white-space: pre-wrap;
}

.images-grid {
    display: grid;
    gap: 12rpx;
    margin-bottom: 24rpx;

    &.grid-1 {
        grid-template-columns: 2fr 1fr;

        .post-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            border-radius: 12rpx;
        }
    }

    &.grid-2,
    &.grid-4 {
        grid-template-columns: 1fr 1fr;

        .post-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            border-radius: 12rpx;
        }
    }

    &.grid-3,
    &.grid-5,
    &.grid-6,
    &.grid-7,
    &.grid-8,
    &.grid-9 {
        grid-template-columns: 1fr 1fr 1fr;

        .post-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            border-radius: 12rpx;
        }
    }
}

.post-image {
    width: 100%;
    object-fit: cover;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;
}

.tag {
    font-size: 24rpx;
    color: #667eea;
    background-color: #f0f4ff;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    border: 1rpx solid #d4e0ff;
}

.action-bar {
    display: flex;
    justify-content: space-around;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;

    .icon {
        font-size: 32rpx;

        &.active {
            animation: heartbeat 0.6s;
        }
    }

    .text {
        font-size: 24rpx;
        color: #999;

        &.active {
            color: #667eea;
            font-weight: bold;
        }
    }
}

@keyframes heartbeat {

    0%,
    100% {
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
}

/* 评论区 */
.comments-section {
    background-color: #fff;
    padding: 32rpx;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;

    .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
    }
}

.comment-list {
    .comment-item {
        display: flex;
        gap: 20rpx;
        margin-bottom: 32rpx;
    }

    .comment-avatar {
        width: 72rpx;
        height: 72rpx;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .comment-content {
        flex: 1;
    }

    .comment-header {
        margin-bottom: 12rpx;
    }

    .comment-username {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
    }

    .comment-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        display: block;
        margin-bottom: 12rpx;
    }

    .comment-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .comment-time {
        font-size: 24rpx;
        color: #999;
    }

    .comment-actions {
        display: flex;
        gap: 32rpx;
    }

    .comment-action {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .action-icon {
            font-size: 28rpx;
        }

        .action-count,
        .action-text {
            font-size: 24rpx;
            color: #999;
        }
    }
}

.reply-list {
    background-color: #f8f8f8;
    border-radius: 12rpx;
    padding: 16rpx;
    margin-top: 16rpx;

    .reply-item {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 12rpx;

        &:last-child {
            margin-bottom: 0;
        }

        .reply-user,
        .reply-target {
            color: #667eea;
        }

        .reply-arrow {
            color: #999;
        }
    }
}

.empty-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    gap: 16rpx;

    .empty-icon {
        font-size: 120rpx;
        opacity: 0.5;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}

/* 底部评论输入框 */
.comment-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-top: 1rpx solid #e0e0e0;
    z-index: 100;
}

.reply-hint {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 32rpx;
    background-color: #f8f8f8;
    border-bottom: 1rpx solid #e0e0e0;

    .reply-hint-text {
        font-size: 24rpx;
        color: #667eea;
    }

    .cancel-reply {
        font-size: 32rpx;
        color: #999;
        padding: 0 8rpx;
    }
}

.comment-input-bar {
    display: flex;
    align-items: center;
    padding: 16rpx 32rpx;
    gap: 16rpx;
}

.comment-input {
    flex: 1;
    height: 64rpx;
    padding: 0 20rpx;
    background-color: #f5f5f5;
    border-radius: 32rpx;
    font-size: 28rpx;
}

.send-btn {
    padding: 12rpx 32rpx;
    background-color: #f0f0f0;
    border-radius: 32rpx;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);

        .send-text {
            color: #fff;
        }
    }

    .send-text {
        font-size: 28rpx;
        color: #999;
    }
}
</style>

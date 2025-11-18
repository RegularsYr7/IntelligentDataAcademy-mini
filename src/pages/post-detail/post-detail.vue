<template>
    <view class="page">
        <view class="post-detail-container">
            <!-- 帖子内容 -->
            <view class="post-card">
                <!-- 用户信息 -->
                <view class="user-header">
                    <image class="avatar" :src="post.userAvatar" mode="aspectFill"></image>
                    <view class="user-info">
                        <view class="name-row">
                            <text class="username">{{ post.userName }}</text>
                            <view class="badge" v-if="post.userBadge">
                                <text class="badge-text">{{ post.userBadge }}</text>
                            </view>
                        </view>
                        <text class="time">{{ post.time }}</text>
                    </view>
                    <view class="follow-btn" v-if="!post.isFollowed" @tap="followUser">
                        <text class="follow-text">+ 关注</text>
                    </view>
                    <view class="followed-btn" v-else>
                        <text class="followed-text">已关注</text>
                    </view>
                </view>

                <!-- 帖子标题 -->
                <text class="post-title">{{ post.title }}</text>

                <!-- 帖子内容 -->
                <text class="post-content">{{ post.content }}</text>

                <!-- 图片 -->
                <view class="images-grid" v-if="post.images && post.images.length > 0"
                    :class="'grid-' + post.images.length">
                    <image class="post-image" v-for="(img, index) in post.images" :key="index" :src="img"
                        mode="aspectFill" @tap="previewImage(index)"></image>
                </view>

                <!-- 标签 -->
                <view class="tags" v-if="post.tags && post.tags.length > 0">
                    <text class="tag" v-for="(tag, index) in post.tags" :key="index">#{{ tag }}</text>
                </view>

                <!-- 互动栏 -->
                <view class="action-bar">
                    <view class="action-item" @tap="toggleLike">
                        <text class="icon" :class="{ active: post.isLiked }">{{ post.isLiked ? '❤️' : '🤍' }}</text>
                        <text class="text" :class="{ active: post.isLiked }">{{ post.likes }}</text>
                    </view>
                    <view class="action-item">
                        <text class="icon">💬</text>
                        <text class="text">{{ post.comments }}</text>
                    </view>
                    <view class="action-item" @tap="toggleCollect">
                        <text class="icon" :class="{ active: post.isCollected }">{{ post.isCollected ? '⭐' : '☆'
                        }}</text>
                        <text class="text" :class="{ active: post.isCollected }">{{ post.collects }}</text>
                    </view>
                    <view class="action-item" @tap="share">
                        <text class="icon">📤</text>
                        <text class="text">分享</text>
                    </view>
                </view>
            </view>

            <!-- 评论区 -->
            <view class="comments-section">
                <view class="section-title">
                    <text class="title-text">评论 {{ commentList.length }}</text>
                    <view class="sort-btn" @tap="switchSort">
                        <text class="sort-text">{{ sortType === 'hot' ? '热门' : '最新' }}</text>
                        <text class="sort-icon">▼</text>
                    </view>
                </view>

                <!-- 评论列表 -->
                <view class="comment-list">
                    <view class="comment-item" v-for="(comment, index) in commentList" :key="index">
                        <image class="comment-avatar" :src="comment.userAvatar" mode="aspectFill"></image>
                        <view class="comment-content">
                            <view class="comment-header">
                                <text class="comment-username">{{ comment.userName }}</text>
                                <view class="comment-badge" v-if="comment.userBadge">
                                    <text class="badge-text">{{ comment.userBadge }}</text>
                                </view>
                            </view>
                            <text class="comment-text">{{ comment.content }}</text>
                            <view class="comment-footer">
                                <text class="comment-time">{{ comment.time }}</text>
                                <view class="comment-actions">
                                    <view class="comment-action" @tap="likeComment(comment)">
                                        <text class="action-icon" :class="{ active: comment.isLiked }">{{
                                            comment.isLiked ? '❤️' : '🤍' }}</text>
                                        <text class="action-count" :class="{ active: comment.isLiked }">{{
                                            comment.likes }}</text>
                                    </view>
                                    <view class="comment-action" @tap="replyComment(comment)">
                                        <text class="action-icon">💬</text>
                                        <text class="action-text">回复</text>
                                    </view>
                                </view>
                            </view>

                            <!-- 回复列表 -->
                            <view class="reply-list" v-if="comment.replies && comment.replies.length > 0">
                                <view class="reply-item" v-for="(reply, idx) in comment.replies" :key="idx"
                                    @tap="replyToReply(reply, comment)">
                                    <text class="reply-user">{{ reply.userName }}</text>
                                    <text class="reply-arrow"> 回复 </text>
                                    <text class="reply-target">{{ reply.targetUser }}</text>
                                    <text class="reply-content">: {{ reply.content }}</text>
                                </view>
                                <view class="view-more-replies" v-if="comment.replyCount > comment.replies.length"
                                    @tap.stop="viewMoreReplies(comment)">
                                    <text class="more-text">查看更多 {{ comment.replyCount - comment.replies.length }}
                                        条回复</text>
                                    <text class="arrow">→</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view class="empty-comments" v-if="commentList.length === 0">
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
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const sortType = ref('hot')
const commentText = ref('')
// 存储每个评论的展开状态
const expandedComments = ref({})
// 存储每个评论的加载状态,用于防抖
const loadingComments = ref({})
// 当前回复的目标
const replyTarget = ref(null) // { type: 'comment' | 'reply', commentId, userName, parentCommentId }

// 帖子数据
const post = ref({
    id: 1,
    userAvatar: 'https://picsum.photos/100/100?random=31',
    userName: '学习委员',
    userBadge: '学霸',
    time: '10分钟前',
    title: '高数期末复习重点整理，学弟学妹们快来看!',
    content: '马上期末考试了，整理了一份高数的重点知识点和常考题型，希望能帮到大家。\n\n重点章节包括:\n1. 极限与连续 - 重点掌握洛必达法则\n2. 导数与微分 - 常考隐函数求导\n3. 不定积分 - 分部积分法和换元法\n4. 定积分应用 - 面积体积计算\n5. 微分方程 - 一阶线性微分方程\n\n每个章节我都整理了典型例题和易错点，有需要的同学可以私信我获取完整资料。祝大家考试顺利！💪',
    images: [
        'https://picsum.photos/400/300?random=41',
        'https://picsum.photos/400/300?random=42',
        'https://picsum.photos/400/300?random=43'
    ],
    tags: ['学习', '高数', '期末复习'],
    likes: 328,
    comments: 56,
    collects: 189,
    isLiked: false,
    isCollected: false,
    isFollowed: false
})

// 评论列表
const commentList = ref([
    {
        id: 1,
        userAvatar: 'https://picsum.photos/100/100?random=61',
        userName: '大一萌新',
        userBadge: '',
        content: '太有用了！正好明天考高数，感谢学长的整理！',
        time: '5分钟前',
        likes: 23,
        isLiked: false,
        replies: [
            {
                userName: '学习委员',
                targetUser: '大一萌新',
                content: '加油！相信你一定能考好的~'
            }
        ],
        replyCount: 4
    },
    {
        id: 2,
        userAvatar: 'https://picsum.photos/100/100?random=62',
        userName: '数学苦手',
        content: '收藏了！微分方程那块一直不太懂，能详细讲讲吗？',
        time: '8分钟前',
        likes: 15,
        isLiked: true,
        replies: [
            {
                userName: '学习委员',
                targetUser: '数学苦手',
                content: '可以的，我待会整理一份详细的笔记发给你'
            },
            {
                userName: '路过的学霸',
                targetUser: '数学苦手',
                content: '微分方程要多做题，掌握解题套路就好了'
            }
        ],
        replyCount: 5
    },
    {
        id: 3,
        userAvatar: 'https://picsum.photos/100/100?random=63',
        userName: '考研人',
        userBadge: '研究生',
        content: '整理得很好！当年我考研的时候也是这样复习的，祝学弟学妹们顺利通过考试',
        time: '15分钟前',
        likes: 45,
        isLiked: false,
        replies: [],
        replyCount: 0
    },
    {
        id: 4,
        userAvatar: 'https://picsum.photos/100/100?random=64',
        userName: '学习打卡',
        content: '马克！期末复习资料库又多了一份宝藏',
        time: '20分钟前',
        likes: 8,
        isLiked: false,
        replies: [],
        replyCount: 0
    }
])

onLoad((options) => {
    // 可以通过路由参数获取帖子ID
    const postId = options.id
    console.log('帖子详情页加载', postId)

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【帖子详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取帖子详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/posts/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            title: '如何学好数据分析?',
            content: '最近在学习数据分析...',
            images: ['https://example.com/img1.jpg'],
            author: {
                id: 1,
                name: '张三',
                avatar: 'https://example.com/avatar.jpg',
                level: 5,
                badge: '数据达人'
            },
            likeCount: 128,
            commentCount: 45,
            viewCount: 1205,
            favoriteCount: 32,
            isLiked: false,
            isFavorited: false,
            isFollowed: false, // 是否关注作者
            createTime: '2024-11-01 10:30',
            tags: ['数据分析', '学习']
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 获取评论列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/posts/:id/comments')
    console.log('请求参数:')
    console.log(JSON.stringify({
        postId: 1,
        sortType: 'hot', // hot | latest
        page: 1,
        pageSize: 20
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            list: [
                {
                    id: 1,
                    content: '写得很好,学习了!',
                    author: {
                        id: 2,
                        name: '李四',
                        avatar: 'https://example.com/avatar2.jpg'
                    },
                    likeCount: 15,
                    isLiked: false,
                    createTime: '2024-11-01 11:20',
                    replies: [] // 回复列表(可选)
                }
            ],
            total: 45
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口3: 发表评论')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/posts/:id/comments')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        content: '评论内容',
        replyToId: null // 回复某条评论的ID,没有则为null
    }, null, 2))
    console.log('\n')

    console.log('📍 接口4: 点赞/取消点赞帖子')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/posts/:id/like 或 /api/posts/:id/unlike')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📍 接口5: 收藏/取消收藏帖子')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/posts/:id/favorite 或 /api/posts/:id/unfavorite')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📍 接口6: 关注/取消关注作者')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/users/:id/follow 或 /api/users/:id/unfollow')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 关注用户
const followUser = () => {
    post.value.isFollowed = true
    uni.showToast({
        title: '已关注',
        icon: 'success'
    })
}

// 预览图片
const previewImage = (index) => {
    uni.previewImage({
        urls: post.value.images,
        current: index
    })
}

// 点赞
const toggleLike = () => {
    post.value.isLiked = !post.value.isLiked
    post.value.likes += post.value.isLiked ? 1 : -1
    uni.showToast({
        title: post.value.isLiked ? '已点赞' : '取消点赞',
        icon: 'none'
    })
}

// 收藏
const toggleCollect = () => {
    post.value.isCollected = !post.value.isCollected
    post.value.collects += post.value.isCollected ? 1 : -1
    uni.showToast({
        title: post.value.isCollected ? '已收藏' : '取消收藏',
        icon: 'none'
    })
}

// 分享
const share = () => {
    uni.showShareMenu({
        title: post.value.title
    })
}

// 切换排序
const switchSort = () => {
    sortType.value = sortType.value === 'hot' ? 'latest' : 'hot'
    uni.showToast({
        title: sortType.value === 'hot' ? '按热门排序' : '按最新排序',
        icon: 'none'
    })
}

// 点赞评论
const likeComment = (comment) => {
    comment.isLiked = !comment.isLiked
    comment.likes += comment.isLiked ? 1 : -1
}

// 回复评论（一级评论）
const replyComment = (comment) => {
    replyTarget.value = {
        type: 'comment',
        commentId: comment.id,
        userName: comment.userName,
        parentCommentId: comment.id
    }
    commentText.value = `回复 @${comment.userName}: `
    uni.showToast({
        title: '回复 ' + comment.userName,
        icon: 'none'
    })
}

// 回复二级评论
const replyToReply = (reply, parentComment) => {
    replyTarget.value = {
        type: 'reply',
        commentId: reply.id || Date.now(), // 如果reply没有id，生成一个临时id
        userName: reply.userName,
        parentCommentId: parentComment.id
    }
    commentText.value = `回复 @${reply.userName}: `
    uni.showToast({
        title: '回复 ' + reply.userName,
        icon: 'none'
    })
}

// 查看更多回复
const viewMoreReplies = (comment) => {
    // 防抖检查:如果正在加载或已经加载过,直接返回
    if (loadingComments.value[comment.id] || expandedComments.value[comment.id]) {
        if (loadingComments.value[comment.id]) {
            uni.showToast({
                title: '正在加载中...',
                icon: 'none',
                duration: 1000
            })
        }
        return
    }

    // 标记为加载中
    loadingComments.value[comment.id] = true

    uni.showLoading({
        title: '加载中...'
    })

    // 模拟网络延迟
    setTimeout(() => {
        // 模拟加载更多回复数据
        const moreReplies = []
        const currentCount = comment.replies.length
        const totalCount = comment.replyCount

        // 生成剩余的回复(这里模拟数据,实际应该从服务器获取)
        const replyContents = [
            '说得对，我也是这么认为的',
            '感谢分享，太实用了！',
            '请问可以发一份资料给我吗？',
            '同求！已经关注了',
            '马克一下,期末要用',
            '这个知识点我也经常忘',
            '建议整理成PDF方便保存'
        ]

        for (let i = currentCount; i < totalCount; i++) {
            moreReplies.push({
                userName: `热心网友${i - currentCount + 1}`,
                targetUser: i % 2 === 0 ? comment.userName : comment.replies[0].userName,
                content: replyContents[(i - currentCount) % replyContents.length]
            })
        }

        // 将新加载的回复添加到当前评论的replies中
        comment.replies.push(...moreReplies)

        // 标记该评论已展开
        expandedComments.value[comment.id] = true
        // 取消加载状态
        loadingComments.value[comment.id] = false

        uni.hideLoading()
        uni.showToast({
            title: `已加载${moreReplies.length}条回复`,
            icon: 'success',
            duration: 1500
        })
    }, 500)
}

// 输入框获得焦点
const onInputFocus = () => {
    console.log('输入框获得焦点')
}

// 取消回复
const cancelReply = () => {
    replyTarget.value = null
    commentText.value = ''
    uni.showToast({
        title: '已取消回复',
        icon: 'none',
        duration: 1000
    })
}

// 发送评论
const sendComment = () => {
    if (!commentText.value.trim()) {
        return
    }

    // 如果是回复某条评论或回复
    if (replyTarget.value) {
        // 找到父级评论（一级评论）
        const parentComment = commentList.value.find(c => c.id === replyTarget.value.parentCommentId)

        if (parentComment) {
            // 创建新的回复
            const newReply = {
                userName: '我',
                targetUser: replyTarget.value.userName,
                content: commentText.value.replace(/^回复 @.*?: /, '') // 移除"回复 @xxx: "前缀
            }

            // 将回复添加到父级评论的replies数组
            if (!parentComment.replies) {
                parentComment.replies = []
            }
            parentComment.replies.push(newReply)
            parentComment.replyCount = (parentComment.replyCount || 0) + 1

            // 总评论数+1
            post.value.comments += 1

            uni.showToast({
                title: '回复成功',
                icon: 'success'
            })
        }

        // 清空回复目标
        replyTarget.value = null
    } else {
        // 发表新的一级评论
        const newComment = {
            id: commentList.value.length + 1,
            userAvatar: 'https://picsum.photos/100/100?random=99',
            userName: '我',
            content: commentText.value,
            time: '刚刚',
            likes: 0,
            isLiked: false,
            replies: [],
            replyCount: 0
        }

        commentList.value.unshift(newComment)
        post.value.comments += 1

        uni.showToast({
            title: '评论成功',
            icon: 'success'
        })
    }

    // 清空输入框
    commentText.value = ''
}
</script>

<style scoped lang="scss">
.post-detail-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 120rpx;
}

/* 帖子卡片 */
.post-card {
    background-color: #fff;
    padding: 24rpx;
    margin-bottom: 12rpx;
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
    margin-right: 16rpx;
    border: 2rpx solid #f0f0f0;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.username {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.badge {
    padding: 2rpx 12rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.badge-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: bold;
}

.time {
    font-size: 24rpx;
    color: #999;
}

.follow-btn {
    padding: 10rpx 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.follow-text {
    font-size: 24rpx;
    color: #fff;
}

.followed-btn {
    padding: 10rpx 24rpx;
    background-color: #f5f5f5;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.followed-text {
    font-size: 24rpx;
    color: #999;
}

.post-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.5;
    margin-bottom: 16rpx;
    display: block;
}

.post-content {
    font-size: 30rpx;
    color: #666;
    line-height: 1.8;
    margin-bottom: 20rpx;
    display: block;
    white-space: pre-wrap;
}

/* 图片网格 */
.images-grid {
    display: grid;
    gap: 8rpx;
    margin-bottom: 20rpx;

    &.grid-1 {
        grid-template-columns: 1fr;

        .post-image {
            height: 500rpx;
            border-radius: 12rpx;
        }
    }

    &.grid-2,
    &.grid-4 {
        grid-template-columns: 1fr 1fr;

        .post-image {
            height: 250rpx;
            border-radius: 8rpx;
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
            height: 200rpx;
            border-radius: 8rpx;
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
    margin-bottom: 20rpx;
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
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .icon {
        font-size: 40rpx;

        &.active {
            animation: bounce 0.6s;
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

@keyframes bounce {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.3);
    }

    100% {
        transform: scale(1);
    }
}

/* 评论区 */
.comments-section {
    background-color: #fff;
    padding: 24rpx;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.sort-btn {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 8rpx 16rpx;
    background-color: #f5f5f5;
    border-radius: 20rpx;
}

.sort-text {
    font-size: 24rpx;
    color: #666;
}

.sort-icon {
    font-size: 20rpx;
    color: #999;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.comment-item {
    display: flex;
    gap: 16rpx;
}

.comment-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    flex-shrink: 0;
}

.comment-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.comment-username {
    font-size: 26rpx;
    font-weight: bold;
    color: #333;
}

.comment-badge {
    padding: 2rpx 8rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.comment-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
}

.comment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4rpx;
}

.comment-time {
    font-size: 22rpx;
    color: #999;
}

.comment-actions {
    display: flex;
    gap: 24rpx;
}

.comment-action {
    display: flex;
    align-items: center;
    gap: 4rpx;

    .action-icon {
        font-size: 28rpx;

        &.active {
            animation: pulse 0.3s;
        }
    }

    .action-count {
        font-size: 22rpx;
        color: #999;

        &.active {
            color: #667eea;
        }
    }

    .action-text {
        font-size: 22rpx;
        color: #999;
    }
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.2);
    }

    100% {
        transform: scale(1);
    }
}

/* 回复列表 */
.reply-list {
    margin-top: 12rpx;
    padding: 16rpx;
    background-color: #f8f8f8;
    border-radius: 8rpx;
}

.reply-item {
    font-size: 26rpx;
    line-height: 1.6;
    margin-bottom: 8rpx;
    padding: 8rpx;
    border-radius: 6rpx;
    transition: background-color 0.2s;
    cursor: pointer;

    &:active {
        background-color: #f0f0f0;
    }

    &:last-child {
        margin-bottom: 0;
    }

    .reply-user {
        color: #666;
        font-weight: bold;
    }

    .reply-arrow {
        color: #999;
    }

    .reply-target {
        color: #666;
        font-weight: bold;
    }

    .reply-content {
        color: #666;
    }
}

.view-more-replies {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding-top: 8rpx;
    margin-top: 8rpx;
    border-top: 1rpx solid #e8e8e8;
    cursor: pointer;
    transition: all 0.3s;

    &:active {
        opacity: 0.6;
        transform: scale(0.98);
    }

    .more-text {
        font-size: 24rpx;
        color: #667eea;
        font-weight: 500;
    }

    .arrow {
        font-size: 20rpx;
        color: #667eea;
        animation: bounce 1s infinite;
    }
}

@keyframes bounce {

    0%,
    100% {
        transform: translateX(0);
    }

    50% {
        transform: translateX(4rpx);
    }
}

/* 空评论 */
.empty-comments {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
    gap: 16rpx;

    .empty-icon {
        font-size: 100rpx;
        opacity: 0.3;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}

/* 底部评论输入框容器 */
.comment-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 100;
}

/* 回复提示条 */
.reply-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 20rpx;
    background-color: #f8f8f8;
    border-top: 1rpx solid #e8e8e8;

    .reply-hint-text {
        font-size: 26rpx;
        color: #667eea;
        font-weight: 500;
    }

    .cancel-reply {
        font-size: 32rpx;
        color: #999;
        padding: 4rpx 8rpx;
        cursor: pointer;
        transition: all 0.2s;

        &:active {
            color: #666;
            transform: scale(0.9);
        }
    }
}

/* 底部评论输入框 */
.comment-input-bar {
    display: flex;
    align-items: center;
    padding: 16rpx 20rpx;
    background-color: #fff;
    border-top: 1rpx solid #e8e8e8;
    gap: 12rpx;
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
    padding: 0 32rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e8e8e8;
    border-radius: 32rpx;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

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

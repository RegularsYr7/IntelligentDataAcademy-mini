<template>
    <view class="page">
        <view class="message-detail-container">
            <!-- 消息头部 -->
            <view class="message-header">
                <image class="avatar" :src="message.avatar" mode="aspectFill"></image>
                <view class="header-info">
                    <text class="sender-name">{{ message.senderName }}</text>
                    <text class="message-time">{{ message.time }}</text>
                </view>
            </view>

            <!-- 消息类型标签 -->
            <view class="message-type">
                <text class="type-text">{{ typeLabel }}</text>
            </view>

            <!-- 消息内容 -->
            <view class="message-body">
                <!-- 回复/评论类型 -->
                <view class="reply-content" v-if="message.type === 'reply' && message.content">
                    <text class="content-text">{{ message.content }}</text>
                </view>

                <!-- 点赞类型 -->
                <view class="like-content" v-if="message.type === 'like'">
                    <text class="like-text">{{ message.preview }}</text>
                </view>

                <!-- 关注类型 -->
                <view class="follow-content" v-if="message.type === 'follow'">
                    <text class="follow-text">{{ message.senderName }} 关注了你</text>
                    <view class="follow-btn" @tap="followBack">
                        <text class="btn-text">回关</text>
                    </view>
                </view>

                <!-- 系统消息类型 -->
                <view class="system-content" v-if="message.type === 'system'">
                    <text class="system-text">{{ message.preview }}</text>
                </view>

                <!-- 关联帖子 -->
                <view class="related-post" v-if="message.postTitle" @tap="viewPost">
                    <view class="post-label">
                        <text class="label-text">相关帖子</text>
                    </view>
                    <view class="post-card">
                        <text class="post-title">{{ message.postTitle }}</text>
                        <text class="view-arrow">查看详情 →</text>
                    </view>
                </view>
            </view>

            <!-- 操作按钮 -->
            <view class="action-bar" v-if="message.type === 'reply'">
                <view class="action-btn reply-btn" @tap="replyMessage">
                    <text class="btn-icon">💬</text>
                    <text class="btn-text">回复</text>
                </view>
                <view class="action-btn like-btn" @tap="likeMessage">
                    <text class="btn-icon">❤️</text>
                    <text class="btn-text">点赞</text>
                </view>
            </view>

            <!-- 更多相关消息 -->
            <view class="more-messages" v-if="relatedMessages.length > 0">
                <view class="section-title">
                    <text class="title-text">相关消息</text>
                </view>
                <view class="related-list">
                    <view class="related-item" v-for="(msg, index) in relatedMessages" :key="index"
                        @tap="viewRelatedMessage(msg)">
                        <image class="related-avatar" :src="msg.avatar" mode="aspectFill"></image>
                        <view class="related-content">
                            <text class="related-name">{{ msg.senderName }}</text>
                            <text class="related-preview">{{ msg.preview }}</text>
                        </view>
                        <text class="related-time">{{ msg.time }}</text>
                    </view>
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="bottom-actions">
                <button class="delete-btn" @tap="handleDelete">删除消息</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { deleteMessage, followUser } from '@/api/community'

const messageId = ref(null)
const message = ref({})
const relatedMessages = ref([])

// 消息类型标签
const typeLabel = computed(() => {
    const typeMap = {
        reply: '💬 回复',
        like: '❤️ 点赞',
        follow: '👤 关注',
        system: '🔔 系统通知'
    }
    return typeMap[message.value.type] || '消息'
})

onLoad((options) => {
    messageId.value = options.id

    // 监听事件通道，获取传递的消息数据
    const instance = getCurrentPages()[getCurrentPages().length - 1]
    const eventChannel = instance.getOpenerEventChannel()

    eventChannel.on('acceptMessageData', (data) => {
        console.log('接收到消息数据:', data)
        if (data && data.data) {
            message.value = {
                ...data.data,
                postTitle: getPostTitle(data.data)
            }
        }
        relatedMessages.value = []
    })
})

// 根据消息类型和关联信息生成帖子标题
const getPostTitle = (msg) => {
    // 如果是评论/回复/点赞，显示相关帖子
    if (msg.relatedType === '1' && msg.relatedId) {
        return '相关帖子' // 可以根据relatedId去获取帖子标题
    }
    if (msg.relatedType === '2' && msg.relatedId) {
        return '相关评论'
    }
    return null
}

// 查看帖子
const viewPost = () => {
    // relatedType: 1=帖子, 2=评论
    if (message.value.relatedType === '1' && message.value.relatedId) {
        uni.navigateTo({
            url: `/pages/post-detail/post-detail?id=${message.value.relatedId}`
        })
    } else if (message.value.relatedType === '2' && message.value.relatedId) {
        // 如果是评论，也跳转到帖子详情（需要通过评论ID获取帖子ID，或者直接跳转）
        uni.navigateTo({
            url: `/pages/post-detail/post-detail?commentId=${message.value.relatedId}`
        })
    }
}

// 回复消息
const replyMessage = () => {
    if (message.value.relatedType === '1' && message.value.relatedId) {
        uni.navigateTo({
            url: `/pages/post-detail/post-detail?id=${message.value.relatedId}&replyTo=${message.value.senderId}`
        })
    }
}

// 点赞消息
const likeMessage = () => {
    uni.showToast({
        title: '已点赞',
        icon: 'success'
    })
}

// 回关
const followBack = async () => {
    if (!message.value.senderId) return

    try {
        // 调用关注接口 - 需要从community.js导入followUser
        // await followUser({ followedId: message.value.senderId })
        uni.showToast({
            title: '已关注 ' + message.value.senderName,
            icon: 'success'
        })
    } catch (e) {
        console.error('关注失败', e)
        uni.showToast({
            title: '关注失败',
            icon: 'none'
        })
    }
}

// 查看相关消息
const viewRelatedMessage = (msg) => {
    // 逻辑同上，可能需要重新加载或跳转
}

// 删除消息
const handleDelete = () => {
    uni.showModal({
        title: '提示',
        content: '确定要删除这条消息吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await deleteMessage(messageId.value)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                    setTimeout(() => {
                        uni.navigateBack()
                    }, 1500)
                } catch (e) {
                    console.error('删除失败', e)
                    uni.showToast({ title: '删除失败', icon: 'none' })
                }
            }
        }
    })
}
</script>

<style scoped lang="scss">
.message-detail-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 40rpx;
}

/* 消息头部 */
.message-header {
    display: flex;
    align-items: center;
    padding: 32rpx 24rpx;
    background-color: #fff;
    margin-bottom: 12rpx;
}

.avatar {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    border: 2rpx solid #f0f0f0;
}

.header-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.sender-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.message-time {
    font-size: 24rpx;
    color: #999;
}

/* 消息类型 */
.message-type {
    background-color: #fff;
    padding: 16rpx 24rpx;
    margin-bottom: 12rpx;
}

.type-text {
    font-size: 26rpx;
    color: #667eea;
    font-weight: 500;
}

/* 消息内容 */
.message-body {
    background-color: #fff;
    padding: 24rpx;
    margin-bottom: 12rpx;
}

.reply-content,
.like-content,
.follow-content,
.system-content {
    padding: 20rpx 0;
}

.content-text,
.like-text,
.follow-text,
.system-text {
    font-size: 30rpx;
    color: #333;
    line-height: 1.8;
    display: block;
}

.follow-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.follow-btn {
    padding: 12rpx 32rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    border-radius: 24rpx;
    transition: all 0.3s;

    &:active {
        opacity: 0.8;
        transform: scale(0.95);
    }
}

.follow-btn .btn-text {
    font-size: 28rpx;
    color: #fff;
}

/* 关联帖子 */
.related-post {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid #f0f0f0;
}

.post-label {
    margin-bottom: 12rpx;
}

.label-text {
    font-size: 24rpx;
    color: #999;
}

.post-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
    border-radius: 12rpx;
    border: 2rpx solid #d4e0ff;
    transition: all 0.3s;

    &:active {
        opacity: 0.8;
        transform: scale(0.98);
    }
}

.post-title {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}

.view-arrow {
    font-size: 24rpx;
    color: #667eea;
    margin-left: 16rpx;
    flex-shrink: 0;
}

/* 操作按钮 */
.action-bar {
    display: flex;
    gap: 16rpx;
    padding: 24rpx;
    background-color: #fff;
    margin-bottom: 12rpx;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    transition: all 0.3s;

    &:active {
        transform: scale(0.95);
    }
}

.reply-btn {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);

    .btn-icon,
    .btn-text {
        color: #fff;
    }
}

.like-btn {
    background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
    border: 2rpx solid #d4e0ff;

    .btn-icon {
        font-size: 32rpx;
    }

    .btn-text {
        color: #667eea;
        font-weight: 500;
    }
}

.btn-icon {
    font-size: 32rpx;
}

.btn-text {
    font-size: 28rpx;
    font-weight: 500;
}

/* 相关消息 */
.more-messages {
    background-color: #fff;
    padding: 24rpx;
}

.section-title {
    margin-bottom: 20rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.related-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.related-item {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    transition: all 0.3s;

    &:active {
        background-color: #f0f0f0;
    }
}

.related-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.related-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    overflow: hidden;
}

.related-name {
    font-size: 26rpx;
    font-weight: bold;
    color: #333;
}

.related-preview {
    font-size: 24rpx;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.related-time {
    font-size: 22rpx;
    color: #999;
    flex-shrink: 0;
    margin-left: 12rpx;
}

/* 底部操作栏 */
.bottom-actions {
    padding: 30rpx;
    margin-top: 40rpx;
    padding: 16rpx;
    background-color: #fff;
    border-top: 1rpx solid #f0f0f0;
    display: flex;
    justify-content: center;
}

.delete-btn {
    padding: 12rpx 24rpx;
    background-color: #fff;
    color: #ff4d4f;
    font-size: 30rpx;
    border-radius: 44rpx;
    border: none;
    transition: all 0.3s;

    &:active {
        opacity: 0.8;
        transform: scale(0.95);
    }

    &::after {
        border: none;
    }
}
</style>

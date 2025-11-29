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

                <!-- 关注类型 -->
                <view class="follow-content" v-if="message.type === 'follow'">
                    <text class="follow-text">{{ message.senderName }} 关注了你</text>
                    <view v-if="!message.isFollowed" class="follow-btn" @tap="followBack">
                        <text class="btn-text">回关</text>
                    </view>
                    <view v-else class="followed-btn">
                        <text class="btn-text">已关注</text>
                    </view>
                </view>

                <!-- 系统消息类型 -->
                <view class="system-content" v-if="message.type === 'system'">
                    <text class="system-text">{{ message.preview }}</text>
                </view>

                <!-- 关联帖子 -->
                <view class="related-post" v-if="hasRelatedContent" @tap="viewPost">
                    <view class="post-label">
                        <text class="label-text">{{ relatedLabel }}</text>
                    </view>
                </view>
            </view>

            <!-- 操作按钮 - 只有回复按钮 -->
            <view class="action-bar" v-if="message.type === 'reply' && hasRelatedContent">
                <view class="action-btn reply-btn" @tap="replyMessage">
                    <text class="btn-icon">💬</text>
                    <text class="btn-text">回复</text>
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
import { deleteMessage, followUser as followUserApi } from '@/api/community'

const messageId = ref(null)
const message = ref({})

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

// 是否有关联内容
const hasRelatedContent = computed(() => {
    return message.value.relatedType && message.value.relatedId
})

// 关联内容标签
const relatedLabel = computed(() => {
    if (message.value.relatedType === '1') {
        return '相关帖子'
    } else if (message.value.relatedType === '2') {
        return '相关评论'
    }
    return '相关内容'
})

onLoad((options) => {
    messageId.value = options.id

    // 监听事件通道，获取传递的消息数据
    const instance = getCurrentPages()[getCurrentPages().length - 1]
    const eventChannel = instance.getOpenerEventChannel()

    eventChannel.on('acceptMessageData', (data) => {
        console.log('接收到消息数据:', data)
        if (data && data.data) {
            message.value = data.data
        }
    })
})

// 查看帖子/评论
const viewPost = () => {
    // relatedType: 1=帖子
    // relatedId: 存储的是帖子ID
    if (message.value.relatedId) {
        uni.navigateTo({
            url: `/pages/post-detail/post-detail?id=${message.value.relatedId}`
        })
    }
}

// 回复消息
const replyMessage = () => {
    if (message.value.relatedId) {
        uni.navigateTo({
            url: `/pages/post-detail/post-detail?id=${message.value.relatedId}&replyTo=${message.value.senderId}`
        })
    }
}

// 回关
const followBack = async () => {
    if (!message.value.senderId) {
        uni.showToast({
            title: '发送者信息缺失',
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

        await followUserApi({
            followerId: userInfo.studentId,
            followeeId: message.value.senderId,
            followerName: userInfo.name,
            followerAvatar: userInfo.avatar || '',
            followeeName: message.value.senderName,
            followeeAvatar: message.value.avatar || '',
            studentId: userInfo.studentId
        })

        // 更新状态
        message.value.isFollowed = true

        uni.showToast({
            title: '已关注',
            icon: 'success'
        })
    } catch (e) {
        console.error('关注失败', e)
        uni.showToast({
            title: e.message || '关注失败',
            icon: 'none'
        })
    }
}

// 删除消息
const handleDelete = () => {
    uni.showModal({
        title: '提示',
        content: '确定要删除这条消息吗？',
        confirmColor: '#ff4d4f',
        success: async (res) => {
            if (res.confirm) {
                try {
                    uni.showLoading({ title: '删除中...' })
                    await deleteMessage(messageId.value)
                    uni.hideLoading()
                    uni.showToast({ title: '删除成功', icon: 'success' })
                    setTimeout(() => {
                        uni.navigateBack({
                            success: () => {
                                // 通知消息列表页刷新
                                uni.$emit('refreshMessageList')
                            }
                        })
                    }, 1500)
                } catch (e) {
                    uni.hideLoading()
                    console.error('删除失败', e)
                    uni.showToast({ title: e.message || '删除失败', icon: 'none' })
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

    .btn-text {
        font-size: 28rpx;
        color: #fff;
    }
}

.followed-btn {
    padding: 12rpx 32rpx;
    background: #f5f7fa;
    border: 1rpx solid #e4e7ed;
    border-radius: 24rpx;

    .btn-text {
        font-size: 28rpx;
        color: #909399;
    }
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
    padding: 24rpx;
    background-color: #fff;
    margin-bottom: 12rpx;
}

.action-btn {
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

.btn-icon {
    font-size: 32rpx;
}

.btn-text {
    font-size: 28rpx;
    font-weight: 500;
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

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
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const messageId = ref(null)

// 消息数据
const message = ref({
    id: 1,
    type: 'reply',
    avatar: 'https://picsum.photos/100/100?random=61',
    senderName: '大一萌新',
    preview: '回复了你: 太有用了！正好明天考高数，感谢学长的整理！',
    time: '5分钟前',
    isRead: true,
    content: '太有用了！正好明天考高数，感谢学长的整理！',
    postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
})

// 相关消息
const relatedMessages = ref([
    {
        id: 2,
        type: 'like',
        avatar: 'https://picsum.photos/100/100?random=62',
        senderName: '数学苦手',
        preview: '赞了你的帖子《高数期末复习重点整理》',
        time: '10分钟前'
    },
    {
        id: 3,
        type: 'reply',
        avatar: 'https://picsum.photos/100/100?random=63',
        senderName: '路过的学霸',
        preview: '回复了你: 微分方程要多做题，掌握解题套路就好了',
        time: '1小时前'
    }
])

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
    // 这里应该根据id获取消息详情
    console.log('消息详情页加载', messageId.value)

    // 模拟根据id获取不同消息
    if (options.id) {
        loadMessageDetail(options.id)
    }

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【消息详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取消息详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/messages/:id')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            type: 'system',
            title: '系统通知',
            content: '您的账号已完成实名认证',
            isRead: false,
            createTime: '2024-11-01 15:30',
            relatedId: null,
            relatedType: null,
            sender: {
                id: 0,
                name: '系统',
                avatar: ''
            },
            actions: [ // 可执行的操作(可选)
                {
                    text: '查看详情',
                    url: '/pages/xxx/xxx',
                    params: { id: 123 }
                }
            ]
        }
    }, null, 2))
    console.log('📝 获取详情时自动标记为已读')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 加载消息详情
const loadMessageDetail = (id) => {
    // 模拟数据,实际应该从服务器获取
    const messages = {
        '1': {
            id: 1,
            type: 'reply',
            avatar: 'https://picsum.photos/100/100?random=61',
            senderName: '大一萌新',
            preview: '回复了你: 太有用了！正好明天考高数，感谢学长的整理！',
            time: '5分钟前',
            isRead: true,
            content: '太有用了！正好明天考高数，感谢学长的整理！',
            postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
        },
        '2': {
            id: 2,
            type: 'like',
            avatar: 'https://picsum.photos/100/100?random=62',
            senderName: '数学苦手',
            preview: '赞了你的帖子《高数期末复习重点整理》',
            time: '10分钟前',
            isRead: true,
            postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
        },
        '3': {
            id: 3,
            type: 'reply',
            avatar: 'https://picsum.photos/100/100?random=63',
            senderName: '路过的学霸',
            preview: '回复了你: 微分方程要多做题，掌握解题套路就好了',
            time: '1小时前',
            isRead: true,
            content: '微分方程要多做题，掌握解题套路就好了',
            postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
        },
        '4': {
            id: 4,
            type: 'follow',
            avatar: 'https://picsum.photos/100/100?random=64',
            senderName: '学习打卡',
            preview: '关注了你',
            time: '2小时前',
            isRead: true
        },
        '5': {
            id: 5,
            type: 'like',
            avatar: 'https://picsum.photos/100/100?random=65',
            senderName: '考研人',
            preview: '赞了你的评论',
            time: '3小时前',
            isRead: true,
            content: '加油！相信你一定能考好的~',
            postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
        },
        '6': {
            id: 6,
            type: 'system',
            avatar: 'https://picsum.photos/100/100?random=100',
            senderName: '系统消息',
            preview: '你的帖子《Python爬虫实战教程》已通过审核',
            time: '1天前',
            isRead: true
        }
    }

    if (messages[id]) {
        message.value = messages[id]
    }
}

// 查看帖子
const viewPost = () => {
    uni.navigateTo({
        url: '/pages/post-detail/post-detail?id=1'
    })
}

// 回复消息
const replyMessage = () => {
    uni.navigateTo({
        url: `/pages/post-detail/post-detail?id=1&reply=${message.value.senderName}`
    })
}

// 点赞消息
const likeMessage = () => {
    uni.showToast({
        title: '已点赞',
        icon: 'success'
    })
}

// 回关
const followBack = () => {
    uni.showToast({
        title: '已关注 ' + message.value.senderName,
        icon: 'success'
    })
}

// 查看相关消息
const viewRelatedMessage = (msg) => {
    uni.navigateTo({
        url: `/pages/message-detail/message-detail?id=${msg.id}`
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

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
</style>

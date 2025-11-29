<template>
    <view class="page">
        <view class="message-container">
            <!-- 顶部标签栏 -->
            <view class="tabs">
                <view class="tab-item" v-for="(tab, index) in tabs" :key="index"
                    :class="{ active: currentTab === tab.value }" @tap="switchTab(tab.value)">
                    <text class="tab-text">{{ tab.label }}</text>
                    <view class="unread-dot" v-if="tab.unread > 0"></view>
                </view>
            </view>

            <!-- 消息列表 -->
            <scroll-view class="message-list" scroll-y>
                <view class="message-item" v-for="(msg, index) in filteredMessages" :key="index" @tap="viewMessage(msg)"
                    @longpress="onLongPress(msg)">
                    <image class="avatar" :src="msg.avatar" mode="aspectFill"></image>
                    <view class="message-content">
                        <view class="message-header">
                            <text class="sender-name">{{ msg.senderName }}</text>
                            <text class="message-time">{{ msg.time }}</text>
                        </view>
                        <view class="message-preview">
                            <text class="preview-text" :class="{ unread: !msg.isRead }">{{ msg.preview }}</text>
                            <view class="unread-badge" v-if="!msg.isRead">{{ msg.unreadCount || '新' }}</view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view class="empty-state" v-if="filteredMessages.length === 0">
                    <text class="empty-icon">📭</text>
                    <text class="empty-text">暂无消息</text>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
    getUnreadCount,
    getLikeMessages,
    getReplyMessages,
    getFollowMessages,
    getSystemMessages,
    markMessageRead,
    deleteMessage
} from '@/api/community'

const currentTab = ref('all')

// 标签页
const tabs = ref([
    { label: '全部', value: 'all', unread: 0 },
    { label: '回复', value: 'reply', unread: 0 },
    { label: '点赞', value: 'like', unread: 0 },
    { label: '关注', value: 'follow', unread: 0 },
    { label: '系统', value: 'system', unread: 0 }
])

// 消息列表
const messages = ref([])

// 过滤消息
const filteredMessages = computed(() => {
    return messages.value
})

onLoad(() => {
    loadMessages()

    // 监听消息列表刷新事件
    uni.$on('refreshMessageList', () => {
        loadMessages()
        loadUnreadCounts()
    })
})

onShow(() => {
    // 每次显示页面时刷新消息和未读数
    loadMessages()
    loadUnreadCounts()
})

// 获取当前用户ID
const getStudentId = () => {
    const userInfo = uni.getStorageSync('userInfo')
    return userInfo ? (userInfo.studentId || userInfo.id) : null
}

// 加载未读数量
const loadUnreadCounts = async () => {
    const studentId = getStudentId()
    if (!studentId) return

    try {
        const res = await getUnreadCount({ studentId })
        if (res && res.data) {
            const data = res.data
            tabs.value.forEach(tab => {
                if (tab.value === 'all') {
                    tab.unread = data.totalUnread || 0
                } else if (tab.value === 'reply') {
                    tab.unread = data.replyUnread || 0
                } else if (tab.value === 'like') {
                    tab.unread = data.likeUnread || 0
                } else if (tab.value === 'follow') {
                    tab.unread = data.followUnread || 0
                } else if (tab.value === 'system') {
                    tab.unread = data.systemUnread || 0
                }
            })
        }
    } catch (e) {
        console.error('获取未读数量失败', e)
    }
}

// 加载消息列表
const loadMessages = async () => {
    const studentId = getStudentId()
    if (!studentId) return

    uni.showLoading({ title: '加载中' })
    try {
        let res = []
        const params = { pageNum: 1, pageSize: 20, studentId }

        if (currentTab.value === 'all') {
            // 并行获取所有类型消息并合并排序
            const [likes, replies, follows, systems] = await Promise.all([
                getLikeMessages(params),
                getReplyMessages(params),
                getFollowMessages(params),
                getSystemMessages(params)
            ])

            const formatList = (list, type) => (list?.rows || list || []).map(item => ({ ...item, type }))

            res = [
                ...formatList(likes, 'like'),
                ...formatList(replies, 'reply'),
                ...formatList(follows, 'follow'),
                ...formatList(systems, 'system')
            ]

            // 按时间倒序
            res.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))

        } else {
            let apiFunc
            switch (currentTab.value) {
                case 'like': apiFunc = getLikeMessages; break;
                case 'reply': apiFunc = getReplyMessages; break;
                case 'follow': apiFunc = getFollowMessages; break;
                case 'system': apiFunc = getSystemMessages; break;
            }

            if (apiFunc) {
                const data = await apiFunc(params)
                res = (data?.rows || data || []).map(item => ({ ...item, type: currentTab.value }))
            }
        }

        // 数据映射适配视图
        messages.value = res.map(item => ({
            id: item.messageId,
            messageId: item.messageId,
            type: item.type,
            messageType: item.messageType,
            avatar: item.senderAvatar || 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusXjg/0',
            senderName: item.senderName || '系统消息',
            senderId: item.senderId,
            receiverId: item.receiverId,
            preview: getPreviewText(item),
            time: formatTime(item.createTime),
            createTime: item.createTime,
            isRead: item.isRead === '1', // '1' 是已读，'0' 是未读
            content: item.content,
            relatedType: item.relatedType,
            relatedId: item.relatedId,
            readTime: item.readTime,
            remark: item.remark,
            isFollowed: item.isFollowed || false // 是否已关注对方(仅关注消息有此字段)
        }))

    } catch (e) {
        console.error('加载消息失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}

const getPreviewText = (item) => {
    // messageType: 1=评论, 2=回复, 3=点赞帖子, 4=点赞评论, 5=关注, 6=系统消息
    const type = item.messageType || item.type
    if (type === '3' || type === '4' || item.type === 'like') {
        return item.content || '赞了你'
    }
    if (type === '1' || type === '2' || item.type === 'reply') {
        return item.content ? `回复了你: ${item.content}` : '回复了你'
    }
    if (type === '5' || item.type === 'follow') {
        return '关注了你'
    }
    if (type === '6' || item.type === 'system') {
        return item.content || '系统通知'
    }
    return item.content || '新消息'
}

// 格式化时间
const formatTime = (timeStr) => {
    if (!timeStr) return ''

    const time = new Date(timeStr)
    const now = new Date()
    const diff = now - time

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    return timeStr.substring(0, 16) // 返回 "2025-11-21 10:00"
}

// 切换标签
const switchTab = (tabValue) => {
    if (currentTab.value === tabValue) return
    currentTab.value = tabValue
    loadMessages()
}

// 查看消息详情
const viewMessage = async (msg) => {
    // 标记为已读
    if (!msg.isRead) {
        try {
            await markMessageRead({ messageIds: msg.id.toString() })
            msg.isRead = true
            loadUnreadCounts() // 更新未读数

            // 通知其他页面(如qa页面)更新未读数
            uni.$emit('messageUnreadUpdate')
        } catch (e) {
            console.error('标记已读失败', e)
        }
    }

    // 根据消息类型决定跳转目标
    // messageType: 1=评论, 2=回复, 3=点赞帖子, 4=点赞评论, 5=关注, 6=系统消息
    const messageType = msg.messageType

    // 评论、回复、点赞类型的消息直接跳转到帖子详情
    if (['1', '2', '3', '4'].includes(messageType) && msg.relatedId) {
        uni.navigateTo({
            url: `/pages/post-detail/post-detail?id=${msg.relatedId}`
        })
    } else {
        // 关注、系统消息等跳转到消息详情页
        uni.navigateTo({
            url: `/pages/message-detail/message-detail?id=${msg.id}`,
            success: (res) => {
                // 通过事件通道传递数据
                res.eventChannel.emit('acceptMessageData', { data: msg })
            }
        })
    }
}

// 长按删除消息
const onLongPress = (msg) => {
    uni.showActionSheet({
        itemList: ['删除消息'],
        itemColor: '#ff4d4f',
        success: async (res) => {
            if (res.tapIndex === 0) {
                try {
                    await deleteMessage(msg.id)
                    uni.showToast({ title: '删除成功', icon: 'success' })
                    // 从本地列表中移除
                    const index = messages.value.findIndex(m => m.id === msg.id)
                    if (index > -1) {
                        messages.value.splice(index, 1)
                    }

                    // 刷新未读数
                    loadUnreadCounts()

                    // 通知其他页面(如qa页面)更新未读数
                    uni.$emit('messageUnreadUpdate')
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
.message-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
}

/* 标签栏 */
.tabs {
    display: flex;
    background-color: #fff;
    padding: 16rpx 20rpx;
    gap: 32rpx;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.tab-item {
    position: relative;
    font-size: 28rpx;
    color: #666;
    padding: 8rpx 0;
    transition: all 0.3s;

    &.active {
        color: #667eea;
        font-weight: bold;

        .tab-text {
            transform: scale(1.05);
        }

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 40rpx;
            height: 4rpx;
            background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
            border-radius: 2rpx;
        }
    }
}

.tab-text {
    transition: transform 0.3s;
}

.unread-dot {
    position: absolute;
    top: 0;
    right: -12rpx;
    width: 12rpx;
    height: 12rpx;
    background-color: #ff4d4f;
    border-radius: 50%;
}

/* 消息列表 */
.message-list {
    flex: 1;
    padding: 12rpx 0;
}

.message-item {
    display: flex;
    padding: 24rpx 20rpx;
    background-color: #fff;
    margin-bottom: 2rpx;
    transition: all 0.3s;

    &:active {
        background-color: #f8f8f8;
    }
}

.avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
    border: 2rpx solid #f0f0f0;
}

.message-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12rpx;
    overflow: hidden;
}

.message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sender-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.message-time {
    font-size: 24rpx;
    color: #999;
    flex-shrink: 0;
    margin-left: 16rpx;
}

.message-preview {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.preview-text {
    font-size: 28rpx;
    color: #666;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.unread {
        color: #333;
        font-weight: 500;
    }
}

.unread-badge {
    padding: 2rpx 12rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-size: 20rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 0;
    gap: 16rpx;

    .empty-icon {
        font-size: 120rpx;
        opacity: 0.3;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}
</style>

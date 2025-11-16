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
                <view class="message-item" v-for="(msg, index) in filteredMessages" :key="index"
                    @tap="viewMessage(msg)">
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
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const currentTab = ref('all')

// 标签页
const tabs = ref([
    { label: '全部', value: 'all', unread: 3 },
    { label: '回复', value: 'reply', unread: 2 },
    { label: '点赞', value: 'like', unread: 1 },
    { label: '关注', value: 'follow', unread: 0 },
    { label: '系统', value: 'system', unread: 0 }
])

// 消息列表
const messages = ref([
    {
        id: 1,
        type: 'reply',
        avatar: 'https://picsum.photos/100/100?random=61',
        senderName: '大一萌新',
        preview: '回复了你: 太有用了！正好明天考高数，感谢学长的整理！',
        time: '5分钟前',
        isRead: false,
        unreadCount: 1,
        content: '太有用了！正好明天考高数，感谢学长的整理！',
        postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
    },
    {
        id: 2,
        type: 'like',
        avatar: 'https://picsum.photos/100/100?random=62',
        senderName: '数学苦手',
        preview: '赞了你的帖子《高数期末复习重点整理》',
        time: '10分钟前',
        isRead: false,
        unreadCount: 1,
        postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
    },
    {
        id: 3,
        type: 'reply',
        avatar: 'https://picsum.photos/100/100?random=63',
        senderName: '路过的学霸',
        preview: '回复了你: 微分方程要多做题，掌握解题套路就好了',
        time: '1小时前',
        isRead: false,
        unreadCount: 1,
        content: '微分方程要多做题，掌握解题套路就好了',
        postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
    },
    {
        id: 4,
        type: 'follow',
        avatar: 'https://picsum.photos/100/100?random=64',
        senderName: '学习打卡',
        preview: '关注了你',
        time: '2小时前',
        isRead: true
    },
    {
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
    {
        id: 6,
        type: 'system',
        avatar: 'https://picsum.photos/100/100?random=100',
        senderName: '系统消息',
        preview: '你的帖子《Python爬虫实战教程》已通过审核',
        time: '1天前',
        isRead: true
    },
    {
        id: 7,
        type: 'reply',
        avatar: 'https://picsum.photos/100/100?random=66',
        senderName: '代码诗人',
        preview: '回复了你: 可以的，我待会整理一份详细的笔记发给你',
        time: '1天前',
        isRead: true,
        content: '可以的，我待会整理一份详细的笔记发给你',
        postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
    },
    {
        id: 8,
        type: 'like',
        avatar: 'https://picsum.photos/100/100?random=67',
        senderName: '美食探索家',
        preview: '收藏了你的帖子《高数期末复习重点整理》',
        time: '2天前',
        isRead: true,
        postTitle: '高数期末复习重点整理，学弟学妹们快来看!'
    }
])

// 过滤消息
const filteredMessages = computed(() => {
    if (currentTab.value === 'all') {
        return messages.value
    }
    return messages.value.filter(msg => msg.type === currentTab.value)
})

onLoad(() => {
    console.log('消息中心加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【消息中心页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取消息列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/messages')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        type: 'all', // all | system | activity | social | other
        isRead: null, // null(全部) | true(已读) | false(未读)
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
                    type: 'system',
                    title: '系统通知',
                    content: '您的账号已完成实名认证',
                    isRead: false,
                    createTime: '2024-11-01 15:30',
                    relatedId: null, // 关联对象ID(如活动ID)
                    relatedType: null // 关联类型(activity/organization等)
                }
            ],
            total: 45,
            unreadCount: 12,
            typeCounts: {
                all: 45,
                system: 10,
                activity: 20,
                social: 10,
                other: 5
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 标记消息为已读')
    console.log('━'.repeat(80))
    console.log('请求方式: PUT')
    console.log('接口路径: /api/messages/:id/read 或 /api/messages/read-all')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('📝 read-all标记全部已读')
    console.log('\n')

    console.log('📍 接口3: 删除消息')
    console.log('━'.repeat(80))
    console.log('请求方式: DELETE')
    console.log('接口路径: /api/messages/:id 或 /api/messages/delete-all')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('type类型:')
    console.log('  - system: 系统通知')
    console.log('  - activity: 活动通知')
    console.log('  - social: 社交消息(点赞、评论等)')
    console.log('  - other: 其他')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 切换标签
const switchTab = (tabValue) => {
    currentTab.value = tabValue
}

// 查看消息详情
const viewMessage = (msg) => {
    // 标记为已读
    msg.isRead = true

    // 更新未读数
    updateUnreadCount()

    // 跳转到消息详情页
    uni.navigateTo({
        url: `/pages/message-detail/message-detail?id=${msg.id}`
    })
}

// 更新未读数
const updateUnreadCount = () => {
    tabs.value.forEach(tab => {
        if (tab.value === 'all') {
            tab.unread = messages.value.filter(msg => !msg.isRead).length
        } else {
            tab.unread = messages.value.filter(msg => msg.type === tab.value && !msg.isRead).length
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

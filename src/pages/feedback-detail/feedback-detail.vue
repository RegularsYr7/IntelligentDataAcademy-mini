<template>
    <view class="page">
        <view class="container">
            <!-- 反馈信息卡片 -->
            <view class="feedback-card">
                <view class="card-header">
                    <view class="header-left">
                        <view class="type-badge" :class="'type-' + feedback.type">
                            <text>{{ getTypeText(feedback.type) }}</text>
                        </view>
                    </view>
                    <view class="status-badge" :class="'status-' + feedback.status">
                        <text>{{ getStatusText(feedback.status) }}</text>
                    </view>
                </view>

                <view class="feedback-content">
                    <text class="feedback-title">{{ feedback.title }}</text>
                    <text class="feedback-desc">{{ feedback.description }}</text>
                </view>

                <!-- 图片列表 -->
                <view class="photo-list" v-if="feedback.photos && feedback.photos.length > 0" :class="gridClass">
                    <image class="photo-item" v-for="(photo, index) in feedback.photos" :key="index" :src="photo"
                        mode="aspectFill" @tap="previewPhoto(index)"></image>
                </view>

                <view class="feedback-footer">
                    <view class="time-info">
                        <text class="time-icon">🕒</text>
                        <text>{{ formatDateTime(feedback.createTime) }}</text>
                    </view>
                    <view class="contact-info" v-if="feedback.contact">
                        <text class="contact-icon">📱</text>
                        <text>{{ feedback.contact }}</text>
                    </view>
                </view>
            </view>

            <!-- 回复列表 -->
            <view class="reply-section" v-if="feedback.replies && feedback.replies.length > 0">
                <view class="section-header">
                    <text class="header-icon">💬</text>
                    <text class="header-title">回复记录</text>
                </view>
                <view class="reply-list">
                    <view class="reply-item" v-for="(reply, index) in feedback.replies" :key="index"
                        :class="{ 'is-me': reply.isMe }">
                        <view class="reply-avatar">
                            <text>{{ reply.isMe ? '👤' : '👨‍💼' }}</text>
                        </view>
                        <view class="reply-bubble">
                            <view class="reply-meta">
                                <text class="reply-role">{{ reply.isMe ? '我' : (reply.roleName || '管理员') }}</text>
                                <text class="reply-time">{{ formatReplyTime(reply.time) }}</text>
                            </view>
                            <text class="reply-content">{{ reply.content }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 追加反馈 -->
            <view class="append-section" v-if="feedback.status !== 'resolved'">
                <view class="section-header">
                    <text class="header-icon">✏️</text>
                    <text class="header-title">追加说明</text>
                </view>
                <view class="append-input-wrapper">
                    <textarea class="append-input" v-model="appendContent" placeholder="可以在此追加更多信息或回复管理员..."
                        maxlength="300" />
                </view>
                <view class="append-footer">
                    <text class="char-count">{{ appendContent.length }}/300</text>
                    <button class="append-btn" @tap="submitAppend" :disabled="!appendContent.trim()">
                        提交回复
                    </button>
                </view>
            </view>

            <!-- 已解决提示 -->
            <view class="resolved-tip" v-else>
                <text class="tip-icon">🎉</text>
                <text class="tip-text">该反馈已完美解决</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getFeedbackDetail, appendFeedback } from '@/api/feedback'

// 反馈详情
const feedback = ref({
    id: 0,
    type: '',
    title: '',
    description: '',
    photos: [],
    contact: '',
    status: 'pending',
    createTime: '',
    replies: []
})

// 图片网格样式
const gridClass = computed(() => {
    const len = feedback.value.photos ? feedback.value.photos.length : 0
    if (len === 1) return 'grid-1'
    if (len === 2 || len === 4) return 'grid-2'
    return 'grid-3'
})

// 追加内容
const appendContent = ref('')

// 加载中状态
const loading = ref(false)

// 加载详情
const loadFeedbackDetail = async (id) => {
    if (!id) {
        uni.showToast({
            title: '反馈ID缺失',
            icon: 'none'
        })
        return
    }

    try {
        loading.value = true
        const res = await getFeedbackDetail(id)

        console.log('反馈详情返回:', res)

        // 状态映射：后端 -> 前端
        const statusMap = {
            '0': 'pending',    // 待处理
            '1': 'processing', // 处理中
            '2': 'resolved'    // 已解决
        }

        // 类型映射：后端 -> 前端
        const typeMap = {
            '1': 'course',      // 课程内容
            '2': 'teaching',    // 教学方式
            '3': 'environment', // 教学环境
            '4': 'other'        // 其他建议
        }

        // 适配后端返回的数据结构
        let replies = []
        if (res.replyRecords) {
            try {
                const records = typeof res.replyRecords === 'string' ? JSON.parse(res.replyRecords) : res.replyRecords
                replies = records.map(item => ({
                    isMe: item.type === 'append', // 学生追加的是"我"
                    isAdmin: item.type === 'reply', // 管理员回复的是"管理员"
                    content: item.content,
                    time: item.replyTime,
                    roleName: item.replyBy
                }))
            } catch (e) {
                console.error('解析回复记录失败', e)
            }
        }

        feedback.value = {
            id: res.feedbackId,
            type: typeMap[res.feedbackType] || 'other',
            title: res.title,
            description: res.description,
            photos: res.imageUrls ? res.imageUrls.split(',').filter(url => url) : [],
            contact: res.contactInfo,
            status: statusMap[res.feedbackStatus] || 'pending',
            createTime: res.createTime,
            submitTime: res.submitTime,
            replies: replies,
            studentName: res.studentName,
            studentNo: res.studentNo,
            currentHandlerName: res.currentHandlerName,
            firstReplyTime: res.firstReplyTime,
            resolveTime: res.resolveTime
        }

        console.log('反馈详情加载成功:', feedback.value)
    } catch (error) {
        console.error('获取反馈详情失败:', error)

    } finally {
        loading.value = false
    }
}

// 获取类型文本
const getTypeText = (type) => {
    const typeMap = {
        'course': '课程内容',
        'teaching': '教学方式',
        'environment': '教学环境',
        'other': '其他建议'
    }
    return typeMap[type] || ''
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'resolved': '已解决'
    }
    return statusMap[status] || ''
}

// 解析时间
const parseDate = (time) => {
    if (!time) return new Date()
    if (typeof time === 'string') {
        // 解决iOS等环境不支持 - 连接符的问题
        return new Date(time.replace(/-/g, '/'))
    }
    return new Date(time)
}

// 格式化日期时间
const formatDateTime = (timeStr) => {
    const date = parseDate(timeStr)
    if (isNaN(date.getTime())) return timeStr // 如果解析失败，返回原字符串

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    const days = ['日', '一', '二', '三', '四', '五', '六']
    const dayOfWeek = days[date.getDay()]

    return `${year}年${month}月${day}日 星期${dayOfWeek} ${hours}:${minutes}`
}

// 格式化回复时间
const formatReplyTime = (timeStr) => {
    const date = parseDate(timeStr)
    if (isNaN(date.getTime())) return timeStr

    const now = new Date()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    // 判断是否是今天
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        return `今天 ${hours}:${minutes}`
    }

    // 判断是否是昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    if (isYesterday) {
        return `昨天 ${hours}:${minutes}`
    }

    return `${month}月${day}日 ${hours}:${minutes}`
}

// 预览照片
const previewPhoto = (index) => {
    uni.previewImage({
        urls: feedback.value.photos,
        current: index
    })
}

// 提交追加内容
const submitAppend = async () => {
    if (!appendContent.value.trim()) {
        return
    }

    try {
        const token = uni.getStorageSync('userToken')
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        // 调用追加反馈接口
        await appendFeedback({
            feedbackId: Number(feedback.value.id),  // 反馈ID
            content: appendContent.value            // 追加内容
        })

        uni.showToast({
            title: '追加成功',
            icon: 'none'
        })

        // 清空输入框
        appendContent.value = ''

        // 重新加载详情
        setTimeout(() => {
            loadFeedbackDetail(feedback.value.id)
        }, 1000)

    } catch (error) {
        console.error('追加说明失败:', error)
        uni.showToast({
            title: error.message || '追加失败',
            icon: 'none'
        })
    }
}

onLoad((options) => {
    const id = options.id
    if (id) {
        loadFeedbackDetail(id)
    }
    console.log('反馈详情页加载', id)

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【反馈详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取反馈详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/feedback/:id')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            type: 'bug',
            content: '反馈内容',
            images: ['https://example.com/img1.jpg'],
            contact: '13812345678',
            status: 'pending', // pending | processing | resolved | closed
            submitter: {
                id: 1,
                name: '张三',
                avatar: 'https://example.com/avatar.jpg'
            },
            createTime: '2024-11-01 15:30',
            replies: [
                {
                    id: 1,
                    content: '感谢反馈,我们会尽快处理',
                    replier: {
                        id: 2,
                        name: '管理员',
                        role: 'admin'
                    },
                    replyTime: '2024-11-01 16:00'
                }
            ]
        }
    }, null, 2))
    console.log('📝 只能查看自己提交的反馈详情')
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('status状态:')
    console.log('  - pending: 待处理')
    console.log('  - processing: 处理中')
    console.log('  - resolved: 已解决')
    console.log('  - closed: 已关闭')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding-bottom: 40rpx;
}

.container {
    padding: 24rpx;
}

/* 通用卡片样式 */
.feedback-card,
.reply-section,
.append-section,
.resolved-tip {
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
}

/* 头部状态栏 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f5f7fa;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.type-badge {
    padding: 8rpx 20rpx;
    border-radius: 32rpx;
    font-size: 24rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6rpx;

    &.type-course {
        background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
        color: #5e35b1;
    }

    &.type-teaching {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #00695c;
    }

    &.type-environment {
        background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
        color: #e65100;
    }

    &.type-other {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
        color: #c62828;
    }
}

.status-badge {
    padding: 8rpx 24rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 600;
    letter-spacing: 1rpx;

    &.status-pending {
        background: #fff7e6;
        color: #fa8c16;
        border: 1rpx solid #ffd591;
    }

    &.status-processing {
        background: #e6f7ff;
        color: #1890ff;
        border: 1rpx solid #91d5ff;
    }

    &.status-resolved {
        background: #f6ffed;
        color: #52c41a;
        border: 1rpx solid #b7eb8f;
    }
}

/* 反馈内容 */
.feedback-content {
    margin-bottom: 30rpx;
}

.feedback-title {
    font-size: 36rpx;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 20rpx;
    line-height: 1.4;
    display: block;
}

.feedback-desc {
    font-size: 30rpx;
    color: #4a4a4a;
    line-height: 1.8;
    display: block;
    text-align: justify;
}

/* 图片网格 */
.photo-list {
    display: grid;
    gap: 12rpx;
    margin-bottom: 24rpx;
    border-radius: 16rpx;
    overflow: hidden;

    &.grid-1 {
        grid-template-columns: 1fr;

        .photo-item {
            height: 400rpx;
        }
    }

    &.grid-2,
    &.grid-4 {
        grid-template-columns: repeat(2, 1fr);

        .photo-item {
            height: 300rpx;
        }
    }

    &.grid-3,
    &.grid-5,
    &.grid-6,
    &.grid-7,
    &.grid-8,
    &.grid-9 {
        grid-template-columns: repeat(3, 1fr);

        .photo-item {
            height: 220rpx;
        }
    }
}

.photo-item {
    width: 100%;
    object-fit: cover;
    border-radius: 8rpx;
    background: #f0f0f0;
}

/* 底部信息 */
.feedback-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx dashed #eee;
}

.time-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #999;
}

.contact-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
    color: #666;
    background: #f5f7fa;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
}

.contact-icon {
    font-size: 24rpx;
}

/* 回复区域 */
.section-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 30rpx;

    .header-icon {
        font-size: 32rpx;
    }

    .header-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #333;
    }
}

.reply-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.reply-item {
    display: flex;
    gap: 20rpx;

    &.is-me {
        flex-direction: row-reverse;

        .reply-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border-radius: 24rpx 4rpx 24rpx 24rpx;

            .reply-time {
                color: rgba(255, 255, 255, 0.7);
            }

            .reply-role {
                color: #fff;
            }
        }
    }

    &:not(.is-me) {
        .reply-bubble {
            background: #f0f2f5;
            color: #333;
            border-radius: 4rpx 24rpx 24rpx 24rpx;

            .reply-time {
                color: #999;
            }

            .reply-role {
                color: #666;
            }
        }
    }
}

.reply-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #eee;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    border: 2rpx solid #fff;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.reply-bubble {
    padding: 24rpx;
    max-width: 70%;
    position: relative;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.reply-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
    font-size: 24rpx;
    gap: 12rpx;
}

.reply-role {
    font-weight: 600;
}

.reply-content {
    font-size: 28rpx;
    line-height: 1.6;
    word-break: break-all;
}

/* 追加输入框 */
.append-input-wrapper {
    background: #f9fafc;
    border-radius: 16rpx;
    padding: 24rpx;
    border: 2rpx solid #eee;
    transition: all 0.3s;

    &:focus-within {
        background: #fff;
        border-color: #667eea;
        box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
    }
}

.append-input {
    width: 100%;
    min-height: 160rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
}

.append-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24rpx;
}

.append-btn {
    margin: 0;
    padding: 0 48rpx;
    height: 64rpx;
    line-height: 64rpx;
    background: linear-gradient(90deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-size: 26rpx;
    border-radius: 32rpx;
    box-shadow: 0 4rpx 12rpx rgba(24, 40, 72, 0.2);

    &[disabled] {
        background: #ccc;
        box-shadow: none;
        opacity: 0.7;
    }

    &:active {
        transform: scale(0.98);
    }
}

/* 已解决状态 */
.resolved-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    background: linear-gradient(180deg, #f6ffed 0%, #fff 100%);
    border: 2rpx dashed #b7eb8f;
}

.tip-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
    animation: bounce 2s infinite;
}

.tip-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #52c41a;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-10rpx);
    }

    60% {
        transform: translateY(-5rpx);
    }
}
</style>

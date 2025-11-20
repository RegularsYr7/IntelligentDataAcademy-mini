<template>
    <view class="page">
        <view class="container">
            <!-- 反馈信息卡片 -->
            <view class="feedback-card">
                <view class="card-header">
                    <view class="type-badge" :class="'type-' + feedback.type">
                        <text>{{ getTypeText(feedback.type) }}</text>
                    </view>
                    <view class="status-badge" :class="'status-' + feedback.status">
                        <text>{{ getStatusText(feedback.status) }}</text>
                    </view>
                </view>
                <text class="feedback-title">{{ feedback.title }}</text>
                <text class="feedback-desc">{{ feedback.description }}</text>

                <!-- 图片列表 -->
                <view class="photo-list" v-if="feedback.photos && feedback.photos.length > 0">
                    <image class="photo-item" v-for="(photo, index) in feedback.photos" :key="index" :src="photo"
                        mode="aspectFill" @tap="previewPhoto(index)"></image>
                </view>

                <view class="feedback-time">
                    <text class="time-icon">🕒</text>
                    {{ formatDateTime(feedback.createTime) }}
                </view>
            </view>

            <!-- 回复列表 -->
            <view class="reply-section" v-if="feedback.replies && feedback.replies.length > 0">
                <view class="section-title">
                    <text class="title-icon">💬</text>
                    <text class="title-text">回复记录</text>
                </view>
                <view class="reply-list">
                    <view class="reply-item" v-for="(reply, index) in feedback.replies" :key="index"
                        :class="{ admin: reply.isAdmin }">
                        <view class="reply-header">
                            <text class="reply-role">{{ reply.isAdmin ? '管理员' : '我' }}</text>
                            <text class="reply-time">{{ formatReplyTime(reply.time) }}</text>
                        </view>
                        <text class="reply-content">{{ reply.content }}</text>
                    </view>
                </view>
            </view>

            <!-- 追加反馈 -->
            <view class="append-section" v-if="feedback.status !== 'resolved'">
                <view class="section-title">
                    <text class="title-icon">✏️</text>
                    <text class="title-text">追加说明</text>
                </view>
                <view class="append-input-wrapper">
                    <textarea class="append-input" v-model="appendContent" placeholder="可以在此追加更多信息或回复管理员..."
                        maxlength="300" />
                </view>
                <view class="append-footer">
                    <text class="char-count">{{ appendContent.length }}/300</text>
                    <button class="append-btn" @tap="submitAppend" :disabled="!appendContent.trim()">
                        提交
                    </button>
                </view>
            </view>

            <!-- 已解决提示 -->
            <view class="resolved-tip" v-else>
                <text class="tip-icon">✅</text>
                <text class="tip-text">该反馈已解决</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
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
            replies: res.replyRecords ? JSON.parse(res.replyRecords) : [],
            studentName: res.studentName,
            studentNo: res.studentNo,
            currentHandlerName: res.currentHandlerName,
            firstReplyTime: res.firstReplyTime,
            resolveTime: res.resolveTime
        }

        console.log('反馈详情加载成功:', feedback.value)
    } catch (error) {
        console.error('获取反馈详情失败:', error)
        uni.showToast({
            title: '获取详情失败',
            icon: 'none'
        })
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

// 格式化日期时间
const formatDateTime = (timeStr) => {
    const date = new Date(timeStr)
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
    const date = new Date(timeStr)
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
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '未找到学生信息',
                icon: 'none'
            })
            return
        }

        // 调用追加反馈接口
        await appendFeedback({
            feedbackId: Number(feedback.value.id),  // 反馈ID
            studentId: Number(userInfo.studentId),  // 学生ID
            content: appendContent.value            // 追加内容
        })

        uni.showToast({
            title: '追加成功',
            icon: 'success'
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
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding: 20rpx;
    padding-bottom: 20rpx;
}

/* 反馈卡片 */
.feedback-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.card-header {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;
}

.type-badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;

    &.type-course {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.type-teaching {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }

    &.type-environment {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.type-other {
        background: rgba(245, 87, 108, 0.1);
        color: #f5576c;
    }
}

.status-badge {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;

    &.status-pending {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.status-processing {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    &.status-resolved {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }
}

.feedback-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    line-height: 1.5;
}

.feedback-desc {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    margin-bottom: 20rpx;
}

.photo-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 20rpx;
}

.photo-item {
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
}

.feedback-time {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.time-icon {
    margin-right: 8rpx;
}

/* 回复区域 */
.reply-section,
.append-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.title-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.reply-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.reply-item {
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx;

    &.admin {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.reply-role {
    font-size: 24rpx;
    color: #667eea;
    font-weight: bold;
}

.reply-time {
    font-size: 22rpx;
    color: #999;
}

.reply-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
}

/* 追加区域 */
.append-input-wrapper {
    width: 100%;
    box-sizing: border-box;
}

.append-input {
    width: 100%;
    min-height: 200rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
}

.append-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16rpx;
}

.char-count {
    font-size: 24rpx;
    color: #999;
}

.append-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 26rpx;
    font-weight: bold;
    padding: 0 40rpx;
    height: 60rpx;
    line-height: 60rpx;
    border-radius: 30rpx;
    border: none;

    &[disabled] {
        opacity: 0.5;
    }
}

/* 已解决提示 */
.resolved-tip {
    background: rgba(82, 196, 26, 0.1);
    border-radius: 16rpx;
    padding: 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
}

.tip-icon {
    font-size: 80rpx;
}

.tip-text {
    font-size: 28rpx;
    color: #52c41a;
    font-weight: bold;
}
</style>

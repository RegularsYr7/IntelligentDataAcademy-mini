<template>
    <view class="page">
        <view class="container">
            <!-- 反馈类型 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">反馈类型</text>
                    <text class="required-mark">*</text>
                </view>
                <view class="type-grid">
                    <view class="type-item" v-for="type in feedbackTypes" :key="type.value"
                        :class="{ active: form.type === type.value }" @tap="selectType(type.value)">
                        <text class="type-icon">{{ type.icon }}</text>
                        <text class="type-label">{{ type.label }}</text>
                    </view>
                </view>
            </view>

            <!-- 反馈标题 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">反馈标题</text>
                    <text class="required-mark">*</text>
                </view>
                <input class="input-field" v-model="form.title" placeholder="请简要描述您的问题或建议" maxlength="30" />
            </view>

            <!-- 详细描述 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">详细描述</text>
                    <text class="required-mark">*</text>
                </view>
                <textarea class="textarea-field" v-model="form.description" placeholder="请详细描述您遇到的问题或想提的建议，以便我们更好地为您服务"
                    maxlength="500" />
                <view class="char-count">{{ form.description.length }}/500</view>
            </view>

            <!-- 图片上传 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">相关截图</text>
                    <text class="required-mark">*</text>
                </view>
                <view class="photo-upload">
                    <view class="photo-item" v-for="(photo, index) in form.photos" :key="index">
                        <image class="photo-preview" :src="photo" mode="aspectFill"></image>
                        <view class="photo-delete" @tap="deletePhoto(index)">
                            <text class="delete-icon">×</text>
                        </view>
                    </view>
                    <view class="photo-add" v-if="form.photos.length < 3" @tap="addPhoto">
                        <text class="add-icon">📷</text>
                        <text class="add-text">添加图片</text>
                        <text class="add-tip">{{ form.photos.length }}/3</text>
                    </view>
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">联系方式</text>
                    <text class="required-mark">*</text>
                </view>
                <input class="input-field" v-model="form.contact" placeholder="留下您的联系方式，方便我们与您沟通" />
            </view>

            <!-- 提交按钮 -->
            <view class="submit-section">
                <button class="records-btn" @tap="goToRecords">
                    查看反馈记录
                </button>
                <button class="submit-btn" @tap="submitForm" :disabled="!canSubmit">
                    {{ submitting ? '提交中...' : '提交反馈' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 反馈类型
const feedbackTypes = [
    { value: 'course', label: '课程内容', icon: '📚' },
    { value: 'teaching', label: '教学方式', icon: '👨‍🏫' },
    { value: 'environment', label: '教学环境', icon: '🏫' },
    { value: 'other', label: '其他建议', icon: '💡' }
]

// 表单数据
const form = ref({
    type: '',
    title: '',
    description: '',
    photos: [],
    contact: ''
})

// 提交状态
const submitting = ref(false)

// 是否可以提交
const canSubmit = computed(() => {
    return form.value.type &&
        form.value.title.trim() &&
        form.value.description.trim() &&
        form.value.photos.length > 0 &&
        form.value.contact.trim() &&
        !submitting.value
})

// 选择类型
const selectType = (type) => {
    form.value.type = type
}

// 添加图片
const addPhoto = () => {
    if (form.value.photos.length >= 3) {
        uni.showToast({
            title: '最多上传3张图片',
            icon: 'none'
        })
        return
    }

    uni.chooseImage({
        count: 3 - form.value.photos.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            form.value.photos = [...form.value.photos, ...res.tempFilePaths]
        }
    })
}

// 删除图片
const deletePhoto = (index) => {
    form.value.photos.splice(index, 1)
}

// 提交表单
const submitForm = () => {
    if (!canSubmit.value) {
        return
    }

    // 验证
    if (!form.value.type) {
        uni.showToast({ title: '请选择反馈类型', icon: 'none' })
        return
    }

    if (!form.value.title.trim()) {
        uni.showToast({ title: '请输入反馈标题', icon: 'none' })
        return
    }

    if (!form.value.description.trim()) {
        uni.showToast({ title: '请输入详细描述', icon: 'none' })
        return
    }

    if (form.value.photos.length === 0) {
        uni.showToast({ title: '请上传相关截图', icon: 'none' })
        return
    }

    if (!form.value.contact.trim()) {
        uni.showToast({ title: '请输入联系方式', icon: 'none' })
        return
    }

    submitting.value = true

    // 模拟提交
    setTimeout(() => {
        // 保存到本地存储
        const feedbacks = uni.getStorageSync('feedbackRecords') || []
        const newFeedback = {
            id: Date.now(),
            type: form.value.type,
            title: form.value.title,
            description: form.value.description,
            photos: form.value.photos,
            contact: form.value.contact,
            status: 'pending', // pending: 待处理, processing: 处理中, resolved: 已解决
            createTime: new Date().toISOString(),
            replies: [] // 回复记录
        }

        feedbacks.unshift(newFeedback)
        uni.setStorageSync('feedbackRecords', feedbacks)

        submitting.value = false

        uni.showToast({
            title: '提交成功',
            icon: 'success'
        })

        // 1.5秒后跳转到反馈记录页
        setTimeout(() => {
            uni.redirectTo({
                url: '/pages/feedback-records/feedback-records'
            })
        }, 1500)
    }, 1500)
}

// 查看反馈记录
const goToRecords = () => {
    uni.navigateTo({
        url: '/pages/feedback-records/feedback-records'
    })
}

onLoad(() => {
    console.log('反馈页加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【反馈页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 上传图片')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/upload/image')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数: FormData')
    console.log(JSON.stringify({
        file: 'Binary file data',
        type: 'feedback'
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            url: 'https://example.com/uploads/feedback/xxxxx.jpg'
        }
    }, null, 2))
    console.log('📝 图片限制: 最多3张,每张最大5MB,支持jpg/png格式')
    console.log('\n')

    console.log('📍 接口2: 提交反馈')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/feedback')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        type: 'bug', // bug | feature | other
        content: '反馈内容',
        contact: '13812345678', // 可选
        images: ['https://example.com/img1.jpg']
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '提交成功',
        data: {
            id: 1,
            createTime: '2024-11-01 15:30'
        }
    }, null, 2))
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('type类型:')
    console.log('  - bug: 问题反馈')
    console.log('  - feature: 功能建议')
    console.log('  - other: 其他')
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
    padding-bottom: 140rpx;
}

/* 区块 */
.section {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.required-mark {
    font-size: 30rpx;
    color: #f5576c;
    margin-left: 8rpx;
}

.optional-mark {
    font-size: 24rpx;
    color: #999;
    margin-left: 8rpx;
}

/* 类型网格 */
.type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
}

.type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 24rpx 0;
    border-radius: 12rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .type-icon,
        .type-label {
            color: #fff;
        }
    }
}

.type-icon {
    font-size: 40rpx;
}

.type-label {
    font-size: 24rpx;
    color: #666;
    font-weight: bold;
}

/* 输入框 */
.input-field {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
}

/* 文本域 */
.textarea-field {
    width: 100%;
    min-height: 250rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;
}

.char-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 12rpx;
}

/* 照片上传 */
.photo-upload {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.photo-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    border-radius: 12rpx;
    overflow: hidden;
}

.photo-preview {
    width: 100%;
    height: 100%;
}

.photo-delete {
    position: absolute;
    top: 0;
    right: 0;
    width: 50rpx;
    height: 50rpx;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom-left-radius: 12rpx;
}

.delete-icon {
    font-size: 40rpx;
    color: #fff;
    font-weight: 300;
}

.photo-add {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    background: #fafafa;
}

.add-icon {
    font-size: 60rpx;
}

.add-text {
    font-size: 24rpx;
    color: #666;
}

.add-tip {
    font-size: 22rpx;
    color: #999;
}

/* 提交区域 */
.submit-section {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding: 20rpx 0;
}

.records-btn {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    color: #666;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 40rpx;
    border: none;
}

.submit-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    border: none;

    &[disabled] {
        opacity: 0.5;
    }
}
</style>

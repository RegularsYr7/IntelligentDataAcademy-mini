<template>
    <view class="page">
        <view class="container">
            <!-- 类型选择 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">类型</text>
                    <text class="required-mark">*</text>
                </view>
                <view class="type-selector">
                    <view class="type-btn" :class="{ active: form.type === 'lost' }" @tap="selectType('lost')">
                        <text class="type-icon">❌</text>
                        <text class="type-text">失物</text>
                    </view>
                    <view class="type-btn" :class="{ active: form.type === 'found' }" @tap="selectType('found')">
                        <text class="type-icon">✅</text>
                        <text class="type-text">招领</text>
                    </view>
                </view>
            </view>

            <!-- 物品标题 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">物品标题</text>
                    <text class="required-mark">*</text>
                </view>
                <input class="input-field" v-model="form.title" placeholder="请简要描述物品，如：黑色钱包" maxlength="30" />
            </view>

            <!-- 物品描述 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">详细描述</text>
                    <text class="required-mark">*</text>
                </view>
                <textarea class="textarea-field" v-model="form.description" placeholder="请详细描述物品特征，如颜色、品牌、内含物品等"
                    maxlength="200" />
                <view class="char-count">{{ form.description.length }}/200</view>
            </view>

            <!-- 照片上传 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">物品照片</text>
                    <text class="required-mark">*</text>
                </view>
                <view class="photo-upload">
                    <view class="photo-item" v-if="form.photo">
                        <image class="photo-preview" :src="form.photo" mode="aspectFill"></image>
                        <view class="photo-delete" @tap="deletePhoto">
                            <text class="delete-icon">×</text>
                        </view>
                    </view>
                    <view class="photo-add" v-else @tap="choosePhoto">
                        <text class="add-icon">📷</text>
                        <text class="add-text">添加照片</text>
                    </view>
                </view>
            </view>

            <!-- 地点 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">{{ form.type === 'lost' ? '丢失地点' : '拾取地点' }}</text>
                    <text class="required-mark">*</text>
                </view>
                <input class="input-field" v-model="form.location" placeholder="请输入具体地点，如：图书馆三楼" />
            </view>

            <!-- 时间 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">{{ form.type === 'lost' ? '丢失时间' : '拾取时间' }}</text>
                    <text class="required-mark">*</text>
                </view>
                <picker mode="date" :value="form.date" @change="onDateChange">
                    <view class="picker-field">
                        <text :class="{ placeholder: !form.date }">
                            {{ form.date || '请选择日期' }}
                        </text>
                    </view>
                </picker>
            </view>

            <!-- 联系方式 -->
            <view class="section">
                <view class="section-title">
                    <text class="title-text">联系方式</text>
                    <text class="required-mark">*</text>
                </view>
                <input class="input-field" v-model="form.contact" placeholder="请输入微信号或电话号码" />
            </view>

            <!-- 提交按钮 -->
            <view class="submit-section">
                <button class="submit-btn" @tap="submitForm" :disabled="!canSubmit">
                    {{ submitting ? '发布中...' : '发布信息' }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 表单数据
const form = ref({
    type: 'lost',
    title: '',
    description: '',
    photo: '',
    location: '',
    date: '',
    contact: ''
})

// 提交状态
const submitting = ref(false)

// 是否可以提交
const canSubmit = computed(() => {
    return form.value.type &&
        form.value.title.trim() &&
        form.value.description.trim() &&
        form.value.photo &&
        form.value.location.trim() &&
        form.value.date &&
        form.value.contact.trim() &&
        !submitting.value
})

// 选择类型
const selectType = (type) => {
    form.value.type = type
}

// 选择照片
const choosePhoto = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            form.value.photo = res.tempFilePaths[0]
        }
    })
}

// 删除照片
const deletePhoto = () => {
    uni.showModal({
        title: '确认删除',
        content: '确定要删除这张照片吗？',
        success: (res) => {
            if (res.confirm) {
                form.value.photo = ''
            }
        }
    })
}

// 日期改变
const onDateChange = (e) => {
    form.value.date = e.detail.value
}

// 提交表单
const submitForm = () => {
    if (!canSubmit.value) {
        return
    }

    // 验证
    if (!form.value.title.trim()) {
        uni.showToast({ title: '请输入物品标题', icon: 'none' })
        return
    }

    if (!form.value.description.trim()) {
        uni.showToast({ title: '请输入详细描述', icon: 'none' })
        return
    }

    if (!form.value.photo) {
        uni.showToast({ title: '请上传物品照片', icon: 'none' })
        return
    }

    if (!form.value.location.trim()) {
        uni.showToast({ title: '请输入地点', icon: 'none' })
        return
    }

    if (!form.value.date) {
        uni.showToast({ title: '请选择日期', icon: 'none' })
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
        const items = uni.getStorageSync('lostFoundItems') || []
        const newItem = {
            id: Date.now(),
            type: form.value.type,
            title: form.value.title,
            description: form.value.description,
            photo: form.value.photo,
            location: form.value.location,
            time: new Date(form.value.date).toISOString(),
            userName: '当前用户', // 实际应从用户信息获取
            userAvatar: 'https://picsum.photos/100/100?random=me',
            contact: form.value.contact,
            status: 'pending'
        }

        items.unshift(newItem)
        uni.setStorageSync('lostFoundItems', items)

        submitting.value = false

        uni.showToast({
            title: '发布成功',
            icon: 'success'
        })

        // 返回上一页
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    }, 1500)
}

onLoad(() => {
    console.log('发布失物招领页加载')
    // 设置默认日期为今天
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    form.value.date = `${year}-${month}-${day}`

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【发布失物招领页面 - 后端接口需求文档】')
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
        type: 'lost-found'
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            url: 'https://example.com/uploads/lost-found/xxxxx.jpg'
        }
    }, null, 2))
    console.log('📝 图片限制: 最多3张,每张最大5MB,支持jpg/png格式')
    console.log('\n')

    console.log('📍 接口2: 发布失物招领')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/lost-found')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        type: 'lost', // lost | found
        title: '丢失校园卡',
        description: '详细描述...',
        category: '证件',
        location: '图书馆',
        lostTime: '2024-11-01 14:00',
        images: ['https://example.com/img1.jpg'],
        contactInfo: {
            phone: '13812345678',
            wechat: 'zhangsan123' // 可选
        }
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '发布成功',
        data: {
            id: 1,
            createTime: '2024-11-01 15:30'
        }
    }, null, 2))
    console.log('📝 标题、描述、分类、地点、时间为必填项')
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

/* 类型选择 */
.type-selector {
    display: flex;
    gap: 20rpx;
}

.type-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 30rpx 0;
    border-radius: 12rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .type-icon,
        .type-text {
            color: #fff;
        }
    }
}

.type-icon {
    font-size: 48rpx;
}

.type-text {
    font-size: 28rpx;
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
    min-height: 200rpx;
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
    gap: 12rpx;
    background: #fafafa;
}

.add-icon {
    font-size: 60rpx;
}

.add-text {
    font-size: 24rpx;
    color: #999;
}

/* 选择器 */
.picker-field {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 8rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    box-sizing: border-box;

    .placeholder {
        color: #999;
    }
}

/* 提交区域 */
.submit-section {
    padding: 20rpx 0;
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

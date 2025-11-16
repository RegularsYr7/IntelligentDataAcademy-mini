<template>
    <view class="publish-page">
        <view class="editor-section">
            <!-- 标题输入 -->
            <view class="input-group">
                <textarea class="title-input" placeholder="标题（选填）" v-model="title" maxlength="50"
                    :adjust-position="true" :show-confirm-bar="false" />
                <text class="char-limit" v-if="title.length > 0">{{ title.length }}/50</text>
            </view>

            <!-- 内容输入 -->
            <view class="input-group">
                <textarea class="content-input" placeholder="分享你的想法..." v-model="content" maxlength="5000"
                    :adjust-position="true" :show-confirm-bar="false" />
            </view>

            <!-- 图片网格 -->
            <view class="image-grid" v-if="imageList.length > 0">
                <view class="grid-item" v-for="(img, index) in imageList" :key="index">
                    <image class="grid-image" :src="img" mode="aspectFill" />
                    <view class="delete-badge" @tap="deleteImage(index)">
                        <text class="delete-text">✕</text>
                    </view>
                </view>
                <view class="grid-item add-item" v-if="imageList.length < 9" @tap="chooseImage">
                    <text class="add-text">+</text>
                </view>
            </view>

            <!-- 话题标签 -->
            <view class="tag-list" v-if="selectedTopics.length > 0">
                <view class="tag-item" v-for="(topic, index) in selectedTopics" :key="index">
                    <text class="tag-text">#{{ topic }}</text>
                    <text class="tag-close" @tap="removeTopic(index)">✕</text>
                </view>
            </view>

            <!-- 位置信息 -->
            <view class="location-info" v-if="location">
                <text class="location-icon">📍</text>
                <text class="location-name">{{ location }}</text>
                <text class="location-close" @tap="removeLocation">✕</text>
            </view>

            <!-- 底部留白 -->
            <view style="height: 120rpx;"></view>

            <!-- 底部工具栏 -->
            <view class="bottom-toolbar">
                <view class="tool-list">
                    <view class="tool-btn" @tap="chooseImage">
                        <text class="tool-emoji">🖼️</text>
                    </view>
                    <view class="tool-btn" @tap="addTopic">
                        <text class="tool-emoji">#️⃣</text>
                    </view>
                    <view class="tool-btn" @tap="addLocation">
                        <text class="tool-emoji">📍</text>
                    </view>
                </view>
                <view class="word-count">
                    <text class="count-num">{{ content.length }}</text>
                    <text class="count-max">/5000</text>
                </view>
                <view class="publish-btn" @tap="publish" :class="{ disabled: !canPublish }">
                    <text class="btn-text">发布</text>
                </view>
            </view>
        </view>

        <!-- 话题选择弹窗 -->
        <view class="modal-mask" v-if="showTopicModal" @tap="closeTopicModal">
            <view class="modal-container" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">选择话题</text>
                    <text class="modal-close" @tap="closeTopicModal">✕</text>
                </view>
                <scroll-view class="modal-body" scroll-y>
                    <view class="topic-grid">
                        <view class="topic-option" v-for="(topic, index) in hotTopics" :key="index"
                            @tap="selectTopic(topic)" :class="{ active: isTopicSelected(topic) }">
                            <view class="option-content">
                                <text class="option-text">#{{ topic }}</text>
                                <text class="option-check" v-if="isTopicSelected(topic)">✓</text>
                            </view>
                        </view>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const title = ref('')
const content = ref('')
const imageList = ref([])
const selectedTopics = ref([])
const location = ref('')
const showTopicModal = ref(false)
const topicKeyword = ref('')

// 热门话题
const hotTopics = ref([
    '期末复习',
    '校园美食',
    '实习经验',
    '考研交流',
    '社团招新',
    '技术分享',
    '运动健身',
    '摄影',
    '学习方法',
    '四六级',
    '求职',
    '校园生活'
])

// 是否可以发布
const canPublish = computed(() => {
    return content.value.trim().length > 0 || imageList.value.length > 0
})

onLoad(() => {
    console.log('发布帖子页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【发布帖子页面 - 后端接口需求文档】')
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
        type: 'post' // 上传类型标识
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            url: 'https://example.com/uploads/post/xxxxx.jpg'
        }
    }, null, 2))
    console.log('📝 图片限制: 最多9张,每张最大5MB,支持jpg/png格式')
    console.log('\n')

    console.log('📍 接口2: 发布帖子')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/posts')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        content: '帖子内容',
        images: [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg'
        ],
        tags: ['数据分析', '学习'], // 可选
        location: '图书馆' // 可选
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
    console.log('📝 内容不能为空,至少10个字符')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 返回
const goBack = () => {
    if (content.value.trim() || imageList.value.length > 0) {
        uni.showModal({
            title: '提示',
            content: '内容尚未发布，确定要退出吗？',
            success: (res) => {
                if (res.confirm) {
                    uni.navigateBack()
                }
            }
        })
    } else {
        uni.navigateBack()
    }
}

// 选择图片
const chooseImage = () => {
    const count = 9 - imageList.value.length
    uni.chooseImage({
        count: count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            imageList.value = imageList.value.concat(res.tempFilePaths)
        }
    })
}

// 删除图片
const deleteImage = (index) => {
    imageList.value.splice(index, 1)
}

// 添加话题
const addTopic = () => {
    showTopicModal.value = true
}

// 关闭话题弹窗
const closeTopicModal = () => {
    showTopicModal.value = false
    topicKeyword.value = ''
}

// 选择话题
const selectTopic = (topic) => {
    const index = selectedTopics.value.indexOf(topic)
    if (index > -1) {
        selectedTopics.value.splice(index, 1)
    } else {
        if (selectedTopics.value.length >= 5) {
            uni.showToast({
                title: '最多选择5个话题',
                icon: 'none'
            })
            return
        }
        selectedTopics.value.push(topic)
    }
}

// 判断话题是否已选择
const isTopicSelected = (topic) => {
    return selectedTopics.value.includes(topic)
}

// 移除话题
const removeTopic = (index) => {
    selectedTopics.value.splice(index, 1)
}

// 添加位置
const addLocation = () => {
    uni.chooseLocation({
        success: (res) => {
            location.value = res.name || res.address
        }
    })
}

// 移除位置
const removeLocation = () => {
    location.value = ''
}

// 更多设置
const showMore = () => {
    uni.showActionSheet({
        itemList: ['设置封面', '仅自己可见', '允许评论'],
        success: (res) => {
            console.log('选择了：' + res.tapIndex)
        }
    })
}

// 发布
const publish = () => {
    if (!canPublish.value) {
        uni.showToast({
            title: '请输入内容或添加图片',
            icon: 'none'
        })
        return
    }

    uni.showLoading({
        title: '发布中...'
    })

    // 模拟发布请求
    setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 2000
        })

        setTimeout(() => {
            uni.navigateBack()
        }, 2000)
    }, 1500)
}
</script>

<style scoped lang="scss">
.publish-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}

.editor-section {
    padding: 24rpx;
    background-color: #fff;
}

/* 输入框组 */
.input-group {
    position: relative;
    margin-bottom: 24rpx;
}

.title-input {
    width: 100%;
    min-height: 60rpx;
    max-height: 200rpx;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.5;
    padding: 0;
}

.char-limit {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 24rpx;
    color: #999;
}

.content-input {
    width: 100%;
    min-height: 400rpx;
    font-size: 30rpx;
    color: #333;
    line-height: 1.8;
    padding: 0;
}

/* 图片网格 */
.image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.grid-item {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    border-radius: 12rpx;
    overflow: hidden;
    background-color: #f5f5f5;
}

.grid-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.delete-badge {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 40rpx;
    height: 40rpx;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.delete-text {
    color: #fff;
    font-size: 28rpx;
    line-height: 1;
}

.add-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f8f8;
    border: 2rpx dashed #ddd;
}

.add-text {
    font-size: 72rpx;
    color: #ccc;
    line-height: 1;
}

/* 话题标签列表 */
.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 24rpx;
}

.tag-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 10rpx 20rpx;
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    border-radius: 32rpx;
}

.tag-text {
    font-size: 26rpx;
    color: #d85a3e;
    font-weight: 500;
}

.tag-close {
    font-size: 24rpx;
    color: #d85a3e;
    line-height: 1;
}

/* 位置信息 */
.location-info {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 24rpx;
    background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
    border-radius: 12rpx;
    margin-bottom: 24rpx;
}

.location-icon {
    font-size: 28rpx;
}

.location-name {
    flex: 1;
    font-size: 26rpx;
    color: #00838f;
    font-weight: 500;
}

.location-close {
    font-size: 32rpx;
    color: #00838f;
    line-height: 1;
}

/* 底部工具栏 */
.bottom-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx;
    background-color: #fff;
    border-top: 1rpx solid #e8e8e8;
    padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
    position: sticky;
    bottom: 0;
    z-index: 100;
}

.tool-list {
    display: flex;
    gap: 24rpx;
}

.tool-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 16rpx;
    transition: all 0.3s;

    &:active {
        transform: scale(0.9);
    }
}

.tool-emoji {
    font-size: 36rpx;
}

.word-count {
    flex: 1;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4rpx;
}

.count-num {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
}

.count-max {
    font-size: 24rpx;
    color: #999;
}

.publish-btn {
    padding: 14rpx 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 32rpx;
    transition: all 0.3s;

    &.disabled {
        background: #e8e8e8;

        .btn-text {
            color: #999;
        }
    }

    &:active:not(.disabled) {
        transform: scale(0.95);
    }
}

.btn-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
}

/* 弹窗遮罩 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 9999;
}

.modal-container {
    width: 100%;
    max-height: 70vh;
    background-color: #fff;
    border-radius: 32rpx 32rpx 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx 24rpx;
    border-bottom: 1rpx solid #e8e8e8;
}

.modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.modal-close {
    font-size: 48rpx;
    color: #999;
    line-height: 1;
}

.modal-body {
    width: 95%;
    padding: 24rpx;
    overflow-y: auto;
    overflow-x: hidden;
}

.topic-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    width: 100%;
}

.topic-option {
    flex: 1;
    min-width: calc(50% - 6rpx);
    max-width: calc(50% - 6rpx);
    position: relative;
    padding: 24rpx 20rpx;
    background-color: #f8f8f8;
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    box-sizing: border-box;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: transparent;

        .option-text {
            color: #fff;
        }
    }

    &:active {
        transform: scale(0.95);
    }
}

.option-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.option-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    text-align: center;
    word-break: break-all;
}

.option-check {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    font-size: 20rpx;
    color: #fff;
}
</style>

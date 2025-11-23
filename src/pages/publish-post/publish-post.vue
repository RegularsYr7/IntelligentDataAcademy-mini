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
import { uploadImage } from '@/utils/upload'
import { submitPost } from '@/api/community'

const title = ref('')
const content = ref('')
const imageList = ref([]) // 临时图片路径
const uploadedImages = ref([]) // 已上传的图片URL
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

})


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
const chooseImage = async () => {
    // 检查是否已达到上限
    if (imageList.value.length >= 9) {
        uni.showToast({
            title: '最多上传9张图片',
            icon: 'none'
        })
        return
    }

    const count = 9 - imageList.value.length
    uni.chooseImage({
        count: count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            console.log('选择图片成功:', res)

            // 提取文件路径
            let tempPaths = []
            if (res.tempFiles && res.tempFiles.length > 0) {
                // 优先使用 tempFiles
                tempPaths = res.tempFiles.map(file => file.path || file.tempFilePath || '')
            } else {
                // 降级使用 tempFilePaths
                tempPaths = res.tempFilePaths || []
            }

            console.log('待上传的图片路径:', tempPaths)

            // 显示上传进度
            uni.showLoading({
                title: `上传中 0/${tempPaths.length}`,
                mask: true
            })

            try {
                // 逐个上传图片
                for (let i = 0; i < tempPaths.length; i++) {
                    const tempPath = tempPaths[i]

                    if (!tempPath) {
                        console.warn(`第${i + 1}张图片路径为空，跳过`)
                        continue
                    }

                    // 更新进度提示
                    uni.showLoading({
                        title: `上传中 ${i + 1}/${tempPaths.length}`,
                        mask: true
                    })

                    try {
                        console.log(`开始上传第${i + 1}张图片:`, tempPath)

                        // 调用上传接口
                        const result = await uploadImage(tempPath)
                        console.log(`第${i + 1}张图片上传结果:`, result)

                        // 兼容不同的返回格式
                        let imageUrl = ''
                        if (typeof result === 'string') {
                            imageUrl = result
                        } else if (result.url) {
                            imageUrl = result.url
                        } else if (result.fileName) {
                            imageUrl = result.fileName
                        }

                        if (!imageUrl) {
                            throw new Error('上传成功但未返回图片URL')
                        }

                        // 添加到预览列表（使用服务器URL）
                        imageList.value.push(imageUrl)
                        // 添加到已上传URL列表
                        uploadedImages.value.push(imageUrl)

                        console.log(`第${i + 1}张图片上传成功:`, imageUrl)
                    } catch (error) {
                        console.error(`第${i + 1}张图片上传失败:`, error)
                        uni.showToast({
                            title: `第${i + 1}张上传失败`,
                            icon: 'none',
                            duration: 1500
                        })
                        // 继续上传下一张
                    }
                }

                uni.hideLoading()

                if (uploadedImages.value.length > 0) {
                    uni.showToast({
                        title: `成功上传${uploadedImages.value.length}张`,
                        icon: 'success',
                        duration: 1500
                    })
                }
            } catch (error) {
                uni.hideLoading()
                console.error('上传过程出错:', error)
                uni.showToast({
                    title: '上传失败',
                    icon: 'none'
                })
            }
        },
        fail: (error) => {
            console.error('选择图片失败:', error)
            uni.showToast({
                title: '选择图片失败',
                icon: 'none'
            })
        }
    })
}// 删除图片
const deleteImage = (index) => {
    imageList.value.splice(index, 1)
    uploadedImages.value.splice(index, 1)
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
const publish = async () => {
    if (!canPublish.value) {
        uni.showToast({
            title: '请输入内容或添加图片',
            icon: 'none'
        })
        return
    }

    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (!userInfo || !userInfo.studentId) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        setTimeout(() => {
            uni.navigateTo({
                url: '/pages/login/login'
            })
        }, 1500)
        return
    }

    uni.showLoading({
        title: '发布中...',
        mask: true
    })

    try {
        // 构建发布数据
        const postData = {
            studentId: userInfo.studentId,
            postType: '1', // 默认为普通帖子
            title: title.value.trim() || '',
            content: content.value.trim(),
            images: uploadedImages.value.join(','), // 多张图片用逗号分隔
            tags: selectedTopics.value.join(','), // 多个标签用逗号分隔
            location: location.value || '',
            studentName: userInfo.name || userInfo.studentName || '',
            studentAvatar: userInfo.avatar || ''
        }

        console.log('发布帖子数据:', postData)

        // 调用发布接口
        const result = await submitPost(postData)

        uni.hideLoading()

        uni.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 2000
        })

        // 设置刷新标志，通知上一页刷新
        uni.setStorageSync('refreshQaList', true)

        setTimeout(() => {
            // 返回上一页并刷新
            uni.navigateBack({
                delta: 1
            })
        }, 2000)
    } catch (error) {
        uni.hideLoading()
        console.error('发布失败:', error)
        uni.showToast({
            title: error.message || '发布失败，请重试',
            icon: 'none',
            duration: 2000
        })
    }
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
    aspect-ratio: 1;
    border-radius: 12rpx;
    overflow: hidden;
    background-color: #f5f5f5;
}

.grid-image {
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
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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

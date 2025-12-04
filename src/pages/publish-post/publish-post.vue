<template>
    <view class="publish-page">
        <view class="editor-section">
            <!-- 标题输入 -->
            <view class="input-group">
                <textarea class="title-input" placeholder="标题（选填）" v-model="title" maxlength="50"
                    :adjust-position="false" :show-confirm-bar="false" />
                <text class="char-limit" v-if="title.length > 0">{{ title.length }}/50</text>
            </view>

            <!-- 内容输入 -->
            <view class="input-group content-group">
                <textarea class="content-input" placeholder="分享你的想法..." v-model="content" maxlength="5000"
                    :adjust-position="false" :show-confirm-bar="false" />
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

            <!-- 分类标签 -->
            <view class="tag-list" v-if="selectedCategory">
                <view class="tag-item">
                    <text class="tag-icon">{{ selectedCategory.icon }}</text>
                    <text class="tag-text">{{ selectedCategory.name }}</text>
                    <text class="tag-close" @tap="removeCategory">✕</text>
                </view>
            </view>

            <!-- 位置信息 -->
            <view class="location-info" v-if="location">
                <text class="location-icon">📍</text>
                <text class="location-name">{{ location }}</text>
                <text class="location-close" @tap="removeLocation">✕</text>
            </view>

            <!-- 底部留白，根据键盘高度动态调整 -->
            <view :style="{ height: (120 + (keyboardHeight ? keyboardHeight * 2 : 0)) + 'rpx' }"></view>

            <!-- 底部工具栏 -->
            <view class="bottom-toolbar" :style="{ bottom: keyboardHeight + 'px' }">
                <view class="tool-list">
                    <view class="tool-btn" @tap="chooseImage">
                        <text class="tool-emoji">🖼️</text>
                    </view>
                    <view class="tool-btn" @tap="addCategory">
                        <text class="tool-emoji">📂</text>
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

        <!-- 分类选择弹窗 -->
        <view class="modal-mask" v-if="showCategoryModal" @tap="closeCategoryModal">
            <view class="modal-container" @tap.stop>
                <view class="modal-header">
                    <text class="modal-title">选择分类</text>
                    <text class="modal-close" @tap="closeCategoryModal">✕</text>
                </view>
                <scroll-view class="modal-body" scroll-y>
                    <view class="category-grid">
                        <view class="category-option" v-for="(category, index) in categories" :key="index"
                            @tap="selectCategory(category)" :class="{ active: isCategorySelected(category) }">
                            <view class="option-content">
                                <text class="option-icon">{{ category.icon }}</text>
                                <text class="option-text">{{ category.name }}</text>
                                <text class="option-check" v-if="isCategorySelected(category)">✓</text>
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
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { uploadImage } from '@/utils/upload'
import { submitPost, getPostTypesMap, checkTodayImageCount } from '@/api/community'

const title = ref('')
const content = ref('')
const imageList = ref([]) // 临时图片路径
const uploadedImages = ref([]) // 已上传的图片URL
const selectedCategory = ref(null) // 修改：单个分类对象
const location = ref('')
const showCategoryModal = ref(false) // 修改：改为分类弹窗
const keyboardHeight = ref(0) // 键盘高度

// 分类列表
const categories = ref([])

// 图标映射
const getIconByType = (type) => {
    const iconMap = {
        '1': '📚',  // 学习
        '2': '🏠',  // 生活
        '3': '🎉',  // 活动
        '4': '💼',  // 求职
        '5': '🍜',  // 美食
        '6': '⚽',  // 运动
        '7': '💻'   // 技术
    }
    return iconMap[type] || '📝'
}

// 是否可以发布
const canPublish = computed(() => {
    return content.value.trim().length > 0 || imageList.value.length > 0
})

// 加载帖子分类
const loadPostCategories = async () => {
    try {
        const res = await getPostTypesMap()
        console.log('帖子类型映射原始数据:', res)

        // 接口直接返回数组
        const dataArray = Array.isArray(res) ? res : (res.data || [])
        console.log('数据数组:', dataArray)

        if (Array.isArray(dataArray) && dataArray.length > 0) {
            categories.value = dataArray.map(item => ({
                id: item.value,
                name: item.label,
                icon: getIconByType(item.value)
            }))
            console.log('转换后的分类:', categories.value)
        }
    } catch (error) {
        console.error('加载帖子分类失败:', error)
    }
}

onLoad(() => {
    console.log('发布帖子页面加载')
    loadPostCategories()

    // 监听键盘高度变化
    uni.onKeyboardHeightChange(res => {
        keyboardHeight.value = res.height
    })
})

onUnload(() => {
    // 取消监听键盘高度变化
    uni.offKeyboardHeightChange()
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
    // 检查是否已达到单次上传上限
    if (imageList.value.length >= 9) {
        uni.showToast({
            title: '最多上传9张图片',
            icon: 'none'
        })
        return
    }

    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (!userInfo) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        })
        return
    }

    // 检查今日已上传图片数量
    try {

        const res = await checkTodayImageCount()
        console.log('checkTodayImageCount 完整返回:', res)
        console.log('res.data:', res.data)
        const todayCount = res.data !== undefined ? res.data : 0
        console.log('todayCount:', todayCount)



        // 检查是否超过今日上传限制
        if (todayCount >= 20) {
            uni.showModal({
                title: '提示',
                content: '您今天已上传20张图片,已达到每日上限,请明天再来吧~',
                showCancel: false,
                confirmText: '知道了',
                confirmColor: '#667eea'
            })
            return
        }

        // 计算还可以上传的数量
        const remainingToday = 20 - todayCount
        const remainingInPost = 9 - imageList.value.length
        const maxCount = Math.min(remainingToday, remainingInPost)

        if (maxCount <= 0) {
            uni.showToast({
                title: '今日上传已达上限',
                icon: 'none'
            })
            return
        }

        // 如果剩余数量小于用户可能选择的数量,提示用户
        if (remainingToday < remainingInPost) {
            const result = await uni.showModal({
                title: '温馨提示',
                content: `您今天还可以上传${remainingToday}张图片,是否继续?`,
                confirmText: '继续上传',
                confirmColor: '#667eea'
            })

            if (!result.confirm) {
                return
            }
        }

        selectAndUploadImages(maxCount)
    } catch (error) {

        console.error('检查上传数量失败:', error)
        uni.showToast({
            title: error.msg || '检查失败,请稍后重试',
            icon: 'none'
        })
    }
}

// 选择并上传图片
const selectAndUploadImages = (count) => {
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



            try {
                // 逐个上传图片
                for (let i = 0; i < tempPaths.length; i++) {
                    const tempPath = tempPaths[i]

                    if (!tempPath) {
                        console.warn(`第${i + 1}张图片路径为空，跳过`)
                        continue
                    }



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

                        // 检查是否是达到上传限制的错误
                        const errorMsg = error.msg || error.message || '上传失败'
                        if (errorMsg.includes('已达到每日上限') || errorMsg.includes('上传20张')) {

                            uni.showModal({
                                title: '提示',
                                content: errorMsg,
                                showCancel: false,
                                confirmText: '知道了',
                                confirmColor: '#667eea'
                            })
                            // 达到上限，停止继续上传
                            break
                        }

                        uni.showToast({
                            title: `第${i + 1}张上传失败`,
                            icon: 'none',
                            duration: 1500
                        })
                        // 继续上传下一张
                    }
                }



                if (uploadedImages.value.length > 0) {
                    uni.showToast({
                        title: `成功上传${uploadedImages.value.length}张`,
                        icon: 'none',
                        duration: 1500
                    })
                }
            } catch (error) {

                console.error('上传过程出错:', error)
                uni.showToast({
                    title: '上传失败',
                    icon: 'none'
                })
            }
        },
        fail: (error) => {
            console.error('选择图片失败:', error)

        }
    })
}// 删除图片
const deleteImage = (index) => {
    imageList.value.splice(index, 1)
    uploadedImages.value.splice(index, 1)
}

// 添加分类
const addCategory = () => {
    showCategoryModal.value = true
}

// 关闭分类弹窗
const closeCategoryModal = () => {
    showCategoryModal.value = false
}

// 选择分类
const selectCategory = (category) => {
    if (selectedCategory.value && selectedCategory.value.id === category.id) {
        // 如果点击已选中的分类，取消选择
        selectedCategory.value = null
    } else {
        // 选择新分类
        selectedCategory.value = category
    }
}

// 判断分类是否已选择
const isCategorySelected = (category) => {
    return selectedCategory.value && selectedCategory.value.id === category.id
}

// 移除分类
const removeCategory = () => {
    selectedCategory.value = null
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
    if (!userInfo) {
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


    try {
        // 构建发布数据
        const postData = {
            postType: selectedCategory.value ? selectedCategory.value.id : '1', // 使用选择的分类ID，默认为1
            title: title.value.trim() || '',
            content: content.value.trim(),
            images: uploadedImages.value.join(','), // 多张图片用逗号分隔
            tags: '', // 暂时不使用标签
            location: location.value || '',
            studentName: userInfo.name || userInfo.studentName || '',
            studentAvatar: userInfo.avatar || ''
        }

        console.log('发布帖子数据:', postData)

        // 调用发布接口
        const result = await submitPost(postData)



        uni.showToast({
            title: '发布成功',
            icon: 'none',
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
    height: 100vh;
    background-color: #f7f8fa;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.editor-section {
    flex: 1;
    margin: 20rpx;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

/* 输入框组 */
.input-group {
    position: relative;
    margin-bottom: 30rpx;
}

.content-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 400rpx;
}

.title-input {
    width: 100%;
    min-height: 80rpx;
    max-height: 200rpx;
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
    padding: 10rpx 0;
    border-bottom: 2rpx solid #f0f0f0;
}

.char-limit {
    position: absolute;
    right: 0;
    bottom: 16rpx;
    font-size: 24rpx;
    color: #ccc;
}

.content-input {
    width: 100%;
    height: 100%;
    min-height: 400rpx;
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    padding: 10rpx 0;
}

/* 图片网格 */
.image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    margin-bottom: 30rpx;
}

.grid-item {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 16rpx;
    overflow: hidden;
    background-color: #f5f5f5;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.grid-image {
    width: 100%;
    height: 100%;
}

.delete-badge {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    width: 44rpx;
    height: 44rpx;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s;

    &:active {
        transform: scale(0.9);
        background-color: rgba(0, 0, 0, 0.7);
    }
}

.delete-text {
    color: #fff;
    font-size: 24rpx;
    line-height: 1;
}

.add-item {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9f9f9;
    border: 2rpx dashed #e0e0e0;
    transition: all 0.3s;

    &:active {
        background-color: #f0f0f0;
        border-color: #ccc;
    }
}

.add-text {
    font-size: 60rpx;
    color: #ccc;
    line-height: 1;
    font-weight: 300;
}

/* 话题标签列表 */
.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.tag-item {
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
    padding: 12rpx 24rpx;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border-radius: 40rpx;
    box-shadow: 0 2rpx 10rpx rgba(25, 118, 210, 0.1);
}

.tag-icon {
    font-size: 30rpx;
}

.tag-text {
    font-size: 26rpx;
    color: #1565c0;
    font-weight: 600;
}

.tag-close {
    font-size: 24rpx;
    color: #1565c0;
    opacity: 0.6;
    margin-left: 4rpx;
}

/* 位置信息 */
.location-info {
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
    padding: 12rpx 24rpx;
    background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
    border-radius: 40rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 131, 143, 0.1);
}

.location-icon {
    font-size: 30rpx;
}

.location-name {
    font-size: 26rpx;
    color: #006064;
    font-weight: 600;
    max-width: 400rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.location-close {
    font-size: 24rpx;
    color: #006064;
    opacity: 0.6;
    margin-left: 4rpx;
}

/* 底部工具栏 */
.bottom-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.03);
}

.tool-list {
    display: flex;
    gap: 30rpx;
}

.tool-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border-radius: 20rpx;
    transition: all 0.3s;

    &:active {
        transform: scale(0.92);
        background-color: #eef1f5;
    }
}

.tool-emoji {
    font-size: 40rpx;
}

.word-count {
    flex: 1;
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    margin-right: 30rpx;
    gap: 2rpx;
}

.count-num {
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
}

.count-max {
    font-size: 24rpx;
    color: #ccc;
}

.publish-btn {
    padding: 0 48rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    border-radius: 36rpx;
    transition: all 0.3s;
    box-shadow: 0 4rpx 12rpx rgba(24, 40, 72, 0.2);

    &.disabled {
        background: #e0e0e0;
        box-shadow: none;
        pointer-events: none;

        .btn-text {
            color: #999;
        }
    }

    &:active:not(.disabled) {
        transform: scale(0.96);
        box-shadow: 0 2rpx 6rpx rgba(24, 40, 72, 0.2);
    }
}

.btn-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 600;
    letter-spacing: 2rpx;
}

/* 弹窗遮罩 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: flex-end;
    z-index: 9999;
    transition: opacity 0.3s;
}

.modal-container {
    width: 100%;
    max-height: 75vh;
    background-color: #fff;
    border-radius: 40rpx 40rpx 0 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 -4rpx 30rpx rgba(0, 0, 0, 0.1);
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
    padding: 36rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.modal-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
}

.modal-close {
    font-size: 40rpx;
    color: #999;
    padding: 10rpx;
    line-height: 1;
}

.modal-body {
    width: 100%;
    padding: 30rpx;
    box-sizing: border-box;
    overflow-y: auto;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    width: 100%;
    padding-bottom: 40rpx;
}

.category-option {
    position: relative;
    padding: 24rpx;
    background-color: #f9f9f9;
    border-radius: 20rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    box-sizing: border-box;
    width: 100%;

    &.active {
        background: #f0f7ff;
        border-color: #4b6cb7;
        box-shadow: 0 4rpx 12rpx rgba(75, 108, 183, 0.1);

        .option-text {
            color: #4b6cb7;
            font-weight: 600;
        }

        .option-icon {
            transform: scale(1.1);
        }
    }

    &:active {
        transform: scale(0.98);
    }
}

.option-content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 16rpx;
}

.option-icon {
    font-size: 48rpx;
    transition: transform 0.3s;
}

.option-text {
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
    text-align: center;
    transition: color 0.3s;
}

.option-check {
    position: absolute;
    top: 10rpx;
    right: 10rpx;
    width: 32rpx;
    height: 32rpx;
    background-color: #4b6cb7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20rpx;
    box-shadow: 0 2rpx 6rpx rgba(75, 108, 183, 0.3);
}
</style>

<template>
    <view class="page">
        <view class="container">
            <!-- 顶部信息卡片 -->
            <view class="info-card">
                <text class="card-title">📍 {{ taskInfo?.taskName || '班级签到' }}</text>
                <view class="time-info">
                    <text class="current-time">{{ currentTime }}</text>
                    <text class="current-date">{{ currentDate }}</text>
                </view>
                <view class="task-time-range" v-if="taskInfo">
                    <text class="time-range-label">签到时间</text>
                    <text class="time-range-text">{{ taskInfo.startTime }} - {{ taskInfo.endTime }}</text>
                </view>
            </view>

            <!-- 位置信息 -->
            <view class="location-card">
                <view class="card-header">
                    <text class="card-icon">🌍</text>
                    <text class="card-label">当前位置</text>
                </view>
                <view class="location-info" v-if="location.latitude">
                    <text class="location-text">{{ location.address || '正在获取详细地址...' }}</text>
                    <text class="location-coords">经度: {{ location.longitude.toFixed(6) }} | 纬度: {{
                        location.latitude.toFixed(6) }}</text>
                </view>
                <view class="location-loading" v-else>
                    <text class="loading-text">{{ locationStatus }}</text>
                </view>
            </view>

            <!-- 拍照区域 -->
            <view class="photo-card">
                <view class="card-header">
                    <text class="card-icon">📷</text>
                    <text class="card-label">签到照片</text>
                    <text class="required-tag">必填</text>
                </view>
                <view class="photo-content">
                    <view class="photo-preview" v-if="photoPath">
                        <image class="preview-image" :src="photoPath" mode="aspectFill"></image>
                        <view class="photo-actions">
                            <button class="action-btn retake-btn" @tap="takePhoto">
                                <text class="btn-icon">🔄</text>
                                <text>重拍</text>
                            </button>
                        </view>
                    </view>
                    <view class="photo-placeholder" v-else @tap="takePhoto">
                        <text class="placeholder-icon">📸</text>
                        <text class="placeholder-text">点击拍照</text>
                        <text class="placeholder-tip">请确保人脸清晰可见</text>
                    </view>
                </view>
            </view>

            <!-- 签到说明 -->
            <view class="tips-card">
                <view class="tip-item">
                    <text class="tip-icon">✓</text>
                    <text class="tip-text">请在指定地点进行签到</text>
                </view>
                <view class="tip-item">
                    <text class="tip-icon">✓</text>
                    <text class="tip-text">拍照时请保持光线充足</text>
                </view>
                <view class="tip-item">
                    <text class="tip-icon">✓</text>
                    <text class="tip-text">确保人脸清晰完整</text>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="footer-actions">
                <button class="action-btn secondary-btn" @tap="viewRecords">
                    <text>签到记录</text>
                </button>
                <button class="action-btn primary-btn" @tap="submitSignIn" :disabled="!canSubmit">
                    <text>{{ submitting ? '提交中...' : '提交签到' }}</text>
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { submitCheckin, getCurrentTask } from '@/api/checkin'
import { takePhotoAndUpload } from '@/utils/upload'
import { getAddress } from '@/utils/geocode'

// 任务ID和任务信息
const taskId = ref('')
const taskInfo = ref(null)

// 当前时间和日期
const currentTime = ref('')
const currentDate = ref('')
let timeInterval = null

// 位置信息
const location = ref({
    latitude: null,
    longitude: null,
    address: ''
})
const locationStatus = ref('正在获取位置信息...')

// 照片路径和URL
const photoPath = ref('') // 本地临时路径（用于显示）
const photoUrl = ref('') // 服务器URL（用于提交）

// 提交状态
const submitting = ref(false)

// 是否可以提交
const canSubmit = computed(() => {
    return taskId.value && location.value.latitude && photoUrl.value && !submitting.value
})

// 格式化任务时间
const formatTaskTime = (timeStr) => {
    if (!timeStr) return ''
    // 如果是完整时间格式 "2025-11-19 08:00:00"，提取时分
    const match = timeStr.match(/(\d{2}):(\d{2})/)
    return match ? `${match[1]}:${match[2]}` : timeStr
}

// 更新时间
const updateTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    currentTime.value = `${hours}:${minutes}:${seconds}`

    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const day = days[now.getDay()]
    currentDate.value = `${year}年${month}月${date}日 星期${day}`
}

// 获取位置信息
const getLocation = () => {
    locationStatus.value = '正在获取位置信息...'

    uni.getLocation({
        type: 'gcj02',
        success: async (res) => {
            location.value = {
                latitude: res.latitude,
                longitude: res.longitude,
                address: ''
            }
            locationStatus.value = '位置获取成功，正在解析地址...'

            // 获取真实地址
            try {
                const address = await getAddress(res.latitude, res.longitude)
                location.value.address = address
                locationStatus.value = '地址解析成功'
            } catch (error) {
                console.error('地址解析失败', error)
                location.value.address = '未获取到地址信息'
                locationStatus.value = '地址解析失败'
            }
        },
        fail: (err) => {
            console.error('获取位置失败', err)
            locationStatus.value = '位置获取失败，请检查定位权限'
            uni.showModal({
                title: '定位失败',
                content: '无法获取您的位置信息，请确保已授予定位权限',
                showCancel: false
            })
        }
    })
}

// 拍照
const takePhoto = async () => {
    try {
        // 拍照并自动上传
        const result = await takePhotoAndUpload()

        // 保存本地路径（用于显示）和服务器URL（用于提交）
        photoPath.value = result.url // 用服务器URL显示
        photoUrl.value = result.url

        uni.showToast({
            title: '照片已上传',
            icon: 'success'
        })
    } catch (error) {
        console.error('拍照或上传失败', error)
        uni.showToast({
            title: error.message || '拍照失败',
            icon: 'none'
        })
    }
}

// 获取当前签到任务
const loadCurrentTask = async () => {
    try {
        const res = await getCurrentTask()
        console.log('获取签到任务返回:', res)

        if (res && res.taskId) {
            taskInfo.value = res
            taskId.value = String(res.taskId) // 转换为字符串
            console.log('获取签到任务成功, taskId:', taskId.value)
        } else {
            uni.showModal({
                title: '提示',
                content: '当前没有可用的签到任务',
                showCancel: false,
                success: () => {
                    uni.navigateBack()
                }
            })
        }
    } catch (error) {
        console.error('获取签到任务失败:', error)
        uni.showModal({
            title: '获取任务失败',
            content: error.message || '无法获取签到任务信息',
            showCancel: false,
            success: () => {
                uni.navigateBack()
            }
        })
    }
}

// 提交签到
const submitSignIn = async () => {
    if (!canSubmit.value) {
        if (!taskId.value) {
            uni.showToast({
                title: '签到任务加载中',
                icon: 'none'
            })
        } else if (!location.value.latitude) {
            uni.showToast({
                title: '请等待位置获取',
                icon: 'none'
            })
        } else if (!photoPath.value) {
            uni.showToast({
                title: '请先拍照',
                icon: 'none'
            })
        }
        return
    }

    submitting.value = true

    try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '未找到学生信息',
                icon: 'none'
            })
            submitting.value = false
            return
        }

        // 调用签到接口
        await submitCheckin({
            taskId: Number(taskId.value),           // 转换为数字
            studentId: Number(userInfo.studentId),  // 学生ID
            latitude: location.value.latitude,       // 纬度
            longitude: location.value.longitude,     // 经度
            address: location.value.address || '',   // 地址
            photoUrl: photoUrl.value                 // 自拍照片URL
        })

        uni.showToast({
            title: '签到成功',
            icon: 'success'
        })

        // 1秒后跳转到签到记录页
        setTimeout(() => {
            uni.redirectTo({
                url: '/pages/sign-in-records/sign-in-records'
            })
        }, 1000)
    } catch (error) {
        console.error('签到失败', error)
        uni.showToast({
            title: error.message || '签到失败',
            icon: 'none'
        })
    } finally {
        submitting.value = false
    }
}

// 查看签到记录
const viewRecords = () => {
    uni.navigateTo({
        url: '/pages/sign-in-records/sign-in-records'
    })
}

onLoad((options) => {
    console.log('班级签到页加载')

    // 初始化页面数据
    updateTime()
    getLocation()
    loadCurrentTask() // 获取当前签到任务
})


onMounted(() => {
    // 每秒更新时间
    timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
    if (timeInterval) {
        clearInterval(timeInterval)
    }
})
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding: 20rpx;
    padding-bottom: 140rpx;
}

/* 信息卡片 */
.info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 20rpx;
    text-align: center;
}

.card-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 20rpx;
}

.time-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.current-time {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    letter-spacing: 2rpx;
}

.current-date {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

.task-time-range {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.time-range-label {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.8);
}

.time-range-text {
    font-size: 26rpx;
    color: #fff;
    font-weight: 500;
}

/* 位置卡片 */
.location-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.card-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.card-label {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
}

.required-tag {
    font-size: 22rpx;
    color: #f5576c;
    background: rgba(245, 87, 108, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
}

.location-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.location-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
}

.location-coords {
    font-size: 24rpx;
    color: #999;
}

.location-loading {
    text-align: center;
    padding: 20rpx 0;
}

.loading-text {
    font-size: 26rpx;
    color: #999;
}

/* 拍照卡片 */
.photo-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.photo-content {
    margin-top: 20rpx;
}

.photo-preview {
    position: relative;
}

.preview-image {
    width: 100%;
    aspect-ratio: 3/4;
    border-radius: 12rpx;
    background: #f5f5f5;
}

.photo-actions {
    margin-top: 16rpx;
    display: flex;
    justify-content: center;
}

.retake-btn {
    background: #f5f5f5;
    color: #666;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 40rpx;
    height: 70rpx;
    border-radius: 35rpx;
    border: none;
}

.btn-icon {
    font-size: 32rpx;
}

.photo-placeholder {
    aspect-ratio: 3/4;
    border: 2rpx dashed #ddd;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    background: #fafafa;
}

.placeholder-icon {
    font-size: 80rpx;
}

.placeholder-text {
    font-size: 30rpx;
    color: #666;
    font-weight: bold;
}

.placeholder-tip {
    font-size: 24rpx;
    color: #999;
}

/* 提示卡片 */
.tips-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.tip-item {
    display: flex;
    align-items: center;
    padding: 12rpx 0;
}

.tip-icon {
    font-size: 28rpx;
    color: #52c41a;
    margin-right: 12rpx;
}

.tip-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
}

/* 底部按钮 */
.footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx;
    display: flex;
    gap: 20rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.action-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    border: none;
}

.secondary-btn {
    background: #f5f5f5;
    color: #666;
}

.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-weight: bold;

    &[disabled] {
        opacity: 0.5;
    }
}
</style>

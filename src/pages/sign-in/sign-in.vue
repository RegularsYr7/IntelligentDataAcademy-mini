<template>
    <view class="page">
        <view class="container">
            <!-- 顶部信息卡片 -->
            <view class="info-card">
                <text class="card-title">📍 班级签到</text>
                <view class="time-info">
                    <text class="current-time">{{ currentTime }}</text>
                    <text class="current-date">{{ currentDate }}</text>
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

// 照片路径
const photoPath = ref('')

// 提交状态
const submitting = ref(false)

// 是否可以提交
const canSubmit = computed(() => {
    return location.value.latitude && photoPath.value && !submitting.value
})

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
    uni.getLocation({
        type: 'gcj02',
        success: (res) => {
            location.value = {
                latitude: res.latitude,
                longitude: res.longitude,
                address: ''
            }
            locationStatus.value = '位置获取成功'

            // 获取详细地址（需要配置地图服务）
            // 这里使用模拟数据
            setTimeout(() => {
                location.value.address = '北京市海淀区中关村大街1号'
            }, 500)
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
const takePhoto = () => {
    uni.chooseImage({
        count: 1,
        sourceType: ['camera'], // 只允许拍照
        success: (res) => {
            photoPath.value = res.tempFilePaths[0]
            uni.showToast({
                title: '照片已添加',
                icon: 'success'
            })
        },
        fail: (err) => {
            console.error('拍照失败', err)
            uni.showToast({
                title: '拍照失败',
                icon: 'none'
            })
        }
    })
}

// 提交签到
const submitSignIn = () => {
    if (!canSubmit.value) {
        if (!location.value.latitude) {
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

    // 模拟提交
    setTimeout(() => {
        submitting.value = false

        // 保存签到记录到本地（实际应该调用API）
        const record = {
            id: Date.now(),
            time: new Date().toISOString(),
            photo: photoPath.value,
            location: location.value,
            status: 'success'
        }

        // 获取历史记录
        const records = uni.getStorageSync('signInRecords') || []
        records.unshift(record)
        uni.setStorageSync('signInRecords', records)

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
    }, 1500)
}

// 查看签到记录
const viewRecords = () => {
    uni.navigateTo({
        url: '/pages/sign-in-records/sign-in-records'
    })
}

onLoad(() => {
    console.log('班级签到页加载')
    updateTime()
    getLocation()

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【班级签到页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取签到任务列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/sign-in/tasks')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        status: 'ongoing', // ongoing | finished | all
        page: 1,
        pageSize: 10
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            list: [
                {
                    id: 1,
                    title: '数据库原理课',
                    location: '教学楼A301',
                    startTime: '2024-11-05 14:00',
                    endTime: '2024-11-05 14:30',
                    status: 'ongoing', // ongoing | finished | upcoming
                    signedCount: 45,
                    totalCount: 50,
                    isSigned: false,
                    signInTime: null,
                    createTime: '2024-11-05 13:50'
                }
            ],
            total: 25
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 签到')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/sign-in/tasks/:id/sign')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        latitude: 30.845427,
        longitude: 104.464508,
        address: '教学楼A301'
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '签到成功',
        data: {
            signTime: '2024-11-05 14:05',
            isOnTime: true // 是否准时
        }
    }, null, 2))
    console.log('📝 需要在签到时间段内,且位置在签到范围内(通常100米)')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

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

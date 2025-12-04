<template>
    <view class="page">
        <view class="container">
            <!-- 签到照片 -->
            <view class="photo-section">
                <image class="sign-photo" :src="record.photo" mode="aspectFill" @tap="previewPhoto"></image>
                <view class="photo-tip">点击查看大图</view>
            </view>

            <!-- 签到信息卡片 -->
            <view class="info-card">
                <view class="card-title">
                    <text class="title-icon">📋</text>
                    <text class="title-text">签到信息</text>
                </view>

                <view class="info-item">
                    <view class="item-label">
                        <text class="label-icon">🕒</text>
                        <text class="label-text">签到时间</text>
                    </view>
                    <text class="item-value">{{ formatDateTime(record.time) }}</text>
                </view>

                <view class="info-item">
                    <view class="item-label">
                        <text class="label-icon">📍</text>
                        <text class="label-text">签到地点</text>
                    </view>
                    <text class="item-value">{{ record.location.address || '位置未知' }}</text>
                </view>

                <view class="info-item">
                    <view class="item-label">
                        <text class="label-icon">🌍</text>
                        <text class="label-text">经纬度</text>
                    </view>
                    <text class="item-value coords">
                        {{ record.location.longitude?.toFixed(6) || '-' }}, {{ record.location.latitude?.toFixed(6) ||
                            '-' }}
                    </text>
                </view>

                <view class="info-item">
                    <view class="item-label">
                        <text class="label-icon">✓</text>
                        <text class="label-text">签到状态</text>
                    </view>
                    <view class="status-badge" :class="'status-' + record.status">
                        <text>{{ getStatusText(record.status) }}</text>
                    </view>
                </view>
            </view>

            <!-- 地图展示（可选） -->
            <view class="map-card" v-if="record.location.latitude">
                <view class="card-title">
                    <text class="title-icon">🗺️</text>
                    <text class="title-text">位置地图</text>
                </view>
                <view class="map-container">
                    <map class="map" :latitude="record.location.latitude" :longitude="record.location.longitude"
                        :markers="markers" :show-location="false"></map>
                </view>
            </view>

            <!-- 备注信息（如果有） -->
            <view class="remark-card" v-if="record.remark">
                <view class="card-title">
                    <text class="title-icon">📝</text>
                    <text class="title-text">备注信息</text>
                </view>
                <text class="remark-text">{{ record.remark }}</text>
            </view>


        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getRecordDetail } from '@/api/checkin'

// 签到记录详情
const record = ref({
    id: 0,
    time: '',
    photo: '',
    location: {
        latitude: null,
        longitude: null,
        address: ''
    },
    status: '1',
    remark: ''
})

// 加载中状态
const loading = ref(false)

// 地图标记
const markers = computed(() => {
    if (!record.value.location.latitude) return []

    return [{
        id: 1,
        latitude: record.value.location.latitude,
        longitude: record.value.location.longitude,
        iconPath: '/static/marker.png',
        width: 30,
        height: 30
    }]
})

// 加载记录详情
const loadRecordDetail = async (id) => {
    if (!id) {
        uni.showToast({
            title: '记录ID缺失',
            icon: 'none'
        })
        return
    }

    try {
        loading.value = true
        const res = await getRecordDetail(id)

        console.log('签到详情返回:', res)

        // 处理图片URL - 将localhost替换为实际服务器地址
        let photoUrl = res.photoUrl || ''
        if (photoUrl) {
            // 如果是localhost地址,替换为实际服务器地址
            if (photoUrl.includes('localhost')) {
                photoUrl = photoUrl.replace('http://localhost:8081', 'https://intelligentmini.rainyweb.cn')
            }
            // 如果只是相对路径,添加服务器前缀
            else if (photoUrl.startsWith('/profile')) {
                photoUrl = 'https://intelligentmini.rainyweb.cn' + photoUrl
            }
        }

        // 适配后端返回的数据结构
        record.value = {
            id: res.recordId,
            taskId: res.taskId,
            time: res.createTime,          // 使用 createTime 作为签到时间 "2025-11-19 22:01:14"
            photo: photoUrl,
            location: {
                latitude: res.latitude,
                longitude: res.longitude,
                address: res.address || '未获取到地址信息'
            },
            status: res.checkinStatus,  // 1=正常 2=迟到 3=缺勤
            remark: res.remark || '',
            studentName: res.studentName,
            studentNo: res.studentNo
        }

        console.log('签到详情加载成功:', record.value)
        console.log('处理后的图片URL:', photoUrl)
    } catch (error) {
        console.error('获取签到详情失败:', error)

    } finally {
        loading.value = false
    }
}

// 格式化日期时间
const formatDateTime = (timeStr) => {
    const date = new Date(timeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    const days = ['日', '一', '二', '三', '四', '五', '六']
    const dayOfWeek = days[date.getDay()]

    return `${year}年${month}月${day}日 星期${dayOfWeek} ${hours}:${minutes}:${seconds}`
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        '1': '签到成功',
        '2': '迟到',
        '3': '缺勤'
    }
    return statusMap[status] || '未知'
}

// 预览照片
const previewPhoto = () => {
    uni.previewImage({
        urls: [record.value.photo],
        current: record.value.photo
    })
}

// 分享记录
const shareRecord = () => {
    uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
    })
    uni.showToast({
        title: '分享功能',
        icon: 'none'
    })
}

// 返回
const goBack = () => {
    uni.navigateBack()
}

onLoad((options) => {
    const id = options.id
    if (id) {
        loadRecordDetail(id)
    }
})

</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 140rpx;
}

/* 照片区域 */
.photo-section {
    background: #fff;
    padding: 30rpx;
    text-align: center;
}

.sign-photo {
    width: 100%;
    max-width: 500rpx;
    aspect-ratio: 3/4;
    border-radius: 16rpx;
    margin: 0 auto;
}

.photo-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
}

/* 信息卡片 */
.info-card,
.map-card,
.remark-card {
    background: #fff;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
}

.card-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.title-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
        border-bottom: none;
    }
}

.item-label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.label-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
}

.label-text {
    font-size: 28rpx;
    color: #666;
}

.item-value {
    font-size: 28rpx;
    color: #333;
    text-align: right;
    margin-left: 20rpx;
    flex: 1;

    &.coords {
        font-family: monospace;
        font-size: 24rpx;
    }
}

.status-badge {
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;

    // 状态 1=正常
    &.status-1 {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }

    // 状态 2=迟到
    &.status-2 {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    // 状态 3=缺勤
    &.status-3 {
        background: rgba(245, 87, 108, 0.1);
        color: #f5576c;
    }
}

/* 地图容器 */
.map-container {
    width: 100%;
    height: 400rpx;
    border-radius: 12rpx;
    overflow: hidden;
    margin-top: 20rpx;
}

.map {
    width: 100%;
    height: 100%;
}

/* 备注文本 */
.remark-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
}

/* 底部操作栏 */
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
    gap: 8rpx;
    font-size: 28rpx;
    border: none;
}

.btn-icon {
    font-size: 32rpx;
}

.secondary-btn {
    background: #f5f5f5;
    color: #666;
}

.primary-btn {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-weight: bold;
}
</style>

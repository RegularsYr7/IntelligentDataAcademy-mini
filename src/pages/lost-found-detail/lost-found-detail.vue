<template>
    <view class="page">
        <view class="container">
            <!-- 物品照片 -->
            <view class="photo-section">
                <image class="item-photo" :src="item.photo" mode="aspectFill" @tap="previewPhoto"></image>
                <view class="type-badge" :class="'type-' + item.type">
                    <text>{{ getTypeText(item.type) }}</text>
                </view>
            </view>

            <!-- 基本信息卡片 -->
            <view class="info-card">
                <text class="item-title">{{ item.title }}</text>

                <view class="info-grid">
                    <view class="info-item">
                        <text class="info-label">类型</text>
                        <text class="info-value">{{ getTypeText(item.type) }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">状态</text>
                        <view class="status-badge" :class="'status-' + item.status">
                            <text>{{ getStatusText(item.status) }}</text>
                        </view>
                    </view>
                    <view class="info-item full-width">
                        <text class="info-label">地点</text>
                        <text class="info-value">
                            <text class="info-icon">📍</text>
                            {{ item.location }}
                        </text>
                    </view>
                    <view class="info-item full-width">
                        <text class="info-label">时间</text>
                        <text class="info-value">
                            <text class="info-icon">🕒</text>
                            {{ formatDateTime(item.time) }}
                        </text>
                    </view>
                </view>
            </view>

            <!-- 详细描述 -->
            <view class="desc-card">
                <view class="card-title">
                    <text class="title-icon">📝</text>
                    <text class="title-text">详细描述</text>
                </view>
                <text class="desc-text">{{ item.description }}</text>
            </view>

            <!-- 联系方式 -->
            <view class="contact-card">
                <view class="card-title">
                    <text class="title-icon">📞</text>
                    <text class="title-text">联系方式</text>
                </view>
                <view class="contact-info">
                    <view class="contact-user">
                        <image class="user-avatar" :src="item.userAvatar" mode="aspectFill"></image>
                        <text class="user-name">{{ item.userName }}</text>
                    </view>
                    <text class="contact-text">{{ item.contact }}</text>
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="footer-actions">
                <button class="action-btn btn-share" @tap="shareItem">
                    <text class="btn-icon">📤</text>
                    <text class="btn-text">分享</text>
                </button>
                <button class="action-btn btn-contact" @tap="contactUser">
                    <text class="btn-text">联系TA</text>
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 物品详情
const item = ref({
    id: 0,
    type: 'lost',
    title: '',
    description: '',
    photo: '',
    location: '',
    time: '',
    userName: '',
    userAvatar: '',
    contact: '',
    status: 'pending'
})

// 加载详情
const loadItemDetail = (id) => {
    // 从本地存储获取所有数据
    const items = uni.getStorageSync('lostFoundItems') || []

    // 查找对应的项
    const foundItem = items.find(i => i.id == id)

    if (foundItem) {
        item.value = foundItem
    } else {
        // 如果找不到，使用模拟数据
        item.value = {
            id: id,
            type: 'lost',
            title: '丢失一个黑色钱包',
            description: '黑色皮质钱包，内有身份证和银行卡，钱包外侧有明显磨损痕迹。如有拾到，万分感谢！',
            photo: 'https://picsum.photos/800/600?random=' + id,
            location: '图书馆三楼',
            time: new Date().toISOString(),
            userName: '张三',
            userAvatar: 'https://picsum.photos/100/100?random=user' + id,
            contact: '微信: zhangsan123',
            status: 'pending'
        }
    }
}

// 获取类型文本
const getTypeText = (type) => {
    const typeMap = {
        'lost': '失物',
        'found': '招领'
    }
    return typeMap[type] || ''
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待认领',
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

// 预览照片
const previewPhoto = () => {
    uni.previewImage({
        urls: [item.value.photo],
        current: item.value.photo
    })
}

// 分享
const shareItem = () => {
    uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
    })
    uni.showToast({
        title: '分享功能',
        icon: 'none'
    })
}

// 联系用户
const contactUser = () => {
    uni.showModal({
        title: '联系方式',
        content: item.value.contact,
        confirmText: '复制',
        success: (res) => {
            if (res.confirm) {
                uni.setClipboardData({
                    data: item.value.contact,
                    success: () => {
                        uni.showToast({
                            title: '已复制',
                            icon: 'success'
                        })
                    }
                })
            }
        }
    })
}

onLoad((options) => {
    const id = options.id
    if (id) {
        loadItemDetail(id)
    }
    console.log('失物招领详情页加载', id)

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【失物招领详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取失物招领详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/lost-found/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            type: 'lost',
            title: '丢失校园卡',
            description: '11月1日在图书馆遗失校园卡,卡号123456...',
            images: ['https://example.com/img1.jpg'],
            category: '证件',
            location: '图书馆',
            lostTime: '2024-11-01 14:00',
            publisher: {
                id: 1,
                name: '张三',
                avatar: 'https://example.com/avatar.jpg',
                phone: '138****5678' // 部分隐藏
            },
            status: 'processing',
            viewCount: 123,
            createTime: '2024-11-01 15:30',
            contactInfo: {
                phone: '138****5678',
                wechat: 'zhangsan123' // 可选
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 联系发布者')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/lost-found/:id/contact')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('📝 返回完整联系方式,需要登录')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            phone: '13812345678',
            wechat: 'zhangsan123'
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口3: 标记为已解决')
    console.log('━'.repeat(80))
    console.log('请求方式: PUT')
    console.log('接口路径: /api/lost-found/:id/resolve')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('📝 只有发布者本人可以操作')
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
    padding-bottom: 140rpx;
}

/* 照片区域 */
.photo-section {
    position: relative;
    width: 100%;
    height: 500rpx;
}

.item-photo {
    width: 100%;
    height: 100%;
}

.type-badge {
    position: absolute;
    top: 30rpx;
    left: 30rpx;
    padding: 12rpx 30rpx;
    border-radius: 30rpx;
    font-size: 26rpx;
    font-weight: bold;
    backdrop-filter: blur(10rpx);

    &.type-lost {
        background: rgba(245, 87, 108, 0.9);
        color: #fff;
    }

    &.type-found {
        background: rgba(82, 196, 26, 0.9);
        color: #fff;
    }
}

/* 信息卡片 */
.info-card {
    background: #fff;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
}

.item-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    line-height: 1.5;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24rpx;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 12rpx;

    &.full-width {
        grid-column: 1 / -1;
    }
}

.info-label {
    font-size: 24rpx;
    color: #999;
}

.info-value {
    font-size: 28rpx;
    color: #333;
    display: flex;
    align-items: center;
}

.info-icon {
    margin-right: 8rpx;
}

.status-badge {
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    align-self: flex-start;

    &.status-pending {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.status-resolved {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }
}

/* 描述卡片 */
.desc-card,
.contact-card {
    background: #fff;
    margin: 0 20rpx 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
}

.card-title {
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
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.desc-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
}

/* 联系信息 */
.contact-info {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.contact-user {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.user-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
}

.user-name {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
}

.contact-text {
    font-size: 28rpx;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 20rpx 24rpx;
    border-radius: 8rpx;
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

.btn-share {
    background: #f5f5f5;
    color: #666;
}

.btn-contact {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-weight: bold;
}

.btn-text {
    font-size: 28rpx;
}
</style>

<template>
    <view class="page">
        <view class="container">
            <!-- 顶部筛选 -->
            <view class="filter-section">
                <view class="filter-tabs">
                    <view class="filter-tab" :class="{ active: currentType === 'all' }" @tap="changeType('all')">
                        全部
                    </view>
                    <view class="filter-tab" :class="{ active: currentType === 'lost' }" @tap="changeType('lost')">
                        失物
                    </view>
                    <view class="filter-tab" :class="{ active: currentType === 'found' }" @tap="changeType('found')">
                        招领
                    </view>
                </view>
            </view>

            <!-- 失物列表 -->
            <view class="items-list" v-if="filteredItems.length > 0">
                <view class="item-card" v-for="item in filteredItems" :key="item.id" @tap="viewDetail(item.id)">
                    <view class="item-photo">
                        <image class="photo-image" :src="item.photo" mode="aspectFill"></image>
                        <view class="item-type-badge" :class="'type-' + item.type">
                            <text>{{ getTypeText(item.type) }}</text>
                        </view>
                    </view>
                    <view class="item-content">
                        <text class="item-title">{{ item.title }}</text>
                        <view class="item-info">
                            <text class="info-item">
                                <text class="info-icon">📍</text>
                                {{ item.location }}
                            </text>
                            <text class="info-item">
                                <text class="info-icon">🕒</text>
                                {{ formatTime(item.time) }}
                            </text>
                        </view>
                        <view class="item-footer">
                            <view class="user-info">
                                <image class="user-avatar" :src="item.userAvatar" mode="aspectFill"></image>
                                <text class="user-name">{{ item.userName }}</text>
                            </view>
                            <view class="item-status" :class="'status-' + item.status">
                                <text>{{ getStatusText(item.status) }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view class="empty-state" v-else>
                <text class="empty-icon">🔍</text>
                <text class="empty-text">暂无{{ currentType === 'all' ? '' : getTypeText(currentType) }}信息</text>
            </view>

            <!-- 发布按钮 -->
            <view class="publish-btn" @tap="goToPublish">
                <text class="publish-icon">+</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

// 当前类型
const currentType = ref('all')

// 失物招领列表
const items = ref([])

// 加载数据
const loadItems = () => {
    // 从本地存储获取
    const storedItems = uni.getStorageSync('lostFoundItems') || []

    // 如果没有数据，使用模拟数据
    if (storedItems.length === 0) {
        items.value = [
            {
                id: 1,
                type: 'lost',
                title: '丢失一个黑色钱包',
                description: '黑色皮质钱包，内有身份证和银行卡',
                photo: 'https://picsum.photos/400/300?random=wallet',
                location: '图书馆三楼',
                time: new Date(2025, 9, 28, 14, 30).toISOString(),
                userName: '张三',
                userAvatar: 'https://picsum.photos/100/100?random=user1',
                contact: '微信: zhangsan123',
                status: 'pending'
            },
            {
                id: 2,
                type: 'found',
                title: '捡到一把雨伞',
                description: '蓝色折叠伞，在教学楼A座捡到',
                photo: 'https://picsum.photos/400/300?random=umbrella',
                location: '教学楼A座',
                time: new Date(2025, 9, 28, 10, 15).toISOString(),
                userName: '李四',
                userAvatar: 'https://picsum.photos/100/100?random=user2',
                contact: '电话: 13800138000',
                status: 'pending'
            },
            {
                id: 3,
                type: 'lost',
                title: '丢失校园卡',
                description: '校园卡丢失，学号202101001',
                photo: 'https://picsum.photos/400/300?random=card',
                location: '食堂二楼',
                time: new Date(2025, 9, 27, 12, 0).toISOString(),
                userName: '王五',
                userAvatar: 'https://picsum.photos/100/100?random=user3',
                contact: '微信: wangwu456',
                status: 'resolved'
            },
            {
                id: 4,
                type: 'found',
                title: '捡到一副眼镜',
                description: '黑框眼镜，在操场捡到',
                photo: 'https://picsum.photos/400/300?random=glasses',
                location: '操场',
                time: new Date(2025, 9, 26, 16, 45).toISOString(),
                userName: '赵六',
                userAvatar: 'https://picsum.photos/100/100?random=user4',
                contact: '电话: 13900139000',
                status: 'pending'
            }
        ]
    } else {
        items.value = storedItems
    }
}

// 筛选后的列表
const filteredItems = computed(() => {
    if (currentType.value === 'all') {
        return items.value
    }
    return items.value.filter(item => item.type === currentType.value)
})

// 切换类型
const changeType = (type) => {
    currentType.value = type
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

// 格式化时间
const formatTime = (timeStr) => {
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

// 查看详情
const viewDetail = (id) => {
    uni.navigateTo({
        url: `/pages/lost-found-detail/lost-found-detail?id=${id}`
    })
}

// 去发布
const goToPublish = () => {
    uni.navigateTo({
        url: '/pages/lost-found-publish/lost-found-publish'
    })
}

onLoad(() => {
    console.log('失物招领页加载')
    loadItems()

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【失物招领页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取失物招领列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/lost-found')
    console.log('请求参数:')
    console.log(JSON.stringify({
        type: 'all', // all | lost | found
        category: '', // 分类筛选
        keyword: '', // 搜索关键词
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
                    type: 'lost', // lost | found
                    title: '丢失校园卡',
                    description: '11月1日在图书馆...',
                    images: ['https://example.com/img1.jpg'],
                    category: '证件',
                    location: '图书馆',
                    lostTime: '2024-11-01 14:00',
                    publisher: {
                        id: 1,
                        name: '张三',
                        avatar: 'https://example.com/avatar.jpg'
                    },
                    status: 'processing', // processing | resolved
                    viewCount: 123,
                    createTime: '2024-11-01 15:30'
                }
            ],
            total: 45,
            typeCounts: {
                all: 45,
                lost: 28,
                found: 17
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('type类型:')
    console.log('  - lost: 寻物启事')
    console.log('  - found: 失物招领')
    console.log('\ncategory分类:')
    console.log('  - 证件、钥匙、书籍、电子产品、衣物、其他')
    console.log('\nstatus状态:')
    console.log('  - processing: 处理中')
    console.log('  - resolved: 已解决')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

onShow(() => {
    // 页面显示时重新加载(从发布页返回时会刷新)
    loadItems()
})
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}

/* 筛选区域 */
.filter-section {
    background: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
}

.filter-tabs {
    display: flex;
    gap: 20rpx;
}

.filter-tab {
    flex: 1;
    text-align: center;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: #666;
    background: #f5f5f5;
    border-radius: 8rpx;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
        color: #fff;
        font-weight: bold;
    }
}

/* 列表 */
.items-list {
    padding: 0 20rpx;
}

.item-card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
}

.item-photo {
    position: relative;
    width: 100%;
    height: 400rpx;
}

.photo-image {
    width: 100%;
    height: 100%;
}

.item-type-badge {
    position: absolute;
    top: 20rpx;
    left: 20rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    font-size: 24rpx;
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

.item-content {
    padding: 24rpx;
}

.item-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
}

.item-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-bottom: 20rpx;
}

.info-item {
    font-size: 26rpx;
    color: #666;
    display: flex;
    align-items: center;
}

.info-icon {
    margin-right: 8rpx;
}

.item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.user-avatar {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
}

.user-name {
    font-size: 26rpx;
    color: #666;
}

.item-status {
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    font-size: 22rpx;

    &.status-pending {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    &.status-resolved {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}

/* 发布按钮 */
.publish-btn {
    position: fixed;
    right: 40rpx;
    bottom: 100rpx;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.4);
    z-index: 100;
}

.publish-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
}
</style>

<template>
    <view class="page">
        <view class="container">
            <!-- 活动图片 -->
            <view class="activity-banner">
                <image class="banner-image" :src="activity.image" mode="aspectFill"></image>
                <view class="status-overlay">
                    <view class="status-badge" :class="'status-' + activity.status">
                        {{ getStatusText(activity.status) }}
                    </view>
                </view>
            </view>

            <!-- 活动基础信息 -->
            <view class="activity-header">
                <text class="activity-title">{{ activity.title }}</text>
                <view class="header-info">
                    <view class="info-item">
                        <text class="info-icon">📍</text>
                        <text class="info-text">{{ activity.location }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-icon">🆔</text>
                        <text class="info-text">活动编号: {{ activity.id }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-icon">👥</text>
                        <text class="info-text">{{ activity.currentCount }}/{{ activity.maxCount }} 人</text>
                    </view>
                </view>
            </view>

            <!-- 标签页切换 -->
            <view class="tabs-section">
                <view class="tabs-bar">
                    <view class="tab-item" v-for="(tab, index) in tabs" :key="index"
                        :class="{ active: currentTab === index }" @tap="switchTab(index)">
                        <text class="tab-text">{{ tab }}</text>
                    </view>
                </view>
            </view>

            <!-- 标签页内容 -->
            <view class="tab-content">
                <!-- 详情 -->
                <view class="content-panel" v-if="currentTab === 0">
                    <view class="detail-section">
                        <view class="section-title">
                            <text class="title-icon">🏢</text>
                            <text class="title-text">活动组织</text>
                        </view>
                        <text class="section-content">{{ activity.organizer }}</text>
                    </view>

                    <view class="detail-section">
                        <view class="section-title">
                            <text class="title-icon">📝</text>
                            <text class="title-text">活动简介</text>
                        </view>
                        <text class="section-content">{{ activity.description }}</text>
                    </view>

                    <view class="detail-section">
                        <view class="section-title">
                            <text class="title-icon">⚠️</text>
                            <text class="title-text">参与须知</text>
                        </view>
                        <text class="section-content">{{ activity.notice }}</text>
                    </view>
                </view>

                <!-- 信息 -->
                <view class="content-panel" v-if="currentTab === 1">
                    <view class="info-grid">
                        <view class="grid-item">
                            <text class="item-label">报名时间</text>
                            <text class="item-value">{{ activity.signupStart }} 至 {{ activity.signupEnd }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动时间</text>
                            <text class="item-value">{{ activity.activityStart }} 至 {{ activity.activityEnd }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动级别</text>
                            <text class="item-value">{{ activity.level }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">参与范围</text>
                            <text class="item-value">{{ activity.range }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动请假</text>
                            <text class="item-value">{{ activity.allowLeave ? '支持' : '不支持' }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">最多报名</text>
                            <text class="item-value">{{ activity.maxCount }} 人</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">学分设置</text>
                            <text class="item-value">{{ activity.credit }} 学分</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动积分</text>
                            <text class="item-value">{{ activity.points }} 积分</text>
                        </view>
                    </view>

                    <!-- 活动标签 -->
                    <view class="tags-section">
                        <view class="section-title">
                            <text class="title-icon">🏷️</text>
                            <text class="title-text">活动标签</text>
                        </view>
                        <view class="tags-list">
                            <view class="tag-item" v-for="(tag, index) in activity.tags" :key="index">
                                {{ tag }}
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 人员 -->
                <view class="content-panel" v-if="currentTab === 2">
                    <!-- 负责人 -->
                    <view class="person-section" v-if="activity.leaders && activity.leaders.length > 0">
                        <view class="section-title">
                            <text class="title-icon">👑</text>
                            <text class="title-text">负责人</text>
                        </view>
                        <view class="person-list">
                            <view class="person-item" v-for="person in activity.leaders" :key="person.id">
                                <image class="person-avatar" :src="person.avatar" mode="aspectFill"></image>
                                <text class="person-name">{{ person.name }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 组织者 -->
                    <view class="person-section" v-if="activity.organizers && activity.organizers.length > 0">
                        <view class="section-title">
                            <text class="title-icon">👨‍💼</text>
                            <text class="title-text">组织者</text>
                        </view>
                        <view class="person-list">
                            <view class="person-item" v-for="person in activity.organizers" :key="person.id">
                                <image class="person-avatar" :src="person.avatar" mode="aspectFill"></image>
                                <text class="person-name">{{ person.name }}</text>
                            </view>
                        </view>
                    </view>

                    <!-- 参与人员 -->
                    <view class="person-section" v-if="activity.participants && activity.participants.length > 0">
                        <view class="section-title">
                            <text class="title-icon">👥</text>
                            <text class="title-text">参与人员 ({{ activity.participants.length }})</text>
                        </view>
                        <view class="person-list">
                            <view class="person-item" v-for="person in activity.participants" :key="person.id">
                                <image class="person-avatar" :src="person.avatar" mode="aspectFill"></image>
                                <text class="person-name">{{ person.name }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 地址 -->
                <view class="content-panel" v-if="currentTab === 3">
                    <view class="location-section">
                        <view class="section-title">
                            <text class="title-icon">📍</text>
                            <text class="title-text">活动地址</text>
                        </view>
                        <text class="location-address">{{ activity.address }}</text>

                        <!-- 地图 -->
                        <view class="map-container">
                            <map class="activity-map" :latitude="activity.latitude" :longitude="activity.longitude"
                                :markers="markers" :show-location="true"></map>
                        </view>

                        <!-- 坐标信息 -->
                        <view class="coordinate-info">
                            <text class="coordinate-text">经度: {{ activity.longitude }}</text>
                            <text class="coordinate-text">纬度: {{ activity.latitude }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部报名按钮 -->
            <view class="footer-action">
                <button class="signup-btn" :class="{ disabled: !canSignup }" :disabled="!canSignup" @tap="handleSignup">
                    {{ getSignupText() }}
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 当前标签页
const currentTab = ref(0)

// 标签页列表
const tabs = ['详情', '信息', '人员', '地址']

// 活动详情数据
const activity = ref({
    id: 1001,
    image: 'https://picsum.photos/800/400?random=30',
    title: '人工智能前沿技术讲座',
    status: 'recruiting',
    location: '学术报告厅A101',
    currentCount: 85,
    maxCount: 200,
    organizer: '数据学院科技创新协会',
    description: '本次讲座将邀请国内知名AI专家，为大家深入讲解人工智能领域的最新研究成果和技术应用。内容涵盖机器学习、深度学习、自然语言处理等多个方向，适合对人工智能感兴趣的同学参加。',
    notice: '1. 请提前10分钟到场签到\n2. 请保持会场安静，手机调至静音\n3. 讲座期间可以提问交流\n4. 请爱护会场设施',
    signupStart: '2025-10-28 08:00',
    signupEnd: '2025-11-04 18:00',
    activityStart: '2025-11-05 14:00',
    activityEnd: '2025-11-05 16:30',
    level: '校级',
    range: '2021-2025级',
    allowLeave: false,
    credit: 2,
    points: 10,
    tags: ['学术讲座', '人工智能', '科技创新', '技术分享'],
    leaders: [
        { id: 1, name: '张教授', avatar: 'https://picsum.photos/100/100?random=1' }
    ],
    organizers: [
        { id: 2, name: '李明', avatar: 'https://picsum.photos/100/100?random=2' },
        { id: 3, name: '王芳', avatar: 'https://picsum.photos/100/100?random=3' }
    ],
    participants: [
        { id: 4, name: '张三', avatar: 'https://picsum.photos/100/100?random=4' },
        { id: 5, name: '李四', avatar: 'https://picsum.photos/100/100?random=5' },
        { id: 6, name: '王五', avatar: 'https://picsum.photos/100/100?random=6' },
        { id: 7, name: '赵六', avatar: 'https://picsum.photos/100/100?random=7' },
        { id: 8, name: '孙七', avatar: 'https://picsum.photos/100/100?random=8' }
    ],
    address: '北京市海淀区学院路数据学院学术报告厅A101',
    latitude: 39.9042,
    longitude: 116.4074,
    isSignedUp: false
})

// 地图标记点
const markers = computed(() => [{
    id: 1,
    latitude: activity.value.latitude,
    longitude: activity.value.longitude,
    title: activity.value.title,
    iconPath: '/static/marker.png',
    width: 30,
    height: 30
}])

// 是否可以报名
const canSignup = computed(() => {
    return activity.value.status === 'recruiting' &&
        activity.value.currentCount < activity.value.maxCount &&
        !activity.value.isSignedUp
})

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'recruiting': '报名中',
        'ongoing': '进行中',
        'finished': '已结束'
    }
    return statusMap[status] || ''
}

// 获取报名按钮文本
const getSignupText = () => {
    if (activity.value.isSignedUp) {
        return '已报名'
    }
    if (activity.value.status === 'finished') {
        return '活动已结束'
    }
    if (activity.value.status === 'ongoing') {
        return '活动进行中'
    }
    if (activity.value.currentCount >= activity.value.maxCount) {
        return '报名已满'
    }
    return '立即报名'
}

// 切换标签页
const switchTab = (index) => {
    currentTab.value = index
}

// 处理报名
const handleSignup = () => {
    if (!canSignup.value) {
        return
    }

    uni.showModal({
        title: '确认报名',
        content: `确定要报名参加"${activity.value.title}"吗？`,
        success: (res) => {
            if (res.confirm) {
                // 模拟报名成功
                activity.value.isSignedUp = true
                activity.value.currentCount += 1

                uni.showToast({
                    title: '报名成功',
                    icon: 'success'
                })
            }
        }
    })
}

onLoad((options) => {
    const id = options.id
    if (id) {
        console.log('活动详情ID:', id)
        // 这里可以根据ID加载具体活动数据
    }

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【活动详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取活动详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/activities/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            title: '大数据技术分享会',
            cover: 'https://example.com/cover.jpg',
            images: ['https://example.com/img1.jpg'], // 轮播图
            category: 'lecture',
            status: 'upcoming',
            startTime: '2024-11-05 14:00',
            endTime: '2024-11-05 16:00',
            location: '教学楼A301',
            organization: { id: 1, name: '数据科学社团', logo: '' },
            organizer: { name: '张三', avatar: '', position: '社长' },
            participants: 45,
            maxParticipants: 100,
            description: '详细介绍...',
            requirements: '参与要求...',
            schedule: '活动流程...',
            isRegistered: false // 当前用户是否已报名
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 报名/取消报名')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/activities/:id/register (报名) 或 /api/activities/:id/unregister (取消)')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('📍 接口3: 签到')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/activities/:id/sign-in')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        latitude: 30.845427,
        longitude: 104.464508,
        address: '教学楼A301'
    }, null, 2))
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
    padding-bottom: 120rpx;
}

/* 活动图片 */
.activity-banner {
    position: relative;
    width: 100%;
    height: 400rpx;
}

.banner-image {
    width: 100%;
    height: 100%;
}

.status-overlay {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
}

.status-badge {
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;

    &.status-recruiting {
        background: rgba(82, 196, 26, 0.9);
        color: #fff;
    }

    &.status-ongoing {
        background: rgba(102, 126, 234, 0.9);
        color: #fff;
    }

    &.status-finished {
        background: rgba(153, 153, 153, 0.9);
        color: #fff;
    }
}

/* 活动头部 */
.activity-header {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.activity-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.5;
    display: block;
    margin-bottom: 20rpx;
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.info-icon {
    font-size: 24rpx;
    line-height: 1;
    display: flex;
    align-items: center;
}

.info-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1;
}

/* 标签页 */
.tabs-section {
    background: #fff;
    margin-bottom: 20rpx;
}

.tabs-bar {
    display: flex;
    border-bottom: 2rpx solid #f0f0f0;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    position: relative;

    &.active {
        .tab-text {
            color: #667eea;
            font-weight: bold;
        }

        &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60rpx;
            height: 4rpx;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2rpx;
        }
    }
}

.tab-text {
    font-size: 28rpx;
    color: #666;
}

/* 内容面板 */
.tab-content {
    background: #fff;
    padding: 30rpx;
    min-height: 400rpx;
}

.content-panel {
    animation: fadeIn 0.3s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* 详情部分 */
.detail-section {
    margin-bottom: 30rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 16rpx;
}

.title-icon {
    font-size: 32rpx;
    line-height: 1;
    display: flex;
    align-items: center;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    line-height: 1;
}

.section-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    white-space: pre-wrap;
}

/* 信息网格 */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    margin-bottom: 30rpx;
}

.grid-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
}

.item-label {
    font-size: 24rpx;
    color: #999;
}

.item-value {
    font-size: 26rpx;
    color: #333;
    font-weight: bold;
}

/* 标签 */
.tags-section {
    margin-top: 30rpx;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.tag-item {
    padding: 8rpx 20rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
    border-radius: 20rpx;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 人员部分 */
.person-section {
    margin-bottom: 30rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.person-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.person-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
}

.person-avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    border: 2rpx solid #f0f0f0;
}

.person-name {
    font-size: 24rpx;
    color: #666;
}

/* 地址部分 */
.location-section {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.location-address {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
}

.map-container {
    width: 100%;
    height: 400rpx;
    border-radius: 12rpx;
    overflow: hidden;
}

.activity-map {
    width: 100%;
    height: 100%;
}

.coordinate-info {
    display: flex;
    justify-content: space-around;
    padding: 20rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
}

.coordinate-text {
    font-size: 24rpx;
    color: #666;
}

/* 底部操作 */
.footer-action {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx;
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
    z-index: 100;
}

.signup-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    border: none;

    &.disabled {
        opacity: 0.5;
    }
}
</style>

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
                            <text class="title-text">活动详情</text>
                        </view>
                        <rich-text class="section-content" :nodes="activity.description"></rich-text>
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
import { getActivityDetail, enrollActivity, cancelEnroll } from '@/api/activity'
import { formatRichText } from '@/utils/richtext'

// 当前标签页
const currentTab = ref(0)

// 标签页列表
const tabs = ['详情', '信息', '人员', '地址']

// 活动详情数据
const activity = ref({
    id: null,
    image: '',
    title: '',
    status: 'recruiting',
    location: '',
    currentCount: 0,
    maxCount: 0,
    organizer: '',
    description: '',
    notice: '',
    signupStart: '',
    signupEnd: '',
    activityStart: '',
    activityEnd: '',
    level: '',
    range: '',
    allowLeave: false,
    credit: 0,
    points: 0,
    tags: [],
    leaders: [],
    organizers: [],
    participants: [],
    address: '',
    latitude: 0,
    longitude: 0,
    isSignedUp: false,
    enrollStatus: null  // 报名状态: 0=已报名, 1=已签到, 2=已完成, 3=已取消
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

// 是否可以报名或取消报名
const canSignup = computed(() => {
    // 如果已报名，根据状态判断是否可以取消
    if (activity.value.isSignedUp) {
        // enrollStatus: 0=已报名(可取消), 1=已签到(不可取消), 2=已完成(不可取消), 3=已取消(不可操作)
        return activity.value.enrollStatus === '0'
    }
    // 未报名时，判断活动是否可报名
    return activity.value.status === 'recruiting' &&
        activity.value.currentCount < activity.value.maxCount
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
        // 根据报名状态显示不同文本
        if (activity.value.enrollStatus === '0') {
            return '取消报名'  // 已报名，可以取消
        }
        if (activity.value.enrollStatus === '1') {
            return '已签到'
        }
        if (activity.value.enrollStatus === '2') {
            return '已完成'
        }
        if (activity.value.enrollStatus === '3') {
            return '已取消'
        }
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

// 处理报名/取消报名
const handleSignup = async () => {
    if (!canSignup.value) {
        return
    }

    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (!userInfo || !userInfo.studentId) {
        uni.showToast({
            title: '未找到学生信息',
            icon: 'none'
        })
        return
    }

    // 如果已报名，执行取消报名逻辑
    if (activity.value.isSignedUp) {
        // 判断报名状态
        if (activity.value.enrollStatus === '1') {
            uni.showToast({
                title: '您已签到，无法取消报名',
                icon: 'none'
            })
            return
        }
        if (activity.value.enrollStatus === '2') {
            uni.showToast({
                title: '活动已完成，无法取消报名',
                icon: 'none'
            })
            return
        }
        if (activity.value.enrollStatus === '3') {
            uni.showToast({
                title: '您已经取消过该活动报名了',
                icon: 'none'
            })
            return
        }

        // 弹出取消确认
        uni.showModal({
            title: '取消报名',
            content: `确定要取消报名"${activity.value.title}"吗？`,
            success: async (res) => {
                if (res.confirm) {
                    try {
                        // 调用取消报名接口
                        await cancelEnroll({
                            activityId: Number(activity.value.id),
                            studentId: Number(userInfo.studentId)
                        })

                        // 取消成功，更新状态
                        activity.value.isSignedUp = false
                        activity.value.enrollStatus = '3'
                        activity.value.currentCount -= 1

                        uni.showToast({
                            title: '取消报名成功',
                            icon: 'success'
                        })
                    } catch (error) {
                        console.error('取消报名失败:', error)
                        uni.showToast({
                            title: error.message || '取消报名失败',
                            icon: 'none'
                        })
                    }
                }
            }
        })
    } else {
        // 执行报名逻辑
        uni.showModal({
            title: '确认报名',
            content: `确定要报名参加"${activity.value.title}"吗？`,
            success: async (res) => {
                if (res.confirm) {
                    try {
                        // 调用报名接口
                        await enrollActivity({
                            activityId: Number(activity.value.id),
                            studentId: Number(userInfo.studentId)
                        })

                        // 报名成功，更新状态
                        activity.value.isSignedUp = true
                        activity.value.enrollStatus = '0'
                        activity.value.currentCount += 1

                        uni.showToast({
                            title: '报名成功',
                            icon: 'success'
                        })
                    } catch (error) {
                        console.error('报名失败:', error)
                        uni.showToast({
                            title: error.message || '报名失败',
                            icon: 'none'
                        })
                    }
                }
            }
        })
    }
}

// 加载活动详情
const loadActivityDetail = async (id) => {
    try {
        console.log('加载活动详情, ID:', id)

        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo')
        const studentId = userInfo?.studentId

        // 调用活动详情接口，传递 studentId 参数
        const res = await getActivityDetail(id, studentId ? { studentId: Number(studentId) } : {})
        console.log('活动详情响应:', res)

        // API返回的数据在 data.activity 中
        const activityData = res.activity

        // 映射API响应数据到activity对象
        activity.value = {
            id: activityData.activityId,
            image: activityData.coverImage || 'https://picsum.photos/800/400?random=30',
            title: activityData.activityName || '',
            status: mapActivityStatus(activityData.activityStatus),
            location: activityData.activityLocation || '',
            currentCount: activityData.currentParticipants || 0,
            maxCount: activityData.maxParticipants || 0,
            organizer: activityData.organizerNames || '',
            description: formatRichText(activityData.activityDetail) || '', // 处理富文本
            notice: activityData.remark || '',
            signupStart: formatDateTime(activityData.registerStartTime) || '',
            signupEnd: formatDateTime(activityData.registerEndTime) || '',
            activityStart: activityData.activityStartTime || '',
            activityEnd: activityData.activityEndTime || '',
            level: mapActivityLevel(activityData.activityLevel),
            range: activityData.participateScope || '',
            allowLeave: activityData.allowLeave === 'Y',
            credit: activityData.creditValue || 0,
            points: activityData.scoreValue || 0,
            tags: parseActivityTags(activityData.activityTags),
            leaders: res.leaders || [],
            organizers: res.organizers || [],
            participants: res.participants || [],
            address: activityData.activityLocation || '',
            latitude: activityData.latitude || 0,
            longitude: activityData.longitude || 0,
            isSignedUp: res.isRegistered === true || res.isRegistered === 'Y',
            // 报名状态: 0=已报名, 1=已签到, 2=已完成, 3=已取消
            // 如果后端返回了enrollStatus就使用，否则已报名的默认为'0'
            enrollStatus: res.enrollStatus || (res.isRegistered === true || res.isRegistered === 'Y' ? '0' : null)
        }

        console.log('活动详情加载成功:', activity.value)
    } catch (error) {
        console.error('加载活动详情失败:', error)
        uni.showToast({
            title: error.message || '加载失败',
            icon: 'none'
        })
    }
}

// 映射活动状态
const mapActivityStatus = (status) => {
    const statusMap = {
        '0': 'recruiting',
        '1': 'ongoing',
        '2': 'finished'
    }
    return statusMap[status] || 'recruiting'
}

// 映射活动级别
const mapActivityLevel = (level) => {
    const levelMap = {
        '1': '院级',
        '2': '系级',
        '3': '班级',
        '4': '校级'
    }
    return levelMap[level] || level
}

// 格式化时间
const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    // 处理 ISO 格式时间: "2025-10-29T00:00:00.000+08:00"
    try {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (error) {
        console.error('时间格式化失败:', error)
        return dateStr
    }
}

// 解析活动标签
const parseActivityTags = (labelStr) => {
    if (!labelStr) return []
    try {
        // 如果是JSON格式的数组字符串
        if (labelStr.startsWith('[')) {
            return JSON.parse(labelStr)
        }
        // 如果是逗号分隔的字符串
        return labelStr.split(',').filter(tag => tag.trim())
    } catch (error) {
        console.error('解析标签失败:', error)
        return []
    }
}

onLoad((options) => {
    const id = options.id
    if (id) {
        console.log('活动详情ID:', id)
        // 加载活动详情数据
        loadActivityDetail(id)
    } else {
        uni.showToast({
            title: '活动ID不存在',
            icon: 'none'
        })
    }
})
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

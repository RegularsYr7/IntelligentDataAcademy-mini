<template>
    <view class="content-wrapper">
        <!-- 个人信息卡片 -->
        <view class="profile-card">
            <view class="profile-layout">
                <view class="profile-left">
                    <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
                    <view class="user-detail">
                        <text class="user-name">{{ userInfo.name }}</text>
                        <view class="position-tags">
                            <text class="position-tag" v-for="(position, index) in userInfo.positions" :key="index">
                                {{ position }}
                            </text>
                        </view>
                    </view>
                </view>

                <!-- 量化分数 -->
                <view class="profile-right">
                    <view class="score-box">
                        <text class="score-value">{{ userInfo.quantificationScore }}</text>
                        <text class="score-label">量化分数</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 功能模块 -->
        <view class="function-section">
            <!-- 我的活动 -->
            <view class="module-card">
                <view class="module-header" @tap="viewMyActivities">
                    <view class="module-title">
                        <text class="module-icon">🎯</text>
                        <text class="module-name">我的活动</text>
                    </view>
                    <text class="module-arrow">></text>
                </view>
                <view class="module-content">
                    <view class="activity-list">
                        <view class="activity-item" v-for="(activity, index) in myActivities" :key="index"
                            @tap.stop="goToActivityDetail(activity)">
                            <view class="activity-info">
                                <text class="activity-name">{{ activity.name }}</text>
                                <text class="activity-time">{{ activity.time }}</text>
                            </view>
                            <view class="activity-status" :class="'status-' + activity.status">
                                {{ activity.statusText }}
                            </view>
                        </view>
                    </view>
                    <view class="empty-tip" v-if="myActivities.length === 0">
                        <text>暂无活动</text>
                    </view>
                </view>
            </view>

            <!-- 我的组织 -->
            <view class="module-card">
                <view class="module-header" @tap="viewMyOrganizations">
                    <view class="module-title">
                        <text class="module-icon">👥</text>
                        <text class="module-name">我的组织</text>
                    </view>
                    <text class="module-arrow">></text>
                </view>
                <view class="module-content">
                    <view class="org-list">
                        <view class="org-item" v-for="(org, index) in myOrganizations" :key="index"
                            @tap.stop="goToOrgDetail(org)">
                            <image class="org-logo" :src="org.logo" mode="aspectFill"></image>
                            <view class="org-info">
                                <text class="org-name">{{ org.name }}</text>
                                <text class="org-role">{{ org.role }}</text>
                            </view>
                            <text class="org-arrow">></text>
                        </view>
                    </view>
                    <view class="empty-tip" v-if="myOrganizations.length === 0">
                        <text>暂未加入组织</text>
                    </view>
                </view>
            </view>

            <!-- 成长记录 -->
            <view class="module-card" @tap="viewGrowthRecord">
                <view class="module-header">
                    <view class="module-title">
                        <text class="module-icon">📈</text>
                        <text class="module-name">成长记录</text>
                    </view>
                    <text class="module-arrow">></text>
                </view>
                <view class="module-content">
                    <view class="growth-chart">
                        <view class="chart-item" v-for="(record, index) in growthRecords" :key="index">
                            <view class="chart-bar">
                                <view class="bar-fill" :style="{ height: (record.score / 100 * 100) + '%' }">
                                </view>
                            </view>
                            <text class="chart-label">{{ record.month }}</text>
                            <text class="chart-score">{{ record.score }}</text>
                        </view>
                    </view>
                    <view class="growth-summary">
                        <text class="summary-text">本月获得 <text class="highlight">+{{ monthlyGain }}</text>
                            分</text>
                    </view>
                </view>
            </view>

            <!-- 基本信息 -->
            <view class="module-card" @tap="viewBasicInfo">
                <view class="module-header">
                    <view class="module-title">
                        <text class="module-icon">📋</text>
                        <text class="module-name">基本信息</text>
                    </view>
                    <text class="module-arrow">></text>
                </view>
                <view class="module-content">
                    <view class="info-list">
                        <view class="info-item">
                            <text class="info-label">学号</text>
                            <text class="info-value">{{ basicInfo.studentId }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">班级</text>
                            <text class="info-value">{{ basicInfo.class }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">专业</text>
                            <text class="info-value">{{ basicInfo.major }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">学院</text>
                            <text class="info-value">{{ basicInfo.college }}</text>
                        </view>
                        <view class="info-item">
                            <text class="info-label">联系电话</text>
                            <text class="info-value">{{ basicInfo.phone }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 退出登录按钮 -->
            <view class="logout-section">
                <button class="logout-btn" @tap="handleLogout">退出登录</button>
            </view>
        </view>
    </view>
</template>

<script setup>
// 接收父组件传递的数据
const props = defineProps({
    userInfo: {
        type: Object,
        required: true
    },
    myActivities: {
        type: Array,
        default: () => []
    },
    myOrganizations: {
        type: Array,
        default: () => []
    },
    growthRecords: {
        type: Array,
        default: () => []
    },
    monthlyGain: {
        type: Number,
        default: 0
    },
    basicInfo: {
        type: Object,
        required: true
    }
})

// 定义事件
const emit = defineEmits(['logout'])

// 查看我的活动
const viewMyActivities = () => {
    uni.navigateTo({
        url: '/pages/my-activities/my-activities'
    })
}

// 跳转活动详情
const goToActivityDetail = (activity) => {
    uni.navigateTo({
        url: `/pages/activity-detail/activity-detail?id=${activity.id}`
    })
}

// 查看我的组织
const viewMyOrganizations = () => {
    uni.navigateTo({
        url: '/pages/my-organizations/my-organizations'
    })
}

// 跳转组织详情
const goToOrgDetail = (org) => {
    uni.navigateTo({
        url: `/pages/organization-detail/organization-detail?id=${org.id}`
    })
}

// 查看成长记录
const viewGrowthRecord = () => {
    uni.navigateTo({
        url: '/pages/growth-record/growth-record'
    })
}

// 查看基本信息
const viewBasicInfo = () => {
    uni.navigateTo({
        url: '/pages/basic-info/basic-info'
    })
}

// 退出登录
const handleLogout = () => {
    uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗?',
        success: (res) => {
            if (res.confirm) {
                emit('logout')
            }
        }
    })
}
</script>

<style scoped lang="scss">
/* 内容包装器 */
.content-wrapper {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* 个人信息卡片 */
.profile-card {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    padding: 5vh 30rpx 40rpx 30rpx;
    margin-bottom: 20rpx;
}

.profile-layout {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.profile-left {
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 20rpx;
}

.profile-right {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 16rpx;
    padding: 20rpx;
    backdrop-filter: blur(10rpx);
    min-width: 160rpx;
    display: flex;
    justify-content: center;
}

.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
    margin-right: 24rpx;
    flex-shrink: 0;
}

.user-detail {
    flex: 1;
    overflow: hidden;
}

.user-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    display: block;
    margin-bottom: 12rpx;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.position-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
}

.position-tag {
    padding: 4rpx 12rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20rpx;
    font-size: 22rpx;
    color: #fff;
    backdrop-filter: blur(10rpx);
}

.score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.score-value {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    line-height: 1.2;
}

.score-label {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-top: 4rpx;
}

/* 功能模块 */
.function-section {
    padding: 0 20rpx;
}

.module-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.module-title {
    display: flex;
    align-items: center;
}

.module-icon {
    font-size: 36rpx;
    margin-right: 12rpx;
}

.module-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.module-arrow {
    font-size: 28rpx;
    color: #999;
}

.module-content {
    min-height: 100rpx;
}

/* 活动列表 */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.activity-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.activity-info {
    flex: 1;
}

.activity-name {
    font-size: 28rpx;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
}

.activity-time {
    font-size: 24rpx;
    color: #999;
}

.activity-status {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-ongoing {
    background: #e3f2fd;
    color: #2196f3;
}

.status-upcoming {
    background: #fff3e0;
    color: #ff9800;
}

.status-completed {
    background: #e8f5e9;
    color: #4caf50;
}

/* 组织列表 */
.org-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.org-item {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
        background: #e9ecef;
        transform: scale(0.98);
    }
}

.org-logo {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
}

.org-info {
    flex: 1;
}

.org-name {
    font-size: 28rpx;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
}

.org-role {
    font-size: 24rpx;
    color: #667eea;
    font-weight: bold;
}

.org-arrow {
    font-size: 28rpx;
    color: #999;
    margin-left: 10rpx;
}

/* 成长记录图表 */
.growth-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 200rpx;
    margin-bottom: 20rpx;
    padding: 0 10rpx;
}

.chart-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
}

.chart-bar {
    width: 40rpx;
    height: 140rpx;
    background: #f0f0f0;
    border-radius: 20rpx 20rpx 0 0;
    position: relative;
    margin-bottom: 8rpx;
}

.bar-fill {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 20rpx 20rpx 0 0;
    transition: height 0.3s ease;
}

.chart-label {
    font-size: 22rpx;
    color: #999;
    margin-bottom: 4rpx;
}

.chart-score {
    font-size: 20rpx;
    color: #667eea;
    font-weight: bold;
}

.growth-summary {
    text-align: center;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.summary-text {
    font-size: 26rpx;
    color: #666;
}

.highlight {
    color: #667eea;
    font-weight: bold;
    font-size: 28rpx;
}

/* 基本信息列表 */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.info-label {
    font-size: 26rpx;
    color: #666;
}

.info-value {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
}

/* 空状态提示 */
.empty-tip {
    text-align: center;
    padding: 40rpx 0;
    color: #999;
    font-size: 26rpx;
}

/* 退出登录按钮 */
.logout-section {
    padding: 0 20rpx;
    margin-top: 20rpx;
}

.logout-btn {
    width: 100%;
    height: 90rpx;
    border-radius: 45rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    opacity: 0.9;

    &::after {
        border: none;
    }

    &:active {
        opacity: 1;
        transform: scale(0.98);
    }
}
</style>

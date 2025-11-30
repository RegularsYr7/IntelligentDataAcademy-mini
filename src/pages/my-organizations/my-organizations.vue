<template>
    <view class="page">
        <view class="container">
            <!-- 页面头部统计 -->
            <view class="stats-header">
                <view class="stat-item">
                    <text class="stat-value">{{ myOrganizations.length }}</text>
                    <text class="stat-label">参与组织</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ leaderCount }}</text>
                    <text class="stat-label">担任职务</text>
                </view>
                <view class="stat-divider"></view>
                <view class="stat-item">
                    <text class="stat-value">{{ totalMembers }}</text>
                    <text class="stat-label">组织成员</text>
                </view>
            </view>

            <!-- 组织列表 -->
            <view class="organization-list">
                <view class="list-header">
                    <text class="header-title">我的组织</text>
                    <text class="header-count">共 {{ myOrganizations.length }} 个</text>
                </view>

                <view class="org-item" v-for="(org, index) in myOrganizations" :key="index" @tap="goToDetail(org)">
                    <image class="org-logo" :src="org.logo" mode="aspectFill"></image>
                    <view class="org-content">
                        <view class="org-header">
                            <text class="org-name">{{ org.name }}</text>
                            <view class="org-level" :class="'level-' + org.level">
                                <text class="level-text">{{ getLevelText(org.level) }}</text>
                            </view>
                        </view>
                        <text class="org-intro">{{ org.intro }}</text>
                        <view class="org-meta">
                            <text class="meta-item">👥 {{ org.memberCount }}人</text>
                            <text class="meta-item">📅 {{ org.foundedYear }}</text>
                            <view class="my-role">
                                <text class="role-value">{{ org.myRole }}</text>
                            </view>
                        </view>
                    </view>
                    <text class="org-arrow">›</text>
                </view>

                <!-- 空状态 -->
                <view class="empty-state" v-if="myOrganizations.length === 0">
                    <text class="empty-icon">📭</text>
                    <text class="empty-text">你还没有加入任何组织</text>
                    <view class="empty-action" @tap="goToOrganizationList">
                        <text class="action-text">去发现组织</text>
                    </view>
                </view>
            </view>

            <!-- 推荐组织 -->
            <!-- <view class="recommend-section" v-if="recommendOrganizations.length > 0">
                <view class="section-header">
                    <text class="section-title">推荐组织</text>
                    <text class="section-more" @tap="goToOrganizationList">查看更多 ›</text>
                </view>
                <view class="recommend-list">
                    <view class="recommend-item" v-for="(org, index) in recommendOrganizations" :key="index"
                        @tap="goToDetail(org)">
                        <image class="recommend-logo" :src="org.logo" mode="aspectFill"></image>
                        <view class="recommend-info">
                            <text class="recommend-name">{{ org.name }}</text>
                            <view class="recommend-level" :class="'level-' + org.level">
                                {{ getLevelText(org.level) }}
                            </view>
                        </view>
                        <text class="recommend-count">{{ org.memberCount }}人</text>
                    </view>
                </view>
            </view> -->
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getMyOrganizations } from '@/api/student'
import { getCarouselOrganizations } from '@/api/organization'

// 我参与的组织
const myOrganizations = ref([])

// 推荐组织
const recommendOrganizations = ref([])

// 统计数据
const leaderCount = ref(0)
const totalMembers = ref(0)

onLoad(() => {
    console.log('我的组织页面加载')
    loadData()
})

onShow(() => {
    loadData()
})

const loadData = () => {
    const token = uni.getStorageSync('userToken')
    if (token) {
        fetchMyOrganizations()
    }
    // fetchRecommendOrganizations()
}

// 获取我的组织
const fetchMyOrganizations = async () => {
    try {
        const res = await getMyOrganizations()

        // Handle new response structure
        if (res) {
            // Update stats from response if available
            if (res.positionCount !== undefined) leaderCount.value = res.positionCount
            if (res.totalMemberCount !== undefined) totalMembers.value = res.totalMemberCount

            const list = res.organizationList || res.rows || []

            myOrganizations.value = list.map(org => ({
                id: org.organizationId,
                name: org.organizationName || org.name,
                logo: org.organizationLogo || org.logo || 'https://picsum.photos/200/200?random=' + org.organizationId,
                intro: org.displayText || org.introduction || org.intro || '暂无简介',
                level: org.organizationLevel || org.level || '1', // Default to school level if missing
                memberCount: org.memberCount || 0,
                foundedYear: org.establishYear || org.foundedYear || '2020',
                myRole: org.myMemberTag || getRoleName(org.myMemberRole) || '成员'
            }))
        }
    } catch (error) {
        console.error('获取我的组织失败:', error)
    }
}

const getRoleName = (role) => {
    const map = { '2': '主席', '1': '管理员', '0': '成员' }
    return map[role] || '成员'
}

// 获取推荐组织
const fetchRecommendOrganizations = async () => {
    try {
        const res = await getCarouselOrganizations()
        // 兼容处理：可能是直接返回数组，或者是包含在 data 字段中
        const list = Array.isArray(res) ? res : (res.data || [])

        if (list.length > 0) {
            recommendOrganizations.value = list.map(org => ({
                id: org.organizationId,
                name: org.organizationName || org.name,
                logo: org.organizationLogo || org.logo || 'https://picsum.photos/200/200?random=' + org.organizationId,
                intro: org.introduction || org.intro,
                level: org.organizationLevel || org.level,
                memberCount: org.memberCount || 0
            }))
        }
    } catch (error) {
        console.error('获取推荐组织失败:', error)
    }
}


// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        '1': '校级',
        '2': '院级',
        '3': '班级',
    }
    return levelMap[level] || '未知'
}

// 跳转到组织详情
const goToDetail = (org) => {
    uni.navigateTo({
        url: `/pages/organization-detail/organization-detail?id=${org.id}`
    })
}

// 跳转到组织列表
const goToOrganizationList = () => {
    uni.switchTab({
        url: '/pages/organization/organization'
    })
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}

/* 统计头部 */
.stats-header {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    padding: 40rpx 30rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 44rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 8rpx;
}

.stat-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.9);
}

.stat-divider {
    width: 2rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
}

/* 组织列表 */
.organization-list {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 20rpx;
    margin: 0 20rpx 20rpx 20rpx;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
}

.header-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.header-count {
    font-size: 24rpx;
    color: #999;
}

.org-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
    transition: all 0.3s ease;

    &:active {
        background: #e9ecef;
        transform: scale(0.98);
    }
}

.org-logo {
    width: 100rpx;
    height: 100rpx;
    border-radius: 16rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.org-content {
    flex: 1;
    min-width: 0;
}

.org-header {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
}

.org-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-right: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.org-level {
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
    flex-shrink: 0;
}

.level-school {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
}

.level-college {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;
}

.level-class {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: #fff;
}

.level-text {
    font-weight: bold;
}

.org-intro {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    word-break: break-all;
    line-height: 1.5;
}

.org-meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    flex-wrap: wrap;
}

.meta-item {
    font-size: 22rpx;
    color: #999;
    white-space: nowrap;
}

.my-role {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    margin-left: auto;
}

.role-value {
    font-size: 22rpx;
    color: #fff;
    font-weight: bold;
}

.org-arrow {
    font-size: 48rpx;
    color: #ddd;
    margin-left: 10rpx;
    flex-shrink: 0;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 0;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 30rpx;
}

.empty-action {
    padding: 16rpx 40rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    border-radius: 40rpx;
}

.action-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
}

/* 推荐组织 */
.recommend-section {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx 20rpx;
    margin: 0 20rpx;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.section-more {
    font-size: 24rpx;
    color: #667eea;
}

.recommend-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.recommend-item {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    transition: all 0.3s ease;

    &:active {
        background: #e9ecef;
        transform: scale(0.98);
    }
}

.recommend-logo {
    width: 70rpx;
    height: 70rpx;
    border-radius: 12rpx;
    margin-right: 16rpx;
}

.recommend-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.recommend-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.recommend-level {
    padding: 4rpx 10rpx;
    border-radius: 10rpx;
    font-size: 20rpx;
    font-weight: bold;
}

.recommend-count {
    font-size: 24rpx;
    color: #999;
}
</style>

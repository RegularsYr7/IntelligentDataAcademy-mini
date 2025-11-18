<template>
    <view class="page">
        <view class="container">
            <!-- 组织头部 -->
            <view class="org-header">
                <image class="org-logo-large" :src="organization.logo" mode="aspectFill"></image>
                <view class="org-basic-info">
                    <text class="org-name">{{ organization.name }}</text>
                    <view class="org-level-badge" :class="'level-' + organization.level">
                        <text class="level-text">{{ getLevelText(organization.level) }}</text>
                    </view>
                </view>
            </view>

            <!-- 组织简介 -->
            <view class="section-card">
                <view class="section-title">
                    <text class="title-icon">📝</text>
                    <text class="title-text">组织简介</text>
                </view>
                <text class="org-intro-text">{{ organization.intro }}</text>
            </view>

            <!-- 组织信息 -->
            <view class="section-card">
                <view class="section-title">
                    <text class="title-icon">ℹ️</text>
                    <text class="title-text">基本信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="info-label">所属分类</text>
                        <text class="info-value">{{ getLevelText(organization.level) }}</text>
                    </view>
                    <view class="info-item" v-if="organization.college">
                        <text class="info-label">所属学院</text>
                        <text class="info-value">{{ organization.college }}</text>
                    </view>
                    <view class="info-item" v-if="organization.className">
                        <text class="info-label">所属班级</text>
                        <text class="info-value">{{ organization.className }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">成员人数</text>
                        <text class="info-value">{{ organization.memberCount }}人</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">成立时间</text>
                        <text class="info-value">{{ organization.foundedYear }}年</text>
                    </view>
                    <view class="info-item" v-if="organization.location">
                        <text class="info-label">办公地点</text>
                        <text class="info-value">{{ organization.location }}</text>
                    </view>
                    <view class="info-item" v-if="organization.contact">
                        <text class="info-label">联系方式</text>
                        <text class="info-value">{{ organization.contact }}</text>
                    </view>
                </view>
            </view>

            <!-- 主要负责人 -->
            <view class="section-card">
                <view class="section-title">
                    <text class="title-icon">👤</text>
                    <text class="title-text">主要负责人</text>
                </view>
                <view class="leader-list">
                    <view class="leader-item" v-for="(leader, index) in organization.leaders" :key="index">
                        <image class="leader-avatar" :src="leader.avatar" mode="aspectFill"></image>
                        <view class="leader-info">
                            <text class="leader-name">{{ leader.name }}</text>
                            <text class="leader-position">{{ leader.position }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 主要活动 -->
            <view class="section-card">
                <view class="section-title">
                    <text class="title-icon">🎯</text>
                    <text class="title-text">主要活动</text>
                </view>
                <view class="activity-list">
                    <view class="activity-item" v-for="(activity, index) in organization.activities" :key="index">
                        <view class="activity-dot"></view>
                        <text class="activity-text">{{ activity }}</text>
                    </view>
                </view>
            </view>

            <!-- 荣誉成就 -->
            <view class="section-card" v-if="organization.honors && organization.honors.length > 0">
                <view class="section-title">
                    <text class="title-icon">🏆</text>
                    <text class="title-text">荣誉成就</text>
                </view>
                <view class="honor-list">
                    <view class="honor-item" v-for="(honor, index) in organization.honors" :key="index">
                        <text class="honor-year">{{ honor.year }}</text>
                        <text class="honor-title">{{ honor.title }}</text>
                    </view>
                </view>
            </view>

            <!-- 底部操作 -->
            <view class="footer-actions">
                <!-- 管理员显示管理按钮 -->
                <button v-if="isAdmin" class="action-btn primary-btn full-width" @tap="manageOrg">
                    <text class="btn-icon">⚙️</text>
                    <text class="btn-text">管理组织</text>
                </button>
                <!-- 非管理员显示申请加入按钮 -->
                <button v-else class="action-btn primary-btn full-width" @tap="joinOrg">
                    <text class="btn-icon">✨</text>
                    <text class="btn-text">申请加入</text>
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrganizationDetail, applyOrganization } from '@/api/organization'

// 是否为管理员
const isAdmin = ref(false)

// 组织详情数据
const organization = ref({
    id: null,
    name: '',
    logo: '',
    intro: '',
    level: '',
    college: '',
    className: '',
    memberCount: 0,
    foundedYear: '',
    location: '',
    contact: '',
    leaders: [],
    activities: [],
    honors: []
})

// 加载组织详情
const loadOrgDetail = async (id) => {
    try {
        console.log('加载组织详情, ID:', id)

        const res = await getOrganizationDetail(id)
        console.log('组织详情响应:', res)

        if (res && res.organization) {
            const org = res.organization

            // 解析主要负责人 - 使用API返回的结构化数据
            const leaders = parseLeadersFromAPI(res.mainLeaders || [])

            // 解析主要活动
            const activities = parseActivities(org.mainActivities)

            // 解析荣誉成就
            const honors = parseHonors(org.honors)

            organization.value = {
                id: org.organizationId,
                name: org.organizationName,
                logo: org.organizationLogo || org.recommendImage || 'https://picsum.photos/300/300?random=20',
                intro: org.introduction || org.displayText || '暂无简介',
                level: org.organizationLevel,
                college: org.collegeName || '',
                className: org.className || '',
                memberCount: org.memberCount || 0,
                foundedYear: org.establishYear || '未知',
                location: org.officeLocation || '',
                contact: org.contactPhone || org.contactEmail || '',
                leaders: leaders,
                activities: activities,
                honors: honors
            }

            // 设置是否为成员和角色
            if (res.isMember) {
                isAdmin.value = res.memberRole === 'president' || res.memberRole === 'admin'
            }

            console.log('组织详情加载成功:', organization.value)
        }
    } catch (error) {
        console.error('加载组织详情失败:', error)
        uni.showToast({
            title: error.message || '加载失败',
            icon: 'none'
        })
    }
}

// 解析主要负责人 - 从API返回的数组格式
const parseLeadersFromAPI = (leadersArray) => {
    if (!leadersArray || leadersArray.length === 0) return []

    return leadersArray.map((leader, index) => ({
        name: leader.name,
        position: leader.tag || '成员',
        avatar: leader.avatar || `https://picsum.photos/100/100?random=${30 + index}`
    }))
}

// 解析主要活动
const parseActivities = (activitiesStr) => {
    if (!activitiesStr) return []
    try {
        // 每行一条活动
        return activitiesStr.split('\n').filter(line => line.trim()).map(line => line.trim())
    } catch (error) {
        console.error('解析主要活动失败:', error)
        return []
    }
}

// 解析荣誉成就
const parseHonors = (honorsStr) => {
    if (!honorsStr) return []
    try {
        const honors = []
        // 每行一条荣誉
        const lines = honorsStr.split('\n').filter(line => line.trim())
        lines.forEach(line => {
            // 尝试匹配年份
            const yearMatch = line.match(/(\d{4})/)
            if (yearMatch) {
                honors.push({
                    year: yearMatch[1],
                    title: line.trim()
                })
            } else {
                honors.push({
                    year: '',
                    title: line.trim()
                })
            }
        })
        return honors
    } catch (error) {
        console.error('解析荣誉成就失败:', error)
        return []
    }
}

onLoad((options) => {
    const id = options.id
    if (id) {
        loadOrgDetail(id)
    } else {
        uni.showToast({
            title: '组织ID不存在',
            icon: 'none'
        })
    }
    console.log('组织详情页加载', id)

    // 检查当前用户是否为管理员
    checkAdminStatus(id)
})

// 检查管理员状态
const checkAdminStatus = (orgId) => {
    // TODO: 从服务器验证当前用户是否为该组织管理员
    // 暂时设置为false，后续可以通过API查询
    isAdmin.value = false
}

// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        '1': '校级组织',
        '2': '院级组织',
        '3': '班级组织',
        'school': '校级组织',
        'college': '院级组织',
        'class': '班级组织'
    }
    return levelMap[level] || '未知'
}

// 管理组织
const manageOrg = () => {
    uni.navigateTo({
        url: `/pages/org-manage/org-manage?id=${organization.value.id}`
    })
}

// 申请加入
const joinOrg = async () => {
    try {
        const res = await uni.showModal({
            title: '申请加入',
            content: `确定要申请加入${organization.value.name}吗？`,
            editable: true,
            placeholderText: '请输入申请理由(可选)'
        })

        if (res.confirm) {
            const applyReason = res.content || '我想加入这个组织'

            await applyOrganization({
                organizationId: organization.value.id,
                applyReason: applyReason
            })

            uni.showToast({
                title: '申请已提交',
                icon: 'success'
            })
        }
    } catch (error) {
        console.error('申请加入失败:', error)
        uni.showToast({
            title: error.message || '申请失败',
            icon: 'none'
        })
    }
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 140rpx;
}

/* 组织头部 */
.org-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60rpx 30rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.org-logo-large {
    width: 160rpx;
    height: 160rpx;
    border-radius: 16rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    margin-bottom: 24rpx;
}

.org-basic-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
}

.org-name {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    text-align: center;
}

.org-level-badge {
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10rpx);
    display: flex;
    align-items: center;
    justify-content: center;
}

.level-text {
    font-size: 24rpx;
    color: #fff;
}

/* 卡片区域 */
.section-card {
    background: #fff;
    margin: 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.title-icon {
    font-size: 32rpx;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

/* 组织简介 */
.org-intro-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    text-align: justify;
}

/* 信息列表 */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
        border-bottom: none;
    }
}

.info-label {
    font-size: 28rpx;
    color: #999;
}

.info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

/* 负责人列表 */
.leader-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.leader-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 16rpx;
    background: #f8f8f8;
    border-radius: 12rpx;
}

.leader-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
}

.leader-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.leader-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
}

.leader-position {
    font-size: 24rpx;
    color: #999;
}

/* 活动列表 */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    padding: 12rpx 0;
}

.activity-dot {
    width: 12rpx;
    height: 12rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    margin-top: 10rpx;
    flex-shrink: 0;
}

.activity-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    flex: 1;
}

/* 荣誉列表 */
.honor-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.honor-item {
    display: flex;
    gap: 20rpx;
    padding: 16rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 12rpx;
    border-left: 4rpx solid #667eea;
}

.honor-year {
    font-size: 26rpx;
    color: #667eea;
    font-weight: bold;
    flex-shrink: 0;
}

.honor-title {
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
    flex: 1;
}

/* 底部操作 */
.footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx;
    box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
    display: flex;
    gap: 20rpx;
    z-index: 100;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    height: 90rpx;
    border-radius: 45rpx;
    font-size: 30rpx;
    border: none;
    transition: all 0.3s;

    &:active {
        transform: scale(0.95);
    }

    &::after {
        border: none;
    }
}

.full-width {
    flex: 1;
}

.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .btn-icon,
    .btn-text {
        color: #fff;
    }
}

.btn-icon {
    font-size: 32rpx;
}

.btn-text {
    font-size: 30rpx;
    font-weight: 500;
}
</style>

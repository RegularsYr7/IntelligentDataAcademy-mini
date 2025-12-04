<template>
    <view class="page">
        <!-- 顶部背景装饰 -->
        <view class="bg-decoration"></view>

        <!-- 组织头部 -->
        <view class="org-header">
            <view class="logo-wrapper">
                <image class="org-logo-large" :src="organization.logo" mode="aspectFill"></image>
            </view>
            <view class="org-basic-info">
                <text class="org-name">{{ organization.name }}</text>
                <view class="org-tags">
                    <view class="tag level-tag" :class="'level-' + organization.level">
                        <text>{{ getLevelText(organization.level) }}</text>
                    </view>
                    <view class="tag college-tag" v-if="organization.college">
                        <text>{{ organization.college }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content-area">
            <!-- 组织简介 -->
            <view class="section-card">
                <view class="section-header">
                    <text class="section-title">组织简介</text>
                </view>
                <view class="intro-content">
                    <text class="org-intro-text">{{ organization.intro }}</text>
                </view>
            </view>

            <!-- 基本信息 -->
            <view class="section-card">
                <view class="section-header">
                    <text class="section-title">基本信息</text>
                </view>
                <view class="info-grid">
                    <view class="info-item">
                        <text class="info-label">成立时间</text>
                        <text class="info-value">{{ organization.foundedYear }}年</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">成员人数</text>
                        <text class="info-value">{{ organization.memberCount }}人</text>
                    </view>
                    <view class="info-item full-width" v-if="organization.className">
                        <text class="info-label">所属班级</text>
                        <text class="info-value">{{ organization.className }}</text>
                    </view>
                    <view class="info-item full-width" v-if="organization.location">
                        <text class="info-label">办公地点</text>
                        <text class="info-value">{{ organization.location }}</text>
                    </view>
                    <view class="info-item full-width" v-if="organization.contact">
                        <text class="info-label">联系方式</text>
                        <text class="info-value">{{ organization.contact }}</text>
                    </view>
                </view>
            </view>

            <!-- 主要负责人 -->
            <view class="section-card">
                <view class="section-header">
                    <text class="section-title">主要负责人</text>
                </view>
                <view class="leader-list" v-if="organization.leaders && organization.leaders.length > 0">
                    <view class="leader-item" v-for="(leader, index) in organization.leaders" :key="index">
                        <image class="leader-avatar" :src="leader.avatar" mode="aspectFill"></image>
                        <view class="leader-info">
                            <text class="leader-name">{{ leader.name }}</text>
                            <view class="leader-tag">{{ leader.position }}</view>
                        </view>
                    </view>
                </view>
                <view class="empty-state" v-else>
                    <text class="empty-text">暂无负责人信息</text>
                </view>
            </view>

            <!-- 主要活动 -->
            <view class="section-card">
                <view class="section-header">
                    <text class="section-title">主要活动</text>
                    <!-- <text class="more-link" v-if="organization.activities.length > 0">查看全部 ›</text> -->
                </view>
                <view class="activity-timeline" v-if="organization.activities && organization.activities.length > 0">
                    <view class="timeline-item" v-for="(activity, index) in organization.activities" :key="index"
                        @tap="goToActivityDetail(activity)">
                        <view class="timeline-line"></view>
                        <view class="timeline-dot"></view>
                        <view class="timeline-content">
                            <text class="activity-name">{{ activity.name || activity }}</text>
                            <text class="activity-time" v-if="activity.time">{{ activity.time }}</text>
                        </view>
                    </view>
                </view>
                <view class="empty-state" v-else>
                    <text class="empty-text">暂无活动信息</text>
                </view>
            </view>

            <!-- 荣誉成就 -->
            <view class="section-card" v-if="organization.honors && organization.honors.length > 0">
                <view class="section-header">
                    <text class="section-title">荣誉成就</text>
                </view>
                <view class="honor-list">
                    <view class="honor-item" v-for="(honor, index) in organization.honors" :key="index">
                        <view class="honor-icon">🏆</view>
                        <view class="honor-content">
                            <text class="honor-title">{{ honor.title }}</text>
                            <text class="honor-year" v-if="honor.year">{{ honor.year }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作 -->
        <view class="footer-actions">
            <!-- 管理员显示管理按钮 -->
            <button v-if="isAdmin" class="action-btn manage-btn" @tap="manageOrg">
                <text class="btn-icon">⚙️</text>
                <text class="btn-text">管理组织</text>
            </button>
            <!-- 普通成员显示已加入状态 -->
            <button v-else-if="isMember" class="action-btn member-btn" disabled>
                <text class="btn-icon">✓</text>
                <text class="btn-text">已加入</text>
            </button>
            <!-- 非成员显示申请加入按钮 -->
            <button v-else class="action-btn join-btn" @tap="joinOrg">
                <text class="btn-icon">✨</text>
                <text class="btn-text">申请加入</text>
            </button>
        </view>
    </view>
</template>
<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrganizationDetail, applyOrganization, } from '@/api/organization'
import { getActivityList } from '@/api/activity'

// 是否为组织成员
const isMember = ref(false)

// 是否为管理员
const isAdmin = ref(false)

const organizationLevelsMap = ref({})

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
            const data = res
            const org = data.organization

            // 解析主要负责人 - 从 API 根级别的 mainLeaders 数组获取
            const leaders = parseLeadersFromAPI(data.mainLeaders || [])

            // 解析荣誉成就
            const honors = parseHonors(org.honors)

            // 加载组织的活动列表（替代 mainActivities 字段）
            let activities = []
            try {
                const activityRes = await getActivityList({
                    organizationId: id,
                    pageNum: 1,
                    pageSize: 5 // 只显示最近5个活动
                })
                console.log('组织活动响应:', activityRes)
                if (activityRes && activityRes.rows) {
                    activities = activityRes.rows.map(activity => ({
                        id: activity.activityId,
                        name: activity.activityName,
                        time: formatActivityTime(activity.activityStartTime),
                        status: activity.currentStatus
                    }))
                }
            } catch (error) {
                console.error('加载组织活动失败:', error)
                // 如果活动列表加载失败，尝试使用 mainActivities 字段
                activities = parseActivities(org.mainActivities)
            }

            organization.value = {
                id: org.organizationId,
                name: org.organizationName,
                logo: org.organizationLogo || org.recommendImage || 'https://picsum.photos/300/300?random=20',
                intro: org.introduction || org.displayText || '暂无简介',
                level: org.organizationLevel,
                college: org.collegeName, // 暂时展示ID，后续可能需要字典映射
                className: org.className,
                memberCount: org.memberCount || 0,
                foundedYear: org.establishYear || '未知',
                location: org.officeLocation || '',
                contact: org.contactPhone || org.contactEmail || '',
                leaders: leaders,
                activities: activities,
                honors: honors
            }

            // 设置是否为成员和角色
            isMember.value = data.isMember === true
            if (isMember.value) {
                // memberRole: "2"=主席, "1"=管理员, "0"=普通成员
                isAdmin.value = data.memberRole === '2' || data.memberRole === '1'
            }

            console.log('组织详情加载成功:', organization.value)
            console.log('是否为成员:', isMember.value)
            console.log('是否为管理员:', isAdmin.value)
        }
    } catch (error) {
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
    // checkAdminStatus(id) // Removed redundant check
})


// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        '1': '校级组织',
        '2': '院级组织',
        '3': '班级组织'
    }
    return levelMap[level] || '未知'
}

// 管理组织
const manageOrg = () => {
    uni.navigateTo({
        url: `/pages/org-manage/org-manage?id=${organization.value.id}`
    })
}

// 格式化活动时间
const formatActivityTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    try {
        const date = new Date(dateTimeStr)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${month}-${day} ${hours}:${minutes}`
    } catch (error) {
        return ''
    }
}

// 跳转到活动详情
const goToActivityDetail = (activity) => {
    // 如果是对象格式（从API获取），跳转到详情页
    if (activity.id) {
        uni.navigateTo({
            url: `/pages/activity-detail/activity-detail?id=${activity.id}`
        })
    }
    // 如果是字符串格式（从 mainActivities 字段解析），不跳转
}

// 申请加入
const joinOrg = async () => {
    try {
        const token = uni.getStorageSync('userToken')
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        const res = await uni.showModal({
            title: '申请加入',
            content: ``,
            editable: true,
            placeholderText: '请输入申请理由'
        })

        if (res.confirm) {
            const applyReason = res.content || '我想加入这个组织'

            try {
                await applyOrganization({
                    organizationId: Number(organization.value.id),
                    applyReason: applyReason
                })

                uni.showToast({
                    title: '申请已提交',
                    icon: 'none'
                })
            } catch (error) {
                uni.showToast({
                    title: error.message || '申请失败',
                    icon: 'none',
                    duration: 3000
                })
            }
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
.page {
    min-height: 100vh;
    background: #f5f7fa;
    position: relative;
    padding-bottom: 140rpx;
}

.bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 420rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
    z-index: 0;
}

/* 组织头部 */
.org-header {
    position: relative;
    z-index: 1;
    padding: 40rpx 30rpx 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
}

.logo-wrapper {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: #fff;
    padding: 6rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 24rpx;

    .org-logo-large {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
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
    text-align: center;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.org-tags {
    display: flex;
    gap: 16rpx;
    justify-content: center;
    flex-wrap: wrap;

    .tag {
        padding: 6rpx 20rpx;
        border-radius: 30rpx;
        font-size: 24rpx;

        &.level-tag {
            background: rgba(255, 255, 255, 0.2);
            border: 1rpx solid rgba(255, 255, 255, 0.4);
        }

        &.college-tag {
            background: rgba(255, 255, 255, 0.9);
            color: #667eea;
        }
    }
}

/* 内容区域 */
.content-area {
    position: relative;
    z-index: 1;
    padding: 0 30rpx;
    margin-top: -40rpx;
}

.section-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-left: 16rpx;
    border-left: 6rpx solid #667eea;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
}

.more-link {
    font-size: 24rpx;
    color: #999;
}

/* 组织简介 */
.intro-content {
    .org-intro-text {
        font-size: 28rpx;
        color: #444;
        line-height: 1.8;
        text-align: justify;
    }
}

/* 基本信息网格 */
.info-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
}

.info-item {
    width: calc(50% - 12rpx);
    background: #f8f9ff;
    padding: 20rpx;
    border-radius: 12rpx;
    box-sizing: border-box;

    &.full-width {
        width: 100%;
    }

    .info-label {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
        display: block;
    }

    .info-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        word-break: break-all;
    }
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
    gap: 24rpx;
    padding: 20rpx;
    background: #fff;
    border: 1rpx solid #f0f0f0;
    border-radius: 16rpx;
    transition: all 0.3s;

    &:active {
        background: #f9f9f9;
    }
}

.leader-avatar {
    width: 90rpx;
    height: 90rpx;
    border-radius: 50%;
    border: 2rpx solid #f0f0f0;
}

.leader-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.leader-name {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
}

.leader-tag {
    display: inline-block;
    font-size: 22rpx;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    align-self: flex-start;
}

/* 活动时间轴 */
.activity-timeline {
    padding: 10rpx 0;
}

.timeline-item {
    position: relative;
    padding-left: 40rpx;
    padding-bottom: 40rpx;

    &:last-child {
        padding-bottom: 0;

        .timeline-line {
            display: none;
        }
    }
}

.timeline-line {
    position: absolute;
    left: 10rpx;
    top: 24rpx;
    bottom: 0;
    width: 2rpx;
    background: #e0e0e0;
}

.timeline-dot {
    position: absolute;
    left: 0;
    top: 12rpx;
    width: 22rpx;
    height: 22rpx;
    border-radius: 50%;
    background: #fff;
    border: 6rpx solid #667eea;
    box-sizing: border-box;
    z-index: 1;
}

.timeline-content {
    background: #f8f9ff;
    padding: 20rpx;
    border-radius: 12rpx;

    .activity-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        margin-bottom: 8rpx;
        display: block;
    }

    .activity-time {
        font-size: 24rpx;
        color: #999;
    }
}

/* 荣誉列表 */
.honor-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.honor-item {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 24rpx;
    background: linear-gradient(to right, #fff, #fcfcfc);
    border: 1rpx solid #f0f0f0;
    border-radius: 16rpx;
}

.honor-icon {
    font-size: 40rpx;
}

.honor-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .honor-title {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
    }

    .honor-year {
        font-size: 24rpx;
        color: #999;
    }
}

/* 空状态 */
.empty-state {
    padding: 40rpx 0;
    text-align: center;

    .empty-text {
        font-size: 26rpx;
        color: #999;
    }
}

/* 底部操作栏 */
.footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.action-btn {
    width: 100%;
    height: 90rpx;
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border: none;
    font-size: 32rpx;
    font-weight: 500;
    transition: all 0.3s;

    &::after {
        border: none;
    }

    &:active {
        transform: scale(0.98);
        opacity: 0.9;
    }

    &.manage-btn {
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
        color: #fff;
    }

    &.join-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
    }

    &.member-btn {
        background: #f5f7fa;
        color: #999;
    }
}
</style>

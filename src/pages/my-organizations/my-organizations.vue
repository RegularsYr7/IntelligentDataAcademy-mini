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
            <view class="recommend-section" v-if="recommendOrganizations.length > 0">
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
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 我参与的组织
const myOrganizations = ref([
    {
        id: 1,
        name: '学生会',
        logo: 'https://picsum.photos/200/200?random=10',
        intro: '校学生会是在校党委领导、校团委指导下的学生组织，服务全校师生',
        level: 'school',
        memberCount: 120,
        foundedYear: '2010',
        myRole: '主席'
    },
    {
        id: 4,
        name: '数据学院学生会',
        logo: 'https://picsum.photos/200/200?random=13',
        intro: '数据科学与大数据技术学院学生会，服务学院全体学生',
        level: 'college',
        memberCount: 45,
        foundedYear: '2018',
        myRole: '副主席'
    },
    {
        id: 5,
        name: '计算机协会',
        logo: 'https://picsum.photos/200/200?random=14',
        intro: '计算机技术交流与学习平台，定期举办技术分享会',
        level: 'college',
        memberCount: 68,
        foundedYear: '2016',
        myRole: '技术部部长'
    },
    {
        id: 7,
        name: '数据21-1班委会',
        logo: 'https://picsum.photos/200/200?random=16',
        intro: '数据科学21-1班班委会，为班级同学服务',
        level: 'class',
        memberCount: 8,
        foundedYear: '2021',
        myRole: '班长'
    }
])

// 推荐组织
const recommendOrganizations = ref([
    {
        id: 2,
        name: '科技创新协会',
        logo: 'https://picsum.photos/200/200?random=11',
        intro: '致力于培养学生科技创新能力',
        level: 'school',
        memberCount: 85
    },
    {
        id: 3,
        name: '青年志愿者协会',
        logo: 'https://picsum.photos/200/200?random=12',
        intro: '传递爱心，服务社会',
        level: 'school',
        memberCount: 150
    },
    {
        id: 9,
        name: '摄影协会',
        logo: 'https://picsum.photos/200/200?random=18',
        intro: '用镜头记录美好',
        level: 'school',
        memberCount: 42
    }
])

// 统计数据
const leaderCount = computed(() => {
    return myOrganizations.value.filter(org =>
        org.myRole && !org.myRole.includes('成员')
    ).length
})

const totalMembers = computed(() => {
    return myOrganizations.value.reduce((sum, org) => sum + org.memberCount, 0)
})

onLoad(() => {
    console.log('我的组织页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【我的组织页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取我加入的组织列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/organizations/my')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        role: 'all', // all | admin | member (筛选我的角色)
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
                    name: '数据科学社团',
                    logo: 'https://example.com/logo.jpg',
                    level: 'school',
                    memberCount: 156,
                    activityCount: 28,
                    myRole: 'admin', // president | admin | member
                    joinTime: '2024-09-01 10:30',
                    isActive: true // 组织是否活跃
                }
            ],
            total: 5,
            roleCounts: {
                all: 5,
                admin: 2, // 包含president
                member: 3
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📍 接口2: 退出组织')
    console.log('━'.repeat(80))
    console.log('请求方式: DELETE')
    console.log('接口路径: /api/organizations/:id/quit')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('📝 社长不能直接退出,需要先转让社长职位')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        school: '校级',
        college: '院级',
        class: '班级'
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

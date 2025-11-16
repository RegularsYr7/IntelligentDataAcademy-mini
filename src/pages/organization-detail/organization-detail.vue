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

// 是否为管理员
const isAdmin = ref(false)

// 组织详情数据
const organization = ref({
    id: 1,
    name: '科技创新协会',
    logo: 'https://picsum.photos/300/300?random=20',
    intro: '科技创新协会成立于2015年，是校级学生科技组织。协会致力于培养学生的科技创新能力，提供科技交流平台，组织各类科技竞赛和技术分享活动。我们秉承"创新引领未来"的理念，为广大科技爱好者提供展示才华的舞台。',
    level: 'school',
    college: '数据科学与大数据技术学院',
    className: '',
    memberCount: 85,
    foundedYear: '2015',
    location: '学生活动中心301室',
    contact: 'tech_innovation@example.com',
    leaders: [
        {
            name: '张三',
            position: '会长',
            avatar: 'https://picsum.photos/100/100?random=30'
        },
        {
            name: '李四',
            position: '副会长',
            avatar: 'https://picsum.photos/100/100?random=31'
        },
        {
            name: '王五',
            position: '技术部长',
            avatar: 'https://picsum.photos/100/100?random=32'
        }
    ],
    activities: [
        '每月举办技术分享会',
        '组织参加各类科技竞赛',
        '开展创新创业项目孵化',
        '定期举办编程马拉松活动',
        '与企业合作开展技术培训'
    ],
    honors: [
        {
            year: '2024',
            title: '全国大学生科技创新大赛一等奖'
        },
        {
            year: '2023',
            title: '省级优秀学生社团'
        },
        {
            year: '2022',
            title: '校级十佳社团'
        }
    ]
})

onLoad((options) => {
    const id = options.id
    if (id) {
        loadOrgDetail(id)
    }
    console.log('组织详情页加载', id)

    // 检查当前用户是否为管理员
    checkAdminStatus(id)

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【组织详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取组织详情
    console.log('📍 接口1: 获取组织详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/organizations/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({
        id: 1 // 组织ID
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            name: '数据科学与人工智能社团',
            logo: 'https://example.com/logo.png',
            intro: '组织简介...',
            level: 'school', // school-校级, college-院级, class-班级
            college: '计算机科学与技术学院', // 可选
            className: '计科2021级1班', // 可选,班级组织专用
            memberCount: 156,
            foundedYear: '2020',
            location: '科技楼A301',
            contact: 'ai-club@example.com',
            leaders: [ // 组织负责人列表
                {
                    name: '张三',
                    position: '会长',
                    avatar: 'https://example.com/avatar1.png'
                }
            ],
            activities: [ // 主要活动列表
                '每月举办技术分享会',
                '组织参加各类科技竞赛'
            ],
            honors: [ // 荣誉列表
                {
                    year: '2024',
                    title: '全国大学生科技创新大赛一等奖'
                }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 检查当前用户是否为组织管理员
    console.log('📍 接口2: 检查用户管理员权限')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/organizations/:id/check-admin')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        id: 1 // 组织ID
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            isAdmin: true, // 是否为管理员
            role: 'president' // president-主席, admin-管理员, member-普通成员
        }
    }, null, 2))
    console.log('\n')

    // 接口3: 申请加入组织
    console.log('📍 接口3: 申请加入组织')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/organizations/:id/join')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        id: 1, // 组织ID
        reason: '申请理由' // 可选
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '申请已提交，请等待审核'
    }, null, 2))
    console.log('\n')

    // 数据字典
    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('组织级别 (level):')
    console.log(JSON.stringify({
        school: '校级组织',
        college: '院级组织',
        class: '班级组织'
    }, null, 2))
    console.log('\n用户角色 (role):')
    console.log(JSON.stringify({
        president: '主席/会长',
        admin: '管理员',
        member: '普通成员'
    }, null, 2))
    console.log('\n')

    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 必填字段: id, name, level, memberCount, foundedYear')
    console.log('2. 可选字段: logo, intro, college, className, location, contact, leaders, activities, honors')
    console.log('3. 权限控制: 管理员可以编辑组织信息和管理成员')
    console.log('4. 申请加入: 需要登录,提交后等待管理员审核')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 检查管理员状态
const checkAdminStatus = (orgId) => {
    // TODO: 从服务器验证当前用户是否为该组织管理员
    // 模拟:ID为1或4的组织,当前用户是管理员
    if (orgId == 1 || orgId == 4) {
        isAdmin.value = true
    }
}

// 加载组织详情
const loadOrgDetail = (id) => {
    // TODO: 从服务器加载数据
    console.log('加载组织详情', id)
}

// 获取级别文本
const getLevelText = (level) => {
    const levelMap = {
        school: '校级组织',
        college: '院级组织',
        class: '班级组织'
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
const joinOrg = () => {
    uni.showModal({
        title: '申请加入',
        content: `确定要申请加入${organization.value.name}吗？`,
        success: (res) => {
            if (res.confirm) {
                uni.showToast({
                    title: '申请已提交',
                    icon: 'success'
                })
            }
        }
    })
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

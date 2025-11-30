<template>
    <view class="org-manage">
        <!-- 顶部背景装饰 -->
        <view class="bg-decoration"></view>

        <!-- 头部信息 -->
        <view class="header-section">
            <view class="logo-wrapper">
                <image v-if="orgData.logo" :src="orgData.logo" mode="aspectFill" class="logo-image" />
                <view v-else class="logo-placeholder">
                    <text class="placeholder-icon">🏢</text>
                </view>
            </view>
            <view class="org-info">
                <view class="org-name">{{ orgData.name || '加载中...' }}</view>
                <view class="org-tags">
                    <view class="tag level-tag" v-if="orgData.level">{{ orgData.level }}</view>
                    <view class="tag college-tag" v-if="orgData.college">{{ orgData.college }}</view>
                </view>
            </view>
        </view>

        <!-- 内容区域 -->
        <view class="content-area">
            <!-- 基本信息卡片 -->
            <view class="info-card">
                <view class="card-header">
                    <text class="card-title">基本信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="item-label">成立年份</text>
                        <text class="item-value">{{ orgData.foundedYear ? orgData.foundedYear + '年' : '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="item-label">活动地点</text>
                        <text class="item-value">{{ orgData.location || '-' }}</text>
                    </view>
                    <view class="info-item">
                        <text class="item-label">联系方式</text>
                        <text class="item-value">{{ orgData.contact || '-' }}</text>
                    </view>
                </view>
            </view>

            <!-- 简介卡片 -->
            <view class="info-card">
                <view class="card-header">
                    <text class="card-title">组织简介</text>
                </view>
                <view class="intro-content">
                    <text>{{ orgData.intro || '暂无简介' }}</text>
                </view>
            </view>

            <!-- 管理入口 -->
            <view class="action-grid">
                <view class="action-item" @tap="goToMemberManage">
                    <view class="action-icon-wrapper blue">
                        <text class="action-icon">👥</text>
                    </view>
                    <view class="action-info">
                        <text class="action-title">人员管理</text>
                        <text class="action-desc">共 {{ orgData.peopleCount || 0 }} 人</text>
                    </view>
                    <text class="action-arrow">›</text>
                </view>

                <view class="action-item" @tap="goToPendingReviews" v-if="isAdmin">
                    <view class="action-icon-wrapper orange">
                        <text class="action-icon">📝</text>
                    </view>
                    <view class="action-info">
                        <text class="action-title">待审核列表</text>
                        <text class="action-desc">查看申请记录</text>
                    </view>
                    <text class="action-arrow">›</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrganizationDetail } from '@/api/organization'

const orgId = ref('')
const isAdmin = ref(false)
const peopleCount = ref(0)

const orgData = ref({
    organizationId: null,
    logo: '',
    name: '',
    level: '',
    college: '',
    foundedYear: '',
    intro: '',
    location: '',
    contact: '',
    memberCount: 0
})

onLoad((options) => {
    if (options.id) {
        orgId.value = options.id
        loadOrgData(options.id)
    }
})

const loadOrgData = async (id) => {
    try {
        const res = await getOrganizationDetail(id)
        if (res && res.organization) {
            const org = res.organization
            orgData.value = {
                organizationId: org.organizationId,
                logo: org.organizationLogo || org.recommendImage,
                name: org.organizationName,
                level: getLevelText(org.organizationLevel),
                college: org.collegeName,
                foundedYear: org.establishYear,
                intro: org.introduction || org.displayText,
                location: org.officeLocation,
                contact: org.contactPhone,
                memberCount: org.memberCount
            }

            // Check admin permission
            if (res.isMember) {
                // memberRole: "2"=主席, "1"=管理员, "0"=普通成员
                isAdmin.value = res.memberRole === '2' || res.memberRole === '1'
            }

            if (res.totalMemberCount !== undefined) {
                orgData.value.peopleCount = res.totalMemberCount
            }
        }
    } catch (error) {
        console.error('加载组织信息失败:', error)

    }
}

const getLevelText = (level) => {
    const map = { '1': '校级', '2': '院级', '3': '班级', '0': '其他' }
    return map[level] || '未知'
}

const goToMemberManage = () => {
    uni.navigateTo({
        url: `/pages/member-manage/member-manage?id=${orgId.value}`
    })
}

const goToPendingReviews = () => {
    uni.navigateTo({
        url: `/pages/pending-reviews/pending-reviews?orgId=${orgId.value}`
    })
}
</script>

<style lang="scss" scoped>
.org-manage {
    min-height: 100vh;
    background: #f5f7fa;
    position: relative;
    padding-bottom: 40rpx;
}

.bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 420rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
    z-index: 0;
}

.header-section {
    position: relative;
    z-index: 1;
    padding: 40rpx 30rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30rpx;
}

.logo-wrapper {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: #fff;
    padding: 6rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
    margin-bottom: 20rpx;

    .logo-image {
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }

    .logo-placeholder {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: #f0f2f5;
        display: flex;
        align-items: center;
        justify-content: center;

        .placeholder-icon {
            font-size: 60rpx;
        }
    }
}

.org-info {
    text-align: center;

    .org-name {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 16rpx;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .org-tags {
        display: flex;
        gap: 16rpx;
        justify-content: center;

        .tag {
            padding: 4rpx 16rpx;
            border-radius: 20rpx;
            font-size: 22rpx;

            &.level-tag {
                background: rgba(255, 255, 255, 0.2);
                color: #fff;
                border: 1rpx solid rgba(255, 255, 255, 0.4);
            }

            &.college-tag {
                background: rgba(255, 255, 255, 0.9);
                color: #667eea;
            }
        }
    }
}

.content-area {
    position: relative;
    z-index: 1;
    padding: 0 30rpx;
}

.info-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

    .card-header {
        margin-bottom: 24rpx;
        padding-left: 16rpx;
        border-left: 6rpx solid #667eea;

        .card-title {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
        }
    }
}

.info-list {
    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f5f5f5;

        &:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .item-label {
            color: #666;
            font-size: 28rpx;
        }

        .item-value {
            color: #333;
            font-size: 28rpx;
            font-weight: 500;
            max-width: 70%;
            text-align: right;
        }
    }
}

.intro-content {
    font-size: 28rpx;
    color: #444;
    line-height: 1.6;
    text-align: justify;
}

.action-grid {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.action-item {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    &:active {
        transform: scale(0.98);
    }

    .action-icon-wrapper {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;

        &.blue {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
        }

        &.orange {
            background: rgba(255, 159, 67, 0.1);
            color: #ff9f43;
        }

        .action-icon {
            font-size: 40rpx;
        }
    }

    .action-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6rpx;

        .action-title {
            font-size: 30rpx;
            font-weight: 600;
            color: #333;
        }

        .action-desc {
            font-size: 24rpx;
            color: #999;
        }
    }

    .action-arrow {
        font-size: 36rpx;
        color: #ccc;
    }
}
</style>

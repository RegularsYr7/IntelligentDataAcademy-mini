<template>
    <view class="member-manage">
        <!-- 统计信息 -->
        <view class="stats-card">
            <view class="stat-item">
                <view class="stat-value">{{ memberList.length }}</view>
                <view class="stat-label">总成员</view>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
                <view class="stat-value">{{ adminCount }}</view>
                <view class="stat-label">管理员</view>
            </view>
            <view class="stat-divider"></view>
            <view class="stat-item">
                <view class="stat-value">{{ memberCount }}</view>
                <view class="stat-label">普通成员</view>
            </view>
        </view>

        <!-- 成员列表 -->
        <view class="member-list">
            <view v-for="member in memberList" :key="member.id" class="member-item">
                <view class="member-info">
                    <image :src="member.avatar" mode="aspectFill" class="avatar" />
                    <view class="info-content">
                        <view class="name-row">
                            <text class="name">{{ member.name }}</text>
                            <text v-if="member.isPresident" class="president-badge">主席</text>
                            <text v-else-if="member.isAdmin" class="admin-badge">管理员</text>
                        </view>
                        <view class="detail-row">
                            <text class="position">{{ member.position }}</text>
                            <text class="divider">|</text>
                            <text class="join-date">{{ member.joinDate }}加入</text>
                        </view>
                    </view>
                </view>

                <view class="action-area" v-if="hasPermission(member)">
                    <!-- 展开的按钮 -->
                    <view v-if="member.showActions" class="action-buttons">
                        <!-- 目标是管理员 -->
                        <template v-if="member.isAdmin">
                            <!-- 只有主席能取消管理员 -->
                            <button v-if="isCurrentUserPresident" class="demote-btn" @tap.stop="confirmDemote(member)">
                                取消管理员
                            </button>
                        </template>
                        <!-- 目标是普通成员 -->
                        <template v-else>
                            <!-- 只有主席能设为管理员 -->
                            <button v-if="isCurrentUserPresident" class="promote-btn"
                                @tap.stop="confirmPromote(member)">
                                设为管理员
                            </button>
                            <!-- 主席或管理员能移除 -->
                            <button class="remove-btn" @tap.stop="confirmRemove(member)">
                                移除
                            </button>
                        </template>
                    </view>

                    <!-- 三个点按钮 -->
                    <view class="more-btn" @tap.stop="toggleActions(member)">
                        <text class="dot"></text>
                        <text class="dot"></text>
                        <text class="dot"></text>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="memberList.length === 0" class="empty-state">
                <text class="empty-icon">👥</text>
                <text class="empty-text">暂无成员</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrganizationMembers, removeMember, setAdmin, removeAdmin } from '@/api/organization'

const orgId = ref('')
const memberList = ref([])
const currentUserRole = ref('0')

const isCurrentUserPresident = computed(() => currentUserRole.value === '2')
const isCurrentUserAdmin = computed(() => currentUserRole.value === '1')
const canManage = computed(() => isCurrentUserPresident.value || isCurrentUserAdmin.value)

// 计算管理员和普通成员数量
const adminCount = computed(() => {
    return memberList.value.filter(m => m.isAdmin || m.isPresident).length
})

const memberCount = computed(() => {
    return memberList.value.filter(m => !m.isAdmin && !m.isPresident).length
})

onLoad((options) => {
    if (options.id) {
        orgId.value = options.id
        loadMembers(options.id)
    }
})

const loadMembers = async (id) => {
    try {
        const res = await getOrganizationMembers(id)
        // Handle different response structures
        let list = []
        if (res && res.members) {
            list = res.members
        } else if (res && res.rows) {
            list = res.rows
        } else if (Array.isArray(res)) {
            list = res
        } else if (res && res.data && Array.isArray(res.data)) {
            list = res.data
        }

        const userInfo = uni.getStorageSync('userInfo')
        const currentUserId = userInfo.studentId || userInfo.id

        memberList.value = list.map(m => {
            const mId = m.studentId || m.memberId || m.id
            // 识别当前用户角色
            if (String(m.studentId) === String(currentUserId)) {
                currentUserRole.value = m.memberRole
            }

            return {
                id: mId, // Ensure we have an ID for operations
                studentId: m.studentId,
                name: m.studentName || m.name || '未知',
                avatar: m.avatarUrl || m.avatar || 'https://picsum.photos/100/100',
                position: m.memberTag || getRoleName(m.memberRole),
                joinDate: m.joinTime ? m.joinTime.substring(0, 7) : '未知',
                isPresident: m.memberRole === '2',
                isAdmin: m.memberRole === '1',
                showActions: false,
                memberRole: m.memberRole
            }
        })
    } catch (error) {
        console.error('加载成员失败:', error)

    }
}

const getRoleName = (role) => {
    const map = { '2': '主席', '1': '管理员', '0': '成员' }
    return map[role] || '成员'
}

const isSelf = (member) => {
    const userInfo = uni.getStorageSync('userInfo')
    const currentUserId = userInfo.studentId || userInfo.id
    return String(member.studentId) === String(currentUserId)
}

const hasPermission = (member) => {
    if (isSelf(member)) return false // 不能操作自己
    if (member.isPresident) return false // 不能操作主席

    if (isCurrentUserPresident.value) return true // 主席可以操作除自己和主席外的所有人

    if (isCurrentUserAdmin.value) {
        // 管理员只能操作普通成员
        return !member.isAdmin && !member.isPresident
    }

    return false
}

const toggleActions = (member) => {
    if (!hasPermission(member)) return

    const currentState = member.showActions
    memberList.value.forEach(m => m.showActions = false)
    member.showActions = !currentState
}

const confirmPromote = (member) => {
    uni.showModal({
        title: '设为管理员',
        content: `确定要将 ${member.name} 设为管理员吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const token = uni.getStorageSync('userToken')
                    if (!token) {
                        uni.showToast({ title: '请先登录', icon: 'none' })
                        return
                    }
                    await setAdmin({
                        targetStudentId: member.studentId,
                        organizationId: orgId.value
                    })
                    uni.showToast({ title: '操作成功', icon: 'success' })
                    loadMembers(orgId.value)
                } catch (e) {
                }
            }
        }
    })
}

const confirmDemote = (member) => {
    uni.showModal({
        title: '取消管理员',
        content: `确定要取消 ${member.name} 的管理员身份吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const token = uni.getStorageSync('userToken')
                    if (!token) {
                        uni.showToast({ title: '请先登录', icon: 'none' })
                        return
                    }
                    await removeAdmin({
                        targetStudentId: member.studentId,
                        organizationId: orgId.value
                    })
                    uni.showToast({ title: '操作成功', icon: 'success' })
                    loadMembers(orgId.value)
                } catch (e) {
                }
            }
        }
    })
}

const confirmRemove = (member) => {
    uni.showModal({
        title: '移除成员',
        content: `确定要将 ${member.name} 移出组织吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    const token = uni.getStorageSync('userToken')
                    if (!token) {
                        uni.showToast({ title: '请先登录', icon: 'none' })
                        return
                    }
                    await removeMember({
                        targetStudentId: member.studentId,
                        organizationId: orgId.value
                    })
                    uni.showToast({ title: '操作成功', icon: 'success' })
                    loadMembers(orgId.value)
                } catch (e) {
                }
            }
        }
    })

}
</script>

<style lang="scss" scoped>
.member-manage {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
    padding: 20rpx;
}

.stats-card {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    border-radius: 20rpx;
    padding: 40rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 20rpx;
    box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.3);
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
}

.stat-value {
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
}

.stat-label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
    width: 2rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
}

.member-list {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.08);
}

.member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 30rpx;
    border-bottom: 2rpx solid #f5f5f5;
    transition: background 0.3s;

    &:last-child {
        border-bottom: none;
    }

    &:active {
        background: #f8f9ff;
    }
}

.member-info {
    display: flex;
    align-items: center;
    gap: 20rpx;
    flex: 1;
    min-width: 0;
}

.avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    border: 4rpx solid #f0f0f0;
    flex-shrink: 0;
}

.info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
}

.name-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
}

.name {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
}

.president-badge {
    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
    color: #fff;
    font-size: 18rpx;
    padding: 3rpx 10rpx;
    border-radius: 6rpx;
    font-weight: 500;
}

.admin-badge {
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-size: 18rpx;
    padding: 3rpx 10rpx;
    border-radius: 6rpx;
    font-weight: 500;
}

.detail-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 22rpx;
    color: #999;
}

.position {
    color: #667eea;
    font-weight: 500;
}

.divider {
    color: #ddd;
}

.join-date {
    color: #999;
}

.action-area {
    display: flex;
    align-items: center;
    gap: 12rpx;
    position: relative;
}

.action-buttons {
    display: flex;
    gap: 8rpx;
    align-items: center;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(20rpx);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.more-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    border-radius: 50%;
    transition: all 0.3s;

    &:active {
        background: #f0f0f0;
    }
}

.dot {
    width: 6rpx;
    height: 6rpx;
    background: #999;
    border-radius: 50%;
}

.promote-btn {
    padding: 12rpx 20rpx;
    background: #fff;
    border: 2rpx solid #667eea;
    border-radius: 24rpx;
    font-size: 22rpx;
    color: #667eea;
    transition: all 0.3s;
    white-space: nowrap;

    &::after {
        border: none;
    }

    &:active {
        background: #667eea;
        color: #fff;
        transform: scale(0.95);
    }
}

.demote-btn {
    padding: 12rpx 20rpx;
    background: #fff;
    border: 2rpx solid #ff9800;
    border-radius: 24rpx;
    font-size: 22rpx;
    color: #ff9800;
    transition: all 0.3s;
    white-space: nowrap;

    &::after {
        border: none;
    }

    &:active {
        background: #ff9800;
        color: #fff;
        transform: scale(0.95);
    }
}

.remove-btn {
    padding: 12rpx 24rpx;
    background: #fff;
    border: 2rpx solid #ff6b6b;
    border-radius: 24rpx;
    font-size: 22rpx;
    color: #ff6b6b;
    transition: all 0.3s;
    white-space: nowrap;

    &::after {
        border: none;
    }

    &:active {
        background: #ff6b6b;
        color: #fff;
        transform: scale(0.95);
    }
}

.protected-tag {
    padding: 12rpx 20rpx;
    background: #f5f5f5;
    border-radius: 24rpx;
    font-size: 22rpx;
    color: #999;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    gap: 20rpx;
}

.empty-icon {
    font-size: 80rpx;
    opacity: 0.3;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>

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

                <view class="action-area">
                    <!-- 展开的按钮 -->
                    <view v-if="member.showActions" class="action-buttons">
                        <!-- 主席不显示按钮 -->
                        <template v-if="!member.isPresident">
                            <!-- 管理员只能取消管理员 -->
                            <button v-if="member.isAdmin" class="demote-btn" @tap.stop="confirmDemote(member)">
                                取消管理员
                            </button>
                            <!-- 普通成员可以设为管理员或移除 -->
                            <template v-else>
                                <button class="promote-btn" @tap.stop="confirmPromote(member)">
                                    设为管理员
                                </button>
                                <button class="remove-btn" @tap.stop="confirmRemove(member)">
                                    移除
                                </button>
                            </template>
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

const orgId = ref('')
const memberList = ref([])

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

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【人员管理页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取成员列表
    console.log('📍 接口1: 获取组织成员列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/organizations/:id/members')
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
            members: [
                {
                    id: 1,
                    name: '张三',
                    avatar: 'https://example.com/avatar.png',
                    position: '会长',
                    joinDate: '2020-09', // 加入时间,格式: YYYY-MM
                    isPresident: true, // 是否为主席
                    isAdmin: false // 是否为管理员
                }
            ],
            statistics: { // 统计信息
                total: 156, // 总成员数
                adminCount: 5, // 管理员数(含主席)
                memberCount: 151 // 普通成员数
            }
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 设为管理员
    console.log('📍 接口2: 设为管理员')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/organizations/:orgId/members/:memberId/promote')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        orgId: 1, // 组织ID
        memberId: 3 // 成员ID
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '已设为管理员'
    }, null, 2))
    console.log('\n')

    // 接口3: 取消管理员
    console.log('📍 接口3: 取消管理员')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/organizations/:orgId/members/:memberId/demote')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        orgId: 1,
        memberId: 3
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '已取消管理员'
    }, null, 2))
    console.log('\n')

    // 接口4: 移除成员
    console.log('📍 接口4: 移除成员')
    console.log('━'.repeat(80))
    console.log('请求方式: DELETE')
    console.log('接口路径: /api/organizations/:orgId/members/:memberId')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        orgId: 1,
        memberId: 5
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '移除成功'
    }, null, 2))
    console.log('\n')

    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 权限验证: 只有主席才能执行设为/取消管理员、移除成员操作')
    console.log('2. 主席不可被移除或取消管理员')
    console.log('3. 管理员需先取消管理员身份才可移除')
    console.log('4. 操作日志: 建议记录所有人员变更操作')
    console.log('5. 成员统计: 每次操作后需更新统计数据')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 切换操作按钮显示
const toggleActions = (member) => {
    // 主席不显示操作按钮
    if (member.isPresident) {
        return
    }

    const currentState = member.showActions

    // 关闭所有成员的操作按钮
    memberList.value.forEach(m => {
        m.showActions = false
    })

    // 切换当前成员的操作按钮
    member.showActions = !currentState
}

// 加载成员列表
const loadMembers = (id) => {
    // TODO: 从服务器加载成员数据
    // 模拟数据
    setTimeout(() => {
        if (id == 1) {
            memberList.value = [
                {
                    id: 1,
                    name: '张三',
                    avatar: 'https://via.placeholder.com/100',
                    position: '会长',
                    joinDate: '2020-09',
                    isPresident: true,
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 2,
                    name: '李四',
                    avatar: 'https://via.placeholder.com/100',
                    position: '副会长',
                    joinDate: '2020-09',
                    isAdmin: true,
                    showActions: false
                },
                {
                    id: 3,
                    name: '王五',
                    avatar: 'https://via.placeholder.com/100',
                    position: '技术部长',
                    joinDate: '2021-03',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 4,
                    name: '赵六',
                    avatar: 'https://via.placeholder.com/100',
                    position: '活动部长',
                    joinDate: '2021-03',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 5,
                    name: '孙七',
                    avatar: 'https://via.placeholder.com/100',
                    position: '普通成员',
                    joinDate: '2021-09',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 6,
                    name: '周八',
                    avatar: 'https://via.placeholder.com/100',
                    position: '普通成员',
                    joinDate: '2022-03',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 7,
                    name: '吴九',
                    avatar: 'https://via.placeholder.com/100',
                    position: '普通成员',
                    joinDate: '2022-09',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 8,
                    name: '郑十',
                    avatar: 'https://via.placeholder.com/100',
                    position: '普通成员',
                    joinDate: '2023-03',
                    isAdmin: false,
                    showActions: false
                }
            ]
        } else if (id == 4) {
            memberList.value = [
                {
                    id: 11,
                    name: '陈一',
                    avatar: 'https://via.placeholder.com/100',
                    position: '主席',
                    joinDate: '2019-09',
                    isPresident: true,
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 12,
                    name: '林二',
                    avatar: 'https://via.placeholder.com/100',
                    position: '副主席',
                    joinDate: '2019-09',
                    isAdmin: true,
                    showActions: false
                },
                {
                    id: 13,
                    name: '黄三',
                    avatar: 'https://via.placeholder.com/100',
                    position: '项目经理',
                    joinDate: '2020-03',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 14,
                    name: '刘四',
                    avatar: 'https://via.placeholder.com/100',
                    position: '普通成员',
                    joinDate: '2021-09',
                    isAdmin: false,
                    showActions: false
                },
                {
                    id: 15,
                    name: '何五',
                    avatar: 'https://via.placeholder.com/100',
                    position: '普通成员',
                    joinDate: '2022-03',
                    isAdmin: false,
                    showActions: false
                }
            ]
        }
    }, 300)
}

// 确认设为管理员
const confirmPromote = (member) => {
    member.showActions = false
    uni.showModal({
        title: '确认设为管理员',
        content: `确定要将"${member.name}"设为管理员吗?`,
        confirmText: '确认',
        confirmColor: '#667eea',
        cancelText: '取消',
        success: (res) => {
            if (res.confirm) {
                promoteToAdmin(member)
            }
        }
    })
}

// 设为管理员
const promoteToAdmin = (member) => {
    // TODO: 调用服务器API设为管理员
    uni.showLoading({ title: '处理中...' })

    setTimeout(() => {
        // 更新成员状态
        const index = memberList.value.findIndex(m => m.id === member.id)
        if (index > -1) {
            memberList.value[index].isAdmin = true
        }

        uni.hideLoading()
        uni.showToast({
            title: '已设为管理员',
            icon: 'success',
            duration: 1500
        })
    }, 500)
}

// 确认取消管理员
const confirmDemote = (member) => {
    member.showActions = false
    uni.showModal({
        title: '确认取消管理员',
        content: `确定要取消"${member.name}"的管理员身份吗?`,
        confirmText: '确认取消',
        confirmColor: '#ff9800',
        cancelText: '取消',
        success: (res) => {
            if (res.confirm) {
                demoteAdmin(member)
            }
        }
    })
}

// 取消管理员
const demoteAdmin = (member) => {
    // TODO: 调用服务器API取消管理员
    uni.showLoading({ title: '处理中...' })

    setTimeout(() => {
        // 更新成员状态
        const index = memberList.value.findIndex(m => m.id === member.id)
        if (index > -1) {
            memberList.value[index].isAdmin = false
        }

        uni.hideLoading()
        uni.showToast({
            title: '已取消管理员',
            icon: 'success',
            duration: 1500
        })
    }, 500)
}

// 确认移除成员
const confirmRemove = (member) => {
    member.showActions = false
    uni.showModal({
        title: '确认移除',
        content: `确定要移除成员"${member.name}"吗?此操作不可撤销。`,
        confirmText: '确认移除',
        confirmColor: '#ff6b6b',
        cancelText: '取消',
        success: (res) => {
            if (res.confirm) {
                removeMember(member)
            }
        }
    })
}

// 移除成员
const removeMember = (member) => {
    // TODO: 调用服务器API移除成员
    uni.showLoading({ title: '处理中...' })

    setTimeout(() => {
        // 从列表中移除
        const index = memberList.value.findIndex(m => m.id === member.id)
        if (index > -1) {
            memberList.value.splice(index, 1)
        }

        uni.hideLoading()
        uni.showToast({
            title: '移除成功',
            icon: 'success',
            duration: 1500
        })
    }, 500)
}
</script>

<style lang="scss" scoped>
.member-manage {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
    padding: 20rpx;
}

.stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

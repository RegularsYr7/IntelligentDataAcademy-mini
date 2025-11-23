<template>
    <view class="page">
        <view class="container">
            <!-- 活动图片 -->
            <view class="activity-banner">
                <image class="banner-image" :src="activity.coverImage" mode="aspectFill"></image>
                <view class="status-overlay">
                    <view class="status-badge" :class="'status-' + mapCurrentStatusToDisplay(currentStatus)">
                        {{ getStatusTextByCode(currentStatus) }}
                    </view>
                </view>
            </view>

            <!-- 活动基础信息 -->
            <view class="activity-header">
                <text class="activity-title">{{ activity.activityName }}</text>
                <view class="header-info">
                    <view class="info-item">
                        <text class="info-icon">📍</text>
                        <text class="info-text">{{ activity.activityLocation }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-icon">🆔</text>
                        <text class="info-text">活动编号: {{ activity.activityId }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-icon">👥</text>
                        <text class="info-text">{{ activity.currentParticipants }}/{{ activity.maxParticipants }}
                            人</text>
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
                        <text class="section-content">{{ activity.organizerNames }}</text>
                    </view>

                    <view class="detail-section">
                        <view class="section-title">
                            <text class="title-icon">📝</text>
                            <text class="title-text">活动详情</text>
                        </view>
                        <rich-text class="section-content" :nodes="formatRichText(activity.activityDetail)"></rich-text>
                    </view>

                    <view class="detail-section">
                        <view class="section-title">
                            <text class="title-icon">⚠️</text>
                            <text class="title-text">参与须知</text>
                        </view>
                        <text class="section-content">{{ activity.remark }}</text>
                    </view>
                </view>

                <!-- 信息 -->
                <view class="content-panel" v-if="currentTab === 1">
                    <view class="info-grid">
                        <view class="grid-item">
                            <text class="item-label">报名时间</text>
                            <view class="time-column">
                                <text class="time-text">{{ activity.registerStartTime }}</text>
                                <text class="time-separator">至</text>
                                <text class="time-text">{{ activity.registerEndTime }}</text>
                            </view>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动时间</text>
                            <view class="time-column">
                                <text class="time-text">{{ activity.activityStartTime }}</text>
                                <text class="time-separator">至</text>
                                <text class="time-text">{{ activity.activityEndTime }}</text>
                            </view>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动级别</text>
                            <text class="item-value">{{ activity.activityLevel }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">参与范围</text>
                            <text class="item-value">{{ activity.participateScope }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">活动请假</text>
                            <text class="item-value">{{ activity.allowLeave === 'Y' ? '支持' : '不支持' }}</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">最多报名</text>
                            <text class="item-value">{{ activity.maxParticipants }} 人</text>
                        </view>
                        <view class="grid-item">
                            <text class="item-label">量化分设置</text>
                            <text class="item-value">{{ activity.creditValue }} 量化分</text>
                        </view>
                    </view>

                    <!-- 活动标签 -->
                    <view class="tags-section">
                        <view class="section-title">
                            <text class="title-icon">🏷️</text>
                            <text class="title-text">活动标签</text>
                        </view>
                        <view class="tags-list">
                            <view class="tag-item" v-for="(tag, index) in parseActivityTags(activity.activityTags)"
                                :key="index">
                                {{ tag }}
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 人员 -->
                <view class="content-panel" v-if="currentTab === 2">
                    <view class="person-section">
                        <view class="section-title">
                            <text class="title-text">人员列表</text>
                        </view>
                        <view class="person-list-vertical">
                            <view class="person-row" v-for="(person, index) in sortedPersonnel" :key="index">
                                <view class="person-left">
                                    <image class="person-avatar-small"
                                        :src="person.avatar || 'https://picsum.photos/100/100'" mode="aspectFill">
                                    </image>
                                    <text class="person-name-text">{{ person.name }}</text>
                                </view>
                                <view class="person-right">
                                    <view class="role-tag" :class="getRoleClass(person.roleType)">
                                        {{ person.roleName }}
                                    </view>
                                </view>
                            </view>
                            <view v-if="sortedPersonnel.length === 0" class="empty-person">
                                <text>暂无人员信息</text>
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
                        <text class="location-address">{{ activity.activityLocation }}</text>

                        <!-- 地图 -->
                        <view class="map-container">
                            <map class="activity-map" :latitude="activity.latitude || 0"
                                :longitude="activity.longitude || 0" :markers="markers" :show-location="true"></map>
                        </view>

                        <!-- 坐标信息 -->
                        <view class="coordinate-info">
                            <text class="coordinate-text">经度: {{ activity.longitude || 0 }}</text>
                            <text class="coordinate-text">纬度: {{ activity.latitude || 0 }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部操作按钮 -->
            <view class="footer-action">
                <!-- 活动状态: 1=预热中, 2=报名中, 3=等待中, 4=进行中, 5=已结束, 6=已完结 -->

                <!-- 预热中: 显示即将开始 -->
                <view v-if="currentStatus === 1" class="status-tip">
                    <text>活动即将开始报名</text>
                </view>

                <!-- 报名中: 显示报名/取消报名按钮 -->
                <view v-if="currentStatus === 2" class="action-buttons">
                    <button class="signup-btn" :class="{ disabled: !canSignup }" :disabled="!canSignup"
                        @tap="handleSignup">
                        {{ getSignupText() }}
                    </button>

                    <!-- 管理员: 管理活动按钮 -->
                    <button v-if="isLeader" class="manage-btn" @tap="goToManage">
                        <text>管理活动</text>
                    </button>
                </view>

                <!-- 等待中: 报名结束，等待活动开始 -->
                <view v-if="currentStatus === 3" class="status-tip">
                    <text>报名已结束，等待活动开始</text>
                </view>

                <!-- 活动进行中: 显示签到按钮(参与者) 或 管理活动按钮(管理员) -->
                <view v-if="currentStatus === 4" class="action-buttons">
                    <!-- 普通参与者: 签到按钮 -->
                    <button v-if="isRegistered" class="checkin-btn" @tap="handleCheckin">
                        <text class="btn-icon">📷</text>
                        <text>签到</text>
                    </button>

                    <!-- 管理员: 管理活动按钮 -->
                    <button v-if="isLeader" class="manage-btn" @tap="goToManage">
                        <text class="btn-icon">⚙️</text>
                        <text>管理活动</text>
                    </button>
                </view>

                <!-- 活动已结束: 显示已结束提示 -->
                <view v-if="currentStatus === 5" class="status-tip">
                    <text>活动已结束</text>
                </view>

                <!-- 活动已完结: 显示已完结提示 -->
                <view v-if="currentStatus === 6" class="status-tip">
                    <text>活动已完结</text>
                </view>

                <!-- 管理员在其他状态(非报名中/非进行中)也可以管理 -->
                <button v-if="isLeader && currentStatus !== 4 && currentStatus !== 2" class="manage-btn-small"
                    @tap="goToManage">
                    <text class="btn-icon">⚙️</text>
                    <text>管理活动</text>
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getActivityDetail, enrollActivity, cancelEnroll, signInActivity } from '@/api/activity'
import { formatRichText } from '@/utils/richtext'

// 当前标签页
const currentTab = ref(1)

// 标签页列表
const tabs = ['详情', '信息', '人员', '地址']

// 活动当前状态 (从后端返回)
const currentStatus = ref(1)
// 1 = 预热中：活动发布后，报名时间未到
// 2 = 报名中：当前时间在报名时间范围内
// 3 = 等待中：报名结束但活动未开始
// 4 = 进行中：活动进行时间范围内
// 5 = 已结束：活动时间已过
// 6 = 已完结：管理员手动完结

// 是否是管理员(负责人)
const isLeader = ref(false)

// 是否已报名
const isRegistered = ref(false)

// 活动详情数据
const activity = ref({
    activityId: null,
    coverImage: '',
    activityName: '',
    activityStatus: '0',
    activityLocation: '',
    currentParticipants: 0,
    maxParticipants: 0,
    organizerNames: '',
    activityDetail: '',
    remark: '',
    registerStartTime: '',
    registerEndTime: '',
    activityStartTime: '',
    activityEndTime: '',
    activityLevel: '',
    participateScope: '',
    allowLeave: 'N',
    creditValue: 0,
    scoreValue: 0,
    activityTags: null,
    leaders: [],
    organizers: [],
    participants: [],
    latitude: 0,
    longitude: 0,
    enrollStatus: null
})

// 地图标记点
const markers = computed(() => [{
    id: 1,
    latitude: activity.value.latitude || 0,
    longitude: activity.value.longitude || 0,
    title: activity.value.activityName,
    iconPath: '/static/marker.png',
    width: 30,
    height: 30
}])

// 是否可以报名或取消报名
const canSignup = computed(() => {
    // 只有在报名中状态才能操作
    if (currentStatus.value !== 2) {
        return false
    }

    // 如果已报名，根据状态判断是否可以取消
    if (isRegistered.value) {
        // enrollStatus: 0=已报名(可取消), 1=已签到(不可取消), 2=已完成(不可取消), 3=已取消(不可操作)
        return activity.value.enrollStatus === '0'
    }

    // 未报名时，判断人数是否已满
    return activity.value.currentParticipants < activity.value.maxParticipants
})

// 获取状态文本（通过字符串状态）
const getStatusText = (status) => {
    const statusMap = {
        'upcoming': '预热中',
        'recruiting': '报名中',
        'waiting': '等待中',
        'ongoing': '进行中',
        'finished': '已结束',
        'completed': '已完结'
    }
    return statusMap[status] || ''
}

// 获取状态文本（通过状态码）
const getStatusTextByCode = (statusCode) => {
    const statusMap = {
        1: '预热中',
        2: '报名中',
        3: '等待中',
        4: '进行中',
        5: '已结束',
        6: '已完结'
    }
    return statusMap[statusCode] || ''
}

// 获取报名按钮文本
const getSignupText = () => {
    if (isRegistered.value) {
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

    if (activity.value.currentParticipants >= activity.value.maxParticipants) {
        return '报名已满'
    }

    return '立即报名'
}

// 签到功能 - 跳转扫码页面
const handleCheckin = () => {
    // 支持扫码签到(可从相册选择二维码)
    uni.scanCode({
        onlyFromCamera: false,  // 允许从相册选择二维码
        scanType: ['qrCode'],
        success: (res) => {
            console.log('扫码结果:', res)
            // 处理签到逻辑
            handleCheckinSubmit(res.result)
        },
        fail: (err) => {
            console.error('扫码失败:', err)
            uni.showToast({
                title: '扫码失败',
                icon: 'none'
            })
        }
    })
}

// 提交签到
const handleCheckinSubmit = async (qrData) => {
    try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo')
        if (!userInfo || !userInfo.studentId) {
            uni.showToast({
                title: '未找到学生信息',
                icon: 'none'
            })
            return
        }

        // 调用签到接口
        const res = await signInActivity({
            signInCode: qrData,
            studentId: Number(userInfo.studentId),
            activityId: Number(activity.value.activityId)
        })

        if (res.success) {
            uni.showToast({
                title: res.message || '签到成功',
                icon: 'success'
            })

            // 重新加载活动详情
            loadActivityDetail(activity.value.activityId)
        } else {
            uni.showToast({
                title: res.message || '签到失败',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('签到失败:', error)
        uni.showToast({
            title: error.message || '签到失败',
            icon: 'none'
        })
    }
}

// 跳转到管理活动页面
const goToManage = () => {
    uni.navigateTo({
        url: `/pages/activity-manage/activity-manage?id=${activity.value.activityId}&status=${currentStatus.value}`
    })
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
    if (isRegistered.value) {
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
            content: `确定要取消报名"${activity.value.activityName}"吗？`,
            success: async (res) => {
                if (res.confirm) {
                    try {
                        // 调用取消报名接口
                        await cancelEnroll({
                            activityId: Number(activity.value.activityId),
                            studentId: Number(userInfo.studentId)
                        })

                        loadActivityDetail(activity.value.activityId) // 重新加载活动详情

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
            content: `确定要报名参加"${activity.value.activityName}"吗？`,
            success: async (res) => {
                if (res.confirm) {
                    try {
                        // 调用报名接口
                        await enrollActivity({
                            activityId: Number(activity.value.activityId),
                            studentId: Number(userInfo.studentId)
                        })

                        loadActivityDetail(activity.value.activityId) // 重新加载活动详情

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

// 排序后的人员列表
const sortedPersonnel = computed(() => {
    const list = []

    // 1. 负责人
    if (activity.value.leaders) {
        activity.value.leaders.forEach(p => {
            list.push({
                ...p,
                roleType: 'leader',
                roleName: '负责人',
                sortTime: 0 // 最高优先级
            })
        })
    }

    // 2. 组织者
    if (activity.value.organizers) {
        activity.value.organizers.forEach(p => {
            list.push({
                ...p,
                roleType: 'organizer',
                roleName: '组织者',
                sortTime: 0
            })
        })
    }

    // 3. 参与人员 (按报名时间倒序)
    if (activity.value.participants) {
        const participants = [...activity.value.participants].sort((a, b) => {
            const timeA = new Date(a.signupTime || 0).getTime()
            const timeB = new Date(b.signupTime || 0).getTime()
            return timeB - timeA
        })

        participants.forEach(p => {
            list.push({
                ...p,
                roleType: 'participant',
                roleName: '参与者',
                sortTime: new Date(p.signupTime || 0).getTime()
            })
        })
    }

    return list
})

const getRoleClass = (type) => {
    const map = {
        'leader': 'tag-leader',
        'organizer': 'tag-organizer',
        'participant': 'tag-participant'
    }
    return map[type] || ''
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

        // 后端返回的数据在 res 中（request.js 已经解包了 data）
        const activityData = res.activity || res

        // 更新当前状态、权限和报名状态（使用后端返回的字段）
        currentStatus.value = Number(res.currentStatus) || 1
        isLeader.value = res.isLeader || false

        // 根据 enrollStatus 判断是否已报名
        // enrollStatus: "0"=已报名未签到, "1"=已签到, "2"=已完成, "3"=已取消, null=未报名
        const enrollStatus = res.enrollStatus
        isRegistered.value = res.isRegistered || (enrollStatus !== null && enrollStatus !== '3')

        // 直接使用后端返回的字段，不进行映射
        activity.value = {
            ...activityData,
            // 补充一些可能不在 activityData 中的字段
            leaders: res.leaders || [],
            organizers: res.organizers || [],
            participants: res.participants || [],
            enrollStatus: enrollStatus,
            // 确保一些关键字段有默认值
            coverImage: activityData.coverImage || 'https://picsum.photos/800/400?random=30',
            activityName: activityData.activityName || '',
            activityLocation: activityData.activityLocation || '',
            currentParticipants: activityData.currentParticipants || 0,
            maxParticipants: activityData.maxParticipants || 0,
            organizerNames: activityData.organizerNames || activityData.organizationName || '',
            activityDetail: activityData.activityDetail || '',
            remark: activityData.remark || '',
            registerStartTime: activityData.registerStartTime || '',
            registerEndTime: activityData.registerEndTime || '',
            activityStartTime: activityData.activityStartTime || '',
            activityEndTime: activityData.activityEndTime || '',
            activityLevel: activityData.activityLevel || '',
            participateScope: activityData.participateScope || '',
            allowLeave: activityData.allowLeave || 'N',
            creditValue: activityData.creditValue || 0,
            scoreValue: activityData.scoreValue || 0,
            activityTags: activityData.activityTags,
            latitude: activityData.latitude || 0,
            longitude: activityData.longitude || 0
        }

        console.log('活动详情加载成功:', activity.value)
        console.log('当前状态:', currentStatus.value, '是否负责人:', isLeader.value, '是否已报名:', isRegistered.value)
    } catch (error) {
        console.error('加载活动详情失败:', error)
        uni.showToast({
            title: error.message || '加载失败',
            icon: 'none'
        })
    }
}

// 映射currentStatus到显示状态
const mapCurrentStatusToDisplay = (status) => {
    const statusMap = {
        1: 'upcoming',      // 预热中
        2: 'recruiting',    // 报名中
        3: 'waiting',       // 等待中
        4: 'ongoing',       // 进行中
        5: 'finished',      // 已结束
        6: 'completed'      // 已完结
    }
    return statusMap[status] || 'recruiting'
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
    console.log('接收到的活动ID参数:', id, '类型:', typeof id)

    // 验证 ID 是否有效（不为空且不是 'undefined' 字符串）
    if (id && id !== 'undefined' && id !== 'null') {
        console.log('活动详情ID:', id)
        // 加载活动详情数据
        loadActivityDetail(id)
    } else {
        console.error('活动ID无效:', id)
        uni.showToast({
            title: '活动ID不存在',
            icon: 'none',
            duration: 2000
        })

        // 2秒后返回上一页
        setTimeout(() => {
            uni.navigateBack()
        }, 2000)
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
            background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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

/* 信息列表 */
.info-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 30rpx;
    border-radius: 12rpx;
    overflow: hidden;
    border: 1rpx solid #f0f0f0;
}

.grid-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    background: #fff;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
}

.item-label {
    font-size: 28rpx;
    color: #666;
    flex-shrink: 0;
    width: 160rpx;
}

.item-value {
    font-size: 0.8rem;
    color: #333;
    font-weight: 500;
    text-align: right;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.time-column {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex: 1;
}

.time-text {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
}

.time-separator {
    font-size: 24rpx;
    color: #999;
    margin: 4rpx 0;
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

.person-list-vertical {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.person-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
}

.person-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.person-avatar-small {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    border: 2rpx solid #fff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.person-name-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.person-right {
    display: flex;
    align-items: center;
}

.role-tag {
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 500;
}

.tag-leader {
    background: rgba(255, 193, 7, 0.15);
    color: #ff9800;
    border: 1rpx solid rgba(255, 193, 7, 0.3);
}

.tag-organizer {
    background: rgba(33, 150, 243, 0.15);
    color: #2196f3;
    border: 1rpx solid rgba(33, 150, 243, 0.3);
}

.tag-participant {
    background: rgba(76, 175, 80, 0.15);
    color: #4caf50;
    border: 1rpx solid rgba(76, 175, 80, 0.3);
}

.empty-person {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
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

.status-tip {
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #999;
}

.action-buttons {
    display: flex;
    gap: 20rpx;
}

.signup-btn,
.checkin-btn,
.manage-btn {
    flex: 1;
    height: 90rpx;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.signup-btn {
    width: 100%;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;

    &.disabled {
        opacity: 0.5;
    }
}

.checkin-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
}

.manage-btn {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
}

.manage-btn-small {
    width: 100%;
    height: 70rpx;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 35rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin-top: 10rpx;
}

.btn-icon {
    font-size: 36rpx;
}
</style>

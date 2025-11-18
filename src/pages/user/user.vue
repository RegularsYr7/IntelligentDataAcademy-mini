<template>
    <view class="page">
        <view class="container">
            <!-- 未登录状态 - 骨架屏组件 -->
            <UserSkeleton v-if="!isLoggedIn" />

            <!-- 已登录状态 - 内容组件 -->
            <UserContent v-else :userInfo="userInfo" :myActivities="myActivities" :myOrganizations="myOrganizations"
                :growthRecords="growthRecords" :monthlyGain="monthlyGain" :basicInfo="basicInfo"
                @logout="handleLogout" />
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import UserSkeleton from '@/components/UserSkeleton/UserSkeleton.vue'
import UserContent from '@/components/UserContent/UserContent.vue'

// 登录状态
const isLoggedIn = ref(false)

// 用户信息
const userInfo = ref({
    name: '',
    avatar: '',
    positions: [],
    quantificationScore: 0
})

// 我的活动
const myActivities = ref([])

// 我的组织
const myOrganizations = ref([])

// 成长记录（最近6个月）
const growthRecords = ref([])

// 本月获得分数
const monthlyGain = ref(0)

// 基本信息
const basicInfo = ref({
    studentId: '',
    class: '',
    major: '',
    college: '',
    phone: ''
})

onLoad(() => {
    console.log('我的页面加载')
    checkLoginStatus()

    if (isLoggedIn.value) {
        loadUserData()
    }
})


onShow(() => {
    checkLoginStatus()
    if (isLoggedIn.value) {
        loadUserData()
    }
})

// 检查登录状态
const checkLoginStatus = () => {
    const token = uni.getStorageSync('userToken')
    isLoggedIn.value = !!token
}

// 加载用户数据
const loadUserData = () => {
    const cachedUserInfo = uni.getStorageSync('userInfo')
    if (cachedUserInfo) {
        console.log('加载用户信息:', cachedUserInfo)

        // 设置用户基本信息
        userInfo.value = {
            name: cachedUserInfo.name || cachedUserInfo.studentName || '未设置',
            avatar: cachedUserInfo.avatar || cachedUserInfo.avatarUrl || 'https://picsum.photos/200/200?random=user',
            positions: extractPositions(cachedUserInfo.organizations || []),
            quantificationScore: cachedUserInfo.quantificationScore || cachedUserInfo.quantitativeScore || 0
        }

        // 设置我的活动
        myActivities.value = (cachedUserInfo.recentActivities || []).slice(0, 3).map(activity => ({
            id: activity.activityId,
            name: activity.activityName || activity.name,
            time: activity.activityTime || activity.time,
            status: activity.status || 'completed',
            statusText: getStatusText(activity.status)
        }))

        // 设置我的组织
        myOrganizations.value = (cachedUserInfo.organizations || []).map(org => ({
            id: org.organizationId,
            name: org.organizationName || org.name,
            role: org.role || '成员',
            logo: org.logo || 'https://picsum.photos/100/100?random=org'
        }))

        // 设置成长记录
        if (cachedUserInfo.growthTrend && cachedUserInfo.growthTrend.length > 0) {
            growthRecords.value = cachedUserInfo.growthTrend
        } else {
            // 如果没有成长趋势数据，生成默认数据
            growthRecords.value = generateDefaultGrowthRecords()
        }

        // 本月获得分数
        monthlyGain.value = cachedUserInfo.currentMonthScore || 0

        // 基本信息
        basicInfo.value = {
            studentId: cachedUserInfo.studentNo || cachedUserInfo.studentId || '',
            class: cachedUserInfo.className || '未设置',
            major: cachedUserInfo.majorName || '未设置',
            college: cachedUserInfo.collegeName || cachedUserInfo.schoolName || '未设置',
            phone: formatPhone(cachedUserInfo.phone || '')
        }
    }
}

// 从组织中提取职位
const extractPositions = (organizations) => {
    if (!organizations || organizations.length === 0) return []
    return organizations.map(org => org.role).filter(role => role)
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'ongoing': '进行中',
        'upcoming': '即将开始',
        'completed': '已完成',
        'finished': '已完成'
    }
    return statusMap[status] || '已完成'
}

// 格式化手机号
const formatPhone = (phone) => {
    if (!phone) return '未绑定'
    if (phone.includes('*')) return phone
    if (phone.length === 11) {
        return phone.substring(0, 3) + '****' + phone.substring(7)
    }
    return phone
}

// 生成默认成长记录（当后端没有返回数据时）
const generateDefaultGrowthRecords = () => {
    const months = ['6月', '7月', '8月', '9月', '10月', '11月']
    return months.map(month => ({
        month,
        score: 0
    }))
}

// 退出登录
const handleLogout = () => {
    // 清除登录信息
    uni.removeStorageSync('userToken')
    uni.removeStorageSync('userInfo')
    isLoggedIn.value = false

    uni.showToast({
        title: '已退出登录',
        icon: 'success'
    })

    // 滚动到页面顶部
    uni.pageScrollTo({
        scrollTop: 0,
        duration: 300
    })
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}
</style>

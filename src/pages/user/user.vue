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
import { getMyActivities, getMyOrganizations, getMyGrowthRecords } from '@/api/student'

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
    console.log('检查登录状态 - token:', token)
    isLoggedIn.value = !!token
    console.log('登录状态:', isLoggedIn.value)
}

// 加载用户数据
const loadUserData = async () => {
    const cachedUserInfo = uni.getStorageSync('userInfo')
    console.log('缓存的用户信息:', cachedUserInfo)

    if (cachedUserInfo) {
        console.log('开始加载用户信息:', cachedUserInfo)

        // 设置用户基本信息
        userInfo.value = {
            name: cachedUserInfo.name || cachedUserInfo.studentName || '未设置',
            avatar: cachedUserInfo.avatar || cachedUserInfo.avatarUrl || 'https://picsum.photos/200/200?random=user',
            positions: [],  // 从组织接口获取
            quantificationScore: cachedUserInfo.quantificationScore || cachedUserInfo.quantitativeScore || 0
        }
        console.log('用户基本信息:', userInfo.value)

        // 基本信息
        basicInfo.value = {
            studentId: cachedUserInfo.studentNo || cachedUserInfo.studentId || '',
            class: cachedUserInfo.className || '未设置',
            major: cachedUserInfo.majorName || '未设置',
            college: cachedUserInfo.collegeName || cachedUserInfo.schoolName || '未设置',
            phone: formatPhone(cachedUserInfo.phone || cachedUserInfo.phoneCode || '')
        }
        console.log('基本信息:', basicInfo.value)

        // 调用接口获取动态数据
        const studentId = cachedUserInfo.studentId || cachedUserInfo.studentNo
        if (studentId) {
            await Promise.all([
                loadMyActivities(studentId),
                loadMyOrganizations(studentId),
                loadGrowthRecords(studentId)
            ])
        }
    }
}

// 加载我的活动
const loadMyActivities = async (studentId) => {
    try {
        const res = await getMyActivities({
            studentId: Number(studentId)
        })
        console.log('我的活动响应:', res)

        // 后端返回格式: { totalCredits, participantCount, totalPoints, activityList }
        if (res && res.activityList && Array.isArray(res.activityList)) {
            myActivities.value = res.activityList.map(activity => ({
                id: activity.activityId,
                name: activity.activityName || activity.name,
                time: formatActivityTime(activity.activityStartTime || activity.time),
                status: mapActivityStatus(activity.activityStatus || activity.status),
                statusText: getActivityStatusText(activity.activityStatus || activity.status)
            }))
        }
    } catch (error) {
        console.error('加载我的活动失败:', error)
        myActivities.value = []
    }
}

// 加载我的组织
const loadMyOrganizations = async (studentId) => {
    try {
        const res = await getMyOrganizations({
            studentId: Number(studentId)
        })
        console.log('我的组织响应:', res)

        if (res && res.rows) {
            myOrganizations.value = res.rows.map(org => ({
                id: org.organizationId,
                name: org.organizationName || org.name,
                role: org.role || org.memberRole || '成员',
                logo: org.organizationLogo || org.logo || 'https://picsum.photos/100/100?random=org'
            }))

            // 提取职位信息
            userInfo.value.positions = myOrganizations.value.map(org => org.role).filter(role => role)
        }
    } catch (error) {
        console.error('加载我的组织失败:', error)
        myOrganizations.value = []
    }
}

// 加载成长记录
const loadGrowthRecords = async (studentId) => {
    try {
        const res = await getMyGrowthRecords({
            studentId: Number(studentId)
        })
        console.log('成长记录响应:', res)

        if (res && res.rows && res.rows.length > 0) {
            growthRecords.value = res.rows.map(record => ({
                month: record.month || record.monthName,
                score: record.score || record.totalScore || 0
            }))

            // 计算本月获得分数（最后一条记录）
            if (res.rows.length > 0) {
                const lastRecord = res.rows[res.rows.length - 1]
                monthlyGain.value = lastRecord.score || lastRecord.totalScore || 0
            }
        } else {
            // 如果没有成长趋势数据，生成默认数据
            growthRecords.value = generateDefaultGrowthRecords()
            monthlyGain.value = 0
        }
    } catch (error) {
        console.error('加载成长记录失败:', error)
        growthRecords.value = generateDefaultGrowthRecords()
        monthlyGain.value = 0
    }
}

// 格式化活动时间
const formatActivityTime = (dateTimeStr) => {
    if (!dateTimeStr) return '时间待定'

    try {
        const date = new Date(dateTimeStr)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')

        return `${month}-${day} ${hours}:${minutes}`
    } catch (error) {
        console.error('时间格式化失败:', error)
        return dateTimeStr
    }
}

// 映射活动状态 - 后端状态码转前端状态
const mapActivityStatus = (status) => {
    const statusMap = {
        '0': 'upcoming',    // 未开始
        '1': 'ongoing',     // 进行中
        '2': 'completed'    // 已结束
    }
    return statusMap[status] || 'completed'
}

// 获取活动状态文本
const getActivityStatusText = (status) => {
    const statusMap = {
        '0': '未开始',
        '1': '进行中',
        '2': '已结束'
    }
    return statusMap[status] || '已结束'
}

// 获取状态文本（保留用于其他地方）
const getStatusText = (status) => {
    const statusMap = {
        'ongoing': '进行中',
        'upcoming': '未开始',
        'completed': '已结束',
        'finished': '已结束'
    }
    return statusMap[status] || '已结束'
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

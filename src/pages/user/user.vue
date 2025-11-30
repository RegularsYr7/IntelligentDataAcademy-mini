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
    console.log('我的页面显示')
    checkLoginStatus()

    // 检查是否需要刷新数据
    const shouldRefresh = uni.getStorageSync('refreshUserPage')
    if (shouldRefresh) {
        console.log('检测到刷新标志，延迟刷新用户数据')
        uni.removeStorageSync('refreshUserPage')

        // 延迟一点时间，确保缓存已经更新
        setTimeout(() => {
            if (isLoggedIn.value) {
                loadUserData()
            }
        }, 100)
    } else if (isLoggedIn.value) {
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

        // 设置用户基本信息
        userInfo.value = {
            name: cachedUserInfo.name || '未设置',
            avatar: cachedUserInfo.avatar || 'https://picsum.photos/200/200?random=user',
            positions: [],  // 从组织接口获取
            quantificationScore: cachedUserInfo.quantificationScore || 0
        }

        // 基本信息
        basicInfo.value = {
            studentId: cachedUserInfo.studentNo || '',
            class: cachedUserInfo.className || '未设置',
            major: cachedUserInfo.majorName || '未设置',
            college: cachedUserInfo.collegeName || '未设置',
            phone: formatPhone(cachedUserInfo.phone || '')
        }
        console.log('基本信息:', basicInfo.value)

        // 调用接口获取动态数据
        await Promise.all([
            loadMyActivities(),
            loadMyOrganizations(),
            loadGrowthRecords()
        ])
    }
}

// 加载我的活动
const loadMyActivities = async () => {
    try {
        const res = await getMyActivities()
        console.log('我的活动响应:', res)

        // 后端返回格式: { totalCredits, participantCount, totalPoints, activityList }
        if (res && res.activityList && Array.isArray(res.activityList)) {
            // 只展示前3个活动
            myActivities.value = res.activityList.slice(0, 3).map(activity => ({
                id: activity.activityId,
                name: activity.activityName || activity.name,
                time: formatActivityTime(activity.activityStartTime || activity.time),
                status: mapActivityStatus(activity.currentStatus || activity.status),
                statusText: getActivityStatusText(activity.currentStatus || activity.status)
            }))
        }
    } catch (error) {
        console.error('加载我的活动失败:', error)
        myActivities.value = []
    }
}

// 加载我的组织
const loadMyOrganizations = async () => {
    try {
        const res = await getMyOrganizations()
        console.log('我的组织响应:', res)

        // Handle new response structure
        if (res) {
            const list = res.organizationList || res.rows || []

            const allOrgs = list.map(org => ({
                id: org.organizationId,
                name: org.organizationName || org.name,
                role: org.myMemberTag || getRoleName(org.myMemberRole) || org.role || org.memberRole || '成员',
                logo: org.organizationLogo || org.logo || 'https://picsum.photos/100/100?random=' + org.organizationId
            }))

            // 提取职位信息 (从所有组织中提取)
            userInfo.value.positions = allOrgs.map(org => org.role).filter(role => role && role !== '成员')

            // 只展示前3个组织
            myOrganizations.value = allOrgs.slice(0, 3)
        }
    } catch (error) {
        console.error('加载我的组织失败:', error)
        myOrganizations.value = []
    }
}

// 将角色代码转换为中文名称
const getRoleName = (role) => {
    const map = { '2': '主席', '1': '管理员', '0': '成员' }
    return map[role] || '成员'
}

// 加载成长记录
const loadGrowthRecords = async () => {
    try {
        const res = await getMyGrowthRecords()
        console.log('成长记录响应:', res)

        if (res) {
            // 更新量化积分
            if (res.currentQuantitativeScore !== undefined) {
                userInfo.value.quantificationScore = res.currentQuantitativeScore
            }

            // 更新本月获得分数
            monthlyGain.value = res.currentMonthScore || 0

            // 更新成长趋势（最近6个月）
            let trendData = []
            if (res.growthTrend && res.growthTrend.length > 0) {
                // 1. 解析后端数据
                trendData = res.growthTrend.map(item => {
                    let year, month
                    if (item.month && item.month.includes('-')) {
                        const parts = item.month.split('-')
                        year = parseInt(parts[0])
                        month = parseInt(parts[1])
                    } else {
                        // 尝试直接解析，或者默认为当前年（不太安全，但作为兜底）
                        const now = new Date()
                        year = now.getFullYear()
                        month = parseInt(item.month) || (now.getMonth() + 1)
                    }
                    return {
                        year,
                        month,
                        score: item.score || 0
                    }
                })

                // 按时间排序
                trendData.sort((a, b) => {
                    if (a.year !== b.year) return a.year - b.year
                    return a.month - b.month
                })
            }

            // 2. 补齐数据到6条
            const neededCount = 6
            if (trendData.length < neededCount) {
                // 如果没有数据，从当前月开始往前推
                if (trendData.length === 0) {
                    const now = new Date()
                    let y = now.getFullYear()
                    let m = now.getMonth() + 1

                    for (let i = 0; i < neededCount; i++) {
                        trendData.unshift({
                            year: y,
                            month: m,
                            score: 0
                        })
                        // 往前推一个月
                        if (m === 1) {
                            m = 12
                            y--
                        } else {
                            m--
                        }
                    }
                } else {
                    // 有数据，从最早的数据往前补
                    let y = trendData[0].year
                    let m = trendData[0].month
                    const missingCount = neededCount - trendData.length

                    for (let i = 0; i < missingCount; i++) {
                        // 往前推一个月
                        if (m === 1) {
                            m = 12
                            y--
                        } else {
                            m--
                        }

                        trendData.unshift({
                            year: y,
                            month: m,
                            score: 0
                        })
                    }
                }
            } else if (trendData.length > neededCount) {
                // 如果超过6条，取最近的6条
                trendData = trendData.slice(trendData.length - neededCount)
            }

            // 3. 格式化输出
            growthRecords.value = trendData.map(item => ({
                month: item.month + '月',
                score: item.score
            }))

        } else {
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
        '1': 'upcoming',
        '2': 'recruiting',
        '3': 'waiting',
        '4': 'ongoing',
        '5': 'finished',
        '6': 'completed'
    }
    return statusMap[status] || 'finished'
}

// 获取活动状态文本
const getActivityStatusText = (status) => {
    const statusMap = {
        '1': '预热中',
        '2': '报名中',
        '3': '等待中',
        '4': '进行中',
        '5': '已结束',
        '6': '已完结'
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
    const records = []
    const now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1

    for (let i = 0; i < 6; i++) {
        records.unshift({
            month: month + '月',
            score: 0
        })

        // 往前推一个月
        if (month === 1) {
            month = 12
            year--
        } else {
            month--
        }
    }
    return records
}

// 退出登录
const handleLogout = () => {
    // 清除登录信息
    uni.removeStorageSync('userToken')
    uni.removeStorageSync('userInfo')
    isLoggedIn.value = false

    uni.showToast({
        title: '已退出登录',
        icon: 'success',
        duration: 1500
    })

    // 销毁所有页面，重新加载当前页面
    setTimeout(() => {
        uni.reLaunch({
            url: '/pages/user/user'
        })
    }, 1500)
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}
</style>

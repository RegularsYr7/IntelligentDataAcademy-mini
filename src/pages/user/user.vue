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
    name: '张三',
    avatar: 'https://picsum.photos/200/200?random=user',
    positions: ['团支书', '学生会主席'],
    quantificationScore: 95.5
})

// 我的活动
const myActivities = ref([
    {
        id: 1,
        name: '校园运动会志愿者',
        time: '2025-11-05 09:00',
        status: 'ongoing',
        statusText: '进行中'
    },
    {
        id: 2,
        name: '学术讲座组织',
        time: '2025-11-08 14:30',
        status: 'upcoming',
        statusText: '即将开始'
    },
    {
        id: 3,
        name: '社团招新活动',
        time: '2025-10-20 15:00',
        status: 'completed',
        statusText: '已完成'
    }
])

// 我的组织
const myOrganizations = ref([
    {
        id: 4,
        name: '计算机科学学院学生会',
        role: '主席',
        logo: 'https://picsum.photos/100/100?random=org1'
    },
    {
        id: 10,
        name: '数据科学社团',
        role: '社长',
        logo: 'https://picsum.photos/100/100?random=org2'
    }
])

// 成长记录（最近6个月）
const growthRecords = ref([
    { month: '5月', score: 78 },
    { month: '6月', score: 82 },
    { month: '7月', score: 85 },
    { month: '8月', score: 88 },
    { month: '9月', score: 92 },
    { month: '10月', score: 95 }
])

// 本月获得分数
const monthlyGain = ref(12)

// 基本信息
const basicInfo = ref({
    studentId: '2021001001',
    class: '数据科学21-1班',
    major: '数据科学与大数据技术',
    college: '计算机科学学院',
    phone: '138****8888'
})

onLoad(() => {
    console.log('我的页面加载')
    checkLoginStatus()

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【用户中心页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取用户信息
    console.log('📍 接口1: 获取用户信息')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/user/profile')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数: 无')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            name: '张三',
            avatar: 'https://example.com/avatar.png',
            positions: ['团支书', '学生会主席'], // 用户职位列表
            quantificationScore: 95.5, // 量化分数
            studentId: '202001010101',
            className: '计科2020级1班',
            major: '数据科学与大数据技术',
            college: '计算机科学学院',
            phone: '138****8888' // 脱敏手机号
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 获取我的活动
    console.log('📍 接口2: 获取我的活动')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/user/activities')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        limit: 3 // 返回最近3条
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            activities: [
                {
                    id: 1,
                    name: '校园运动会志愿者',
                    time: '2025-11-05 09:00',
                    status: 'ongoing', // ongoing-进行中, upcoming-即将开始, finished-已完成
                    statusText: '进行中'
                }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口3: 获取我的组织
    console.log('📍 接口3: 获取我的组织')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/user/organizations')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数: 无')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            organizations: [
                {
                    id: 1,
                    name: '学生会',
                    logo: 'https://example.com/logo.png',
                    role: '主席' // 在组织中的角色
                }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口4: 获取成长记录
    console.log('📍 接口4: 获取成长记录(6个月数据)')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/user/growth-records')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        months: 6 // 最近6个月
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            records: [
                {
                    month: '5月',
                    score: 78
                },
                {
                    month: '6月',
                    score: 82
                }
                // ... 共6个月数据
            ],
            monthlyGain: 12 // 本月新增分数
        }
    }, null, 2))
    console.log('\n')

    // 接口5: 退出登录
    console.log('📍 接口5: 退出登录')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/auth/logout')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数: 无')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '退出成功'
    }, null, 2))
    console.log('\n')

    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 所有接口需要登录认证(token)')
    console.log('2. 未登录状态: 显示骨架屏+登录引导按钮')
    console.log('3. 量化分数: 根据活动参与、组织职务等综合计算')
    console.log('4. 成长记录: 用于图表展示,需返回固定6个月数据')
    console.log('5. 手机号脱敏: 中间4位用*代替')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

onShow(() => {
    checkLoginStatus()
})

// 检查登录状态
const checkLoginStatus = () => {
    const token = uni.getStorageSync('userToken')
    isLoggedIn.value = !!token

    if (isLoggedIn.value) {
        // 从缓存加载用户信息
        const cachedUserInfo = uni.getStorageSync('userInfo')
        if (cachedUserInfo) {
            userInfo.value = cachedUserInfo
        }
    }
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

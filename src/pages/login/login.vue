<template>
    <view class="page">
        <view class="container">
            <!-- 返回按钮 -->
            <view class="back-button" @tap="goBack">
                <text class="back-icon">←</text>
                <text class="back-text">返回首页</text>
            </view>

            <!-- Logo 区域 -->
            <view class="logo-section">
                <view class="logo-container">
                    <image class="logo" :src="Logo" mode="aspectFit"></image>
                </view>
                <text class="app-name">智慧数据学院</text>
            </view>

            <!-- 登录区域 -->
            <view class="login-section">
                <view class="welcome-text">
                    <text class="welcome-title">{{ loginMode === 'wechat' ? '使用手机号快速登录' : '使用账号密码登录' }}</text>
                </view>

                <!-- 账号密码登录组件 -->
                <AccountPasswordLogin v-if="loginMode === 'account'" :loading="loading" @login="accountLogin" />

                <!-- 微信手机号登录组件 -->
                <WechatPhoneLogin v-if="loginMode === 'wechat'" @getPhoneNumber="getPhoneNumber"
                    @mockLogin="mockLogin" />

                <!-- 切换登录方式 -->
                <view class="switch-mode" @tap="switchLoginMode">
                    <text class="switch-text">{{ loginMode === 'wechat' ? '使用账号密码登录' : '使用手机号登录' }}</text>
                </view>

                <!-- 隐私协议 - 必须勾选才能登录 -->
                <view class="agreement">
                    <checkbox-group @change="onAgreementChange">
                        <label class="agreement-checkbox">
                            <checkbox :checked="agreedToPolicy" color="#667eea" />
                            <view class="agreement-content">
                                <text class="agreement-text">我已阅读并同意</text>
                                <text class="agreement-link" @tap.stop="viewUserAgreement">《用户协议》</text>
                                <text class="agreement-text">和</text>
                                <text class="agreement-link" @tap.stop="viewPrivacyPolicy">《隐私政策》</text>
                            </view>
                        </label>
                    </checkbox-group>
                </view>
            </view>

            <!-- 装饰元素 -->
            <view class="decoration">
                <view class="circle circle-1"></view>
                <view class="circle circle-2"></view>
                <view class="circle circle-3"></view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AccountPasswordLogin from '@/components/AccountPasswordLogin/AccountPasswordLogin.vue'
import WechatPhoneLogin from '@/components/WechatPhoneLogin/WechatPhoneLogin.vue'
import Logo from '@/static/artLogo.png'
import { login, loginByWechat, bindPhone } from '@/api/student'

const loading = ref(false)
const loginMode = ref('wechat') // 'wechat' | 'account'
const agreedToPolicy = ref(false) // 是否同意隐私政策，默认不选中

onLoad(() => {
})

// 切换登录方式
const switchLoginMode = () => {
    loginMode.value = loginMode.value === 'wechat' ? 'account' : 'wechat'
}

// 隐私政策勾选状态改变
const onAgreementChange = (e) => {
    agreedToPolicy.value = e.detail.value.length > 0
}

// 验证是否同意隐私政策
const checkAgreement = () => {
    if (!agreedToPolicy.value) {
        uni.showModal({
            title: '温馨提示',
            content: '请先阅读并同意《用户协议》和《隐私政策》后再登录',
            showCancel: false,
            confirmText: '我知道了'
        })
        return false
    }
    return true
}

// 账号密码登录
const accountLogin = async (formData) => {
    // 验证是否同意隐私政策
    if (!checkAgreement()) {
        return
    }

    loading.value = true

    try {
        // 调用登录接口
        const data = await login({
            studentNo: formData.username,
            password: formData.password
        })

        console.log('登录响应数据:', data)

        // 保存token（如果后端返回了token，否则使用临时token）
        const token = data.token || 'temp_token_' + Date.now()
        uni.setStorageSync('userToken', token)

        // 构建用户信息对象
        const userInfo = {
            // ========== 基本信息 ==========
            studentId: data.studentId,
            name: data.studentName,
            avatar: data.avatarUrl || 'https://picsum.photos/200/200?random=user',
            studentNo: data.studentNo,
            quantificationScore: data.quantitativeScore || 0,
            idCard: data.idCard,
            phone: data.phone || '',

            // ========== 学籍信息 ==========
            schoolId: data.schoolId,
            schoolName: data.schoolName,
            collegeId: data.collegeId,
            collegeName: data.collegeName,
            trainingLevel: data.trainingLevel,
            majorId: data.majorId,
            majorName: data.majorName,
            grade: data.grade,
            educationSystem: data.educationSystem,
            classId: data.classId, // 班级ID - 课表接口需要
            className: data.className,
            enrollmentDate: data.enrollmentDate,
            graduationDate: data.graduationDate,

            // ========== 个人信息 ==========
            nationality: data.nationality,
            politicalStatus: data.politicalStatus,
            birthdate: data.birthdate,
            hometown: data.hometown,
            bloodType: data.bloodType,

            // ========== 活动信息 ==========
            recentActivities: data.recentActivities || [],

            // ========== 组织信息 ==========
            organizations: data.organizations || [],
            positions: [], // 职位暂时为空，后续从组织数据中获取

            // ========== 成长记录 ==========
            currentMonthScore: data.currentMonthScore || 0,
            growthTrend: data.growthTrend || []
        }

        uni.setStorageSync('userInfo', userInfo)

        loading.value = false

        uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
        })

        // 直接跳转到首页
        setTimeout(() => {
            navigateToHome()
        }, 1500)
    } catch (error) {
        loading.value = false
        // 错误信息已在request.js中自动处理
        console.error('登录失败:', error)
    }
}

// 显示绑定手机号弹窗
const showBindPhoneModal = () => {
    uni.showModal({
        title: '绑定微信手机号',
        content: '绑定后可使用微信手机号一键登录,更加便捷',
        confirmText: '立即绑定',
        cancelText: '暂不绑定',
        success: (res) => {
            if (res.confirm) {
                // 用户同意绑定,触发微信授权
                bindWechatPhone()
            } else {
                // 用户选择暂不绑定,直接跳转首页
                navigateToHome()
            }
        }
    })
}

// 绑定微信手机号
const bindWechatPhone = () => {
    // 这里需要调用微信授权组件
    // 由于是在模态框回调中,需要特殊处理
    uni.showModal({
        title: '提示',
        content: '请点击下方"绑定微信手机号"按钮完成绑定',
        showCancel: false,
        success: () => {
            // 切换到微信登录模式以显示授权按钮
            loginMode.value = 'wechat'
        }
    })
}

// 处理微信手机号授权(用于绑定)
const handlePhoneNumberForBind = async (e) => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
        const { encryptedData, iv, code: phoneCode } = e.detail
        const token = uni.getStorageSync('userToken')

        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        try {
            // 调用 wx.login() 获取 code
            uni.login({
                success: async (loginRes) => {
                    const code = loginRes.code

                    try {
                        console.log('调用绑定手机号接口，参数:', { code, encryptedData, iv, phoneCode })

                        // 调用绑定接口
                        const data = await bindPhone({
                            code: code || phoneCode,
                            encryptedData,
                            iv
                        })

                        // 更新本地用户信息
                        const userInfo = uni.getStorageSync('userInfo')
                        if (data.phone) {
                            userInfo.phone = data.phone
                            userInfo.hasBindPhone = true
                            uni.setStorageSync('userInfo', userInfo)
                        }

                        uni.showToast({
                            title: '绑定成功',
                            icon: 'success'
                        })

                        setTimeout(() => {
                            navigateToHome()
                        }, 1500)
                    } catch (error) {
                        console.error('绑定失败:', error)
                        // 错误信息已在request.js中自动处理
                    }
                },
                fail: (err) => {
                    console.error('wx.login失败:', err)
                    uni.showToast({
                        title: '获取登录凭证失败',
                        icon: 'none'
                    })
                }
            })
        } catch (error) {
            console.error('绑定过程出错:', error)
            uni.showToast({
                title: '绑定失败',
                icon: 'none'
            })
        }
    } else {
        uni.showToast({
            title: '您已取消授权',
            icon: 'none'
        })
        // 用户取消授权,直接跳转首页
        navigateToHome()
    }
}

// 获取微信手机号(一键登录使用)
const getPhoneNumber = async (e) => {
    console.log('获取手机号:', e)

    // 验证是否同意隐私政策
    if (!checkAgreement()) {
        return
    }

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
        // 直接从 detail 中获取 code
        const { code } = e.detail

        if (!code) {
            uni.showToast({
                title: '获取手机号授权码失败',
                icon: 'none'
            })
            return
        }

        loading.value = true

        try {
            console.log('调用微信登录接口，code:', code)

            const data = await loginByWechat(code)

            console.log('微信登录响应数据:', data)

            // 保存token
            const token = data.token || 'temp_token_' + Date.now()
            uni.setStorageSync('userToken', token)

            // 构建用户信息对象（与账号密码登录保持一致）
            const userInfo = {
                // ========== 基本信息 ==========
                studentId: data.studentId,
                name: data.studentName,
                avatar: data.avatarUrl || 'https://picsum.photos/200/200?random=user',
                studentNo: data.studentNo,
                quantificationScore: data.quantitativeScore || 0,
                idCard: data.idCard,
                phone: data.phone || '',

                // ========== 学籍信息 ==========
                schoolId: data.schoolId,
                schoolName: data.schoolName,
                collegeId: data.collegeId,
                collegeName: data.collegeName,
                trainingLevel: data.trainingLevel,
                majorId: data.majorId,
                majorName: data.majorName,
                grade: data.grade,
                educationSystem: data.educationSystem,
                classId: data.classId, // 班级ID - 课表接口需要
                className: data.className,
                enrollmentDate: data.enrollmentDate,
                graduationDate: data.graduationDate,

                // ========== 个人信息 ==========
                nationality: data.nationality,
                politicalStatus: data.politicalStatus,
                birthdate: data.birthdate,
                hometown: data.hometown,
                bloodType: data.bloodType,

                // ========== 活动信息 ==========
                recentActivities: data.recentActivities || [],

                // ========== 组织信息 ==========
                organizations: data.organizations || [],
                positions: [], // 职位暂时为空，后续从组织数据中获取

                // ========== 成长记录 ==========
                currentMonthScore: data.currentMonthScore || 0,
                growthTrend: data.growthTrend || []
            }

            uni.setStorageSync('userInfo', userInfo)

            loading.value = false

            uni.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
            })

            // 返回上一页或跳转到首页
            setTimeout(() => {
                navigateToHome()
            }, 1500)
        } catch (error) {
            loading.value = false
            // 错误信息已在request.js中自动处理
            console.error('微信登录失败:', error)
        }
    } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
        uni.showToast({
            title: '您已取消授权',
            icon: 'none'
        })
    } else {
        // 开发环境或权限不足时的提示
        uni.showModal({
            title: '提示',
            content: '开发环境无法获取真实手机号,请使用"开发环境-模拟登录"按钮进行测试',
            showCancel: false
        })
    }
}

// 跳转到首页
const navigateToHome = () => {
    uni.navigateBack({
        fail: () => {
            uni.switchTab({
                url: '/pages/index/index'
            })
        }
    })
}

// 模拟登录(开发环境使用)
const mockLogin = () => {
    // 验证是否同意隐私政策
    if (!checkAgreement()) {
        return
    }

    uni.showModal({
        title: '模拟登录',
        content: '将使用测试账号登录,是否继续?',
        success: (res) => {
            if (res.confirm) {
                performLogin()
            }
        }
    })
}

// 执行登录操作
const performLogin = () => {
    loading.value = true

    setTimeout(() => {
        // 模拟登录成功
        const mockUserInfo = {
            name: '张三',
            avatar: 'https://picsum.photos/200/200?random=user',
            phone: '138****8888',
            positions: ['团支书', '学生会主席'],
            quantificationScore: 95.5
        }

        const mockToken = 'mock_token_' + Date.now()

        // 保存登录信息
        uni.setStorageSync('userToken', mockToken)
        uni.setStorageSync('userInfo', mockUserInfo)

        loading.value = false

        uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
        })

        // 返回上一页或跳转到首页
        setTimeout(() => {
            navigateToHome()
        }, 1500)
    }, 1500)
}

// 查看用户协议
const viewUserAgreement = () => {
    uni.navigateTo({
        url: '/pages/user-agreement/user-agreement'
    })
}

// 查看隐私政策
const viewPrivacyPolicy = () => {
    uni.navigateTo({
        url: '/pages/privacy-policy/privacy-policy'
    })
}

// 返回首页
const goBack = () => {
    uni.switchTab({
        url: '/pages/index/index'
    })
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
}

/* 返回按钮 */
.back-button {
    position: absolute;
    top: 5vh;
    left: 2vh;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50rpx;
    backdrop-filter: blur(10rpx);
    z-index: 10;
    transition: all 0.3s;

    &:active {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.95);
    }
}

.back-icon {
    font-size: 32rpx;
    color: #fff;
    font-weight: bold;
}

.back-text {
    font-size: 26rpx;
    color: #fff;
}

/* Logo 区域 */
.logo-section {
    padding-top: 15vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 2;
}

.logo-container {
    width: 480rpx;
    height: 180rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo {
    width: 100%;
    height: 100%;
}

.app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 16rpx;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.app-slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
}

/* 登录区域 */
.login-section {
    margin-top: 12vh;
    padding: 0 50rpx;
    position: relative;
    z-index: 2;
}

.welcome-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;
}

.welcome-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 12rpx;
}

.welcome-subtitle {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
}

/* 切换登录方式 */
.switch-mode {
    text-align: center;
    padding: 30rpx 0 20rpx;
}

.switch-text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: underline;
}

/* 隐私协议 */
.agreement {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    padding: 0 20rpx;
}

.agreement-checkbox {
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.agreement-content {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.agreement-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.7);
}

.agreement-link {
    font-size: 24rpx;
    color: #fff;
    text-decoration: underline;
    margin: 0 4rpx;
    font-weight: 500;
}

/* 装饰元素 */
.decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    overflow: hidden;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
}

.circle-1 {
    width: 400rpx;
    height: 400rpx;
    top: -100rpx;
    right: -100rpx;
}

.circle-2 {
    width: 300rpx;
    height: 300rpx;
    bottom: 100rpx;
    left: -80rpx;
}

.circle-3 {
    width: 200rpx;
    height: 200rpx;
    top: 40%;
    right: 50rpx;
    background: rgba(255, 255, 255, 0.05);
}
</style>

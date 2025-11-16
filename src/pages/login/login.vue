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
                <image class="logo" src="https://picsum.photos/200/200?random=logo" mode="aspectFill"></image>
                <text class="app-name">智慧数据学院</text>
                <text class="app-slogan">让成长看得见</text>
            </view>

            <!-- 登录区域 -->
            <view class="login-section">
                <view class="welcome-text">
                    <text class="welcome-title">欢迎登录</text>
                    <text class="welcome-subtitle">{{ loginMode === 'wechat' ? '使用手机号快速登录' : '使用账号密码登录' }}</text>
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

const loading = ref(false)
const loginMode = ref('wechat') // 'wechat' | 'account'
const agreedToPolicy = ref(false) // 是否同意隐私政策，默认不选中

onLoad(() => {
    console.log('登录页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【登录页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 账号密码登录
    console.log('📍 接口1: 账号密码登录')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/auth/login')
    console.log('请求参数:')
    console.log(JSON.stringify({
        username: '2021001', // 学号/工号
        password: '123456' // 密码
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '登录成功',
        data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT token
            userInfo: {
                id: 1,
                name: '张三',
                avatar: 'https://example.com/avatar.png',
                phone: '138****8888',
                hasBindPhone: false // 是否已绑定微信手机号
            }
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 绑定微信手机号
    console.log('📍 接口2: 绑定微信手机号')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/auth/bind-wechat-phone')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        code: 'wx_code', // 微信登录凭证
        encryptedData: 'encrypted_data', // 加密数据
        iv: 'iv_string', // 加密算法初始向量
        cloudID: 'cloud_id' // 可选,微信云开发ID
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '绑定成功',
        data: {
            phone: '13812345678' // 绑定的手机号
        }
    }, null, 2))
    console.log('\n')

    // 接口3: 微信手机号登录
    console.log('📍 接口3: 微信手机号一键登录')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/auth/wechat-phone-login')
    console.log('请求参数:')
    console.log(JSON.stringify({
        code: 'wx_code', // 微信登录凭证
        encryptedData: 'encrypted_data', // 加密数据
        iv: 'iv_string', // 加密算法初始向量
        cloudID: 'cloud_id' // 可选,微信云开发ID
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '登录成功',
        data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // JWT token
            userInfo: {
                id: 1,
                name: '张三',
                avatar: 'https://example.com/avatar.png',
                phone: '138****8888'
            }
        }
    }, null, 2))
    console.log('\n')

    // 接口4: Mock登录(开发环境)
    console.log('📍 接口4: Mock登录(开发环境专用)')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/auth/mock-login')
    console.log('请求参数:')
    console.log(JSON.stringify({
        phone: '13800138000' // 可选,测试手机号
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '登录成功',
        data: {
            token: 'mock_token_for_development',
            userInfo: {
                id: 1,
                name: '测试用户',
                avatar: 'https://example.com/avatar.png',
                phone: '138****8000'
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 账号密码登录流程:')
    console.log('   - 用户输入学号/工号和密码')
    console.log('   - 登录成功后,如果 hasBindPhone=false,自动弹窗引导绑定微信手机号')
    console.log('   - 绑定成功后,后续可使用微信手机号一键登录')
    console.log('2. 微信手机号绑定:')
    console.log('   - 需要先通过账号密码登录获取 token')
    console.log('   - 使用 token 调用绑定接口')
    console.log('   - 绑定后账号与微信手机号关联')
    console.log('3. 微信手机号登录:')
    console.log('   - 前端调用 wx.login() 获取 code')
    console.log('   - 用户点击授权获取手机号,得到 encryptedData 和 iv')
    console.log('   - 后端通过手机号查找已绑定的账号并登录')
    console.log('4. Token管理: JWT格式,过期时间建议7天')
    console.log('5. Mock登录: 仅用于开发环境,生产环境禁用')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

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
        // TODO: 实际项目中调用后端接口
        // const res = await uni.request({
        //     url: 'https://your-api.com/api/auth/login',
        //     method: 'POST',
        //     data: {
        //         username: formData.username,
        //         password: formData.password
        //     }
        // })

        // 模拟登录成功
        setTimeout(() => {
            const mockUserInfo = {
                id: 1,
                name: '张三',
                avatar: 'https://picsum.photos/200/200?random=user',
                phone: '',
                hasBindPhone: false, // 模拟未绑定手机号
                positions: ['团支书'],
                quantificationScore: 95.5
            }

            const mockToken = 'account_token_' + Date.now()

            // 保存登录信息
            uni.setStorageSync('userToken', mockToken)
            uni.setStorageSync('userInfo', mockUserInfo)

            loading.value = false

            uni.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1500
            })

            // 如果未绑定手机号,弹窗引导绑定
            if (!mockUserInfo.hasBindPhone) {
                setTimeout(() => {
                    showBindPhoneModal()
                }, 1500)
            } else {
                // 已绑定,直接跳转
                setTimeout(() => {
                    navigateToHome()
                }, 1500)
            }
        }, 1500)
    } catch (error) {
        loading.value = false
        uni.showToast({
            title: '登录失败',
            icon: 'none'
        })
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
        const { encryptedData, iv } = e.detail
        const token = uni.getStorageSync('userToken')

        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        try {
            // TODO: 调用绑定接口
            // 需要先调用 wx.login() 获取 code
            uni.login({
                success: async (loginRes) => {
                    const code = loginRes.code

                    // TODO: 调用后端绑定接口
                    // const res = await uni.request({
                    //     url: 'https://your-api.com/api/auth/bind-wechat-phone',
                    //     method: 'POST',
                    //     header: {
                    //         Authorization: `Bearer ${token}`
                    //     },
                    //     data: { code, encryptedData, iv }
                    // })

                    // 模拟绑定成功
                    setTimeout(() => {
                        const userInfo = uni.getStorageSync('userInfo')
                        userInfo.hasBindPhone = true
                        userInfo.phone = '138****8888'
                        uni.setStorageSync('userInfo', userInfo)

                        uni.showToast({
                            title: '绑定成功',
                            icon: 'success'
                        })

                        setTimeout(() => {
                            navigateToHome()
                        }, 1500)
                    }, 1000)
                }
            })
        } catch (error) {
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
const getPhoneNumber = (e) => {
    console.log('获取手机号:', e)

    // 验证是否同意隐私政策
    if (!checkAgreement()) {
        return
    }

    if (e.detail.errMsg === 'getPhoneNumber:ok') {
        // 获取到加密数据
        const { encryptedData, iv } = e.detail

        loading.value = true

        // 需要先调用 wx.login() 获取 code
        uni.login({
            success: async (loginRes) => {
                const code = loginRes.code

                // TODO: 实际项目中调用后端接口
                // const res = await uni.request({
                //     url: 'https://your-api.com/api/auth/wechat-phone-login',
                //     method: 'POST',
                //     data: { code, encryptedData, iv }
                // })

                // 模拟登录成功
                performLogin()
            },
            fail: () => {
                loading.value = false
                uni.showToast({
                    title: '登录失败',
                    icon: 'none'
                })
            }
        })
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

.logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 32rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
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

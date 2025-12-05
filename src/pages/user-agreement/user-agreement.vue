<template>
    <view class="page">
        <view class="container">
            <!-- 标题 -->
            <view class="header">
                <text class="title">用户协议</text>
                <text class="update-time">更新时间: 2025年10月29日</text>
            </view>

            <!-- 协议内容 -->
            <view class="content">
                <view class="section">
                    <text class="section-title">一、协议的接受</text>
                    <text class="section-text">
                        欢迎使用智数服务舱小程序(以下简称"本平台")。本平台由学校官方开发和运营,旨在为学生提供活动管理、成长记录、组织管理等服务。
                    </text>
                    <text class="section-text">
                        在使用本平台服务前,请您仔细阅读并充分理解本协议的全部内容。一旦您点击"同意"或开始使用本平台,即表示您已完全接受本协议的所有条款。
                    </text>
                </view>

                <view class="section">
                    <text class="section-title">二、服务说明</text>
                    <text class="section-text">
                        本平台提供以下主要服务:
                    </text>
                    <text class="section-text">1. 活动管理:浏览、报名、参加学校组织的各类活动</text>
                    <text class="section-text">2. 成长记录:记录和查看个人量化分数及成长轨迹</text>
                    <text class="section-text">3. 组织管理:加入和管理学生组织</text>
                    <text class="section-text">4. 个人信息管理:维护和更新个人基本信息</text>
                    <text class="section-text">5. 失物招领:发布和查找丢失物品信息</text>
                </view>

                <view class="section">
                    <text class="section-title">三、用户注册与账号管理</text>
                    <text class="section-text">
                        3.1 用户需使用真实有效的微信账号进行登录,并提供真实、准确的个人信息。
                    </text>
                    <text class="section-text">
                        3.2 用户应妥善保管账号信息,对账号下的所有行为负责。
                    </text>
                    <text class="section-text">
                        3.3 禁止用户将账号转让、出售或出借给他人使用。
                    </text>
                </view>

                <view class="section">
                    <text class="section-title">四、用户行为规范</text>
                    <text class="section-text">
                        用户在使用本平台时,应遵守以下规范:
                    </text>
                    <text class="section-text">4.1 遵守国家法律法规和学校规章制度</text>
                    <text class="section-text">4.2 不得发布违法、不良或虚假信息</text>
                    <text class="section-text">4.3 不得恶意刷分或作弊</text>
                    <text class="section-text">4.4 尊重他人隐私和知识产权</text>
                    <text class="section-text">4.5 不得利用平台进行商业推广</text>
                </view>

                <view class="section">
                    <text class="section-title">五、知识产权</text>
                    <text class="section-text">
                        5.1 本平台的所有内容(包括但不限于软件、文字、图片、图标等)的知识产权归学校所有。
                    </text>
                    <text class="section-text">
                        5.2 未经授权,用户不得复制、修改、传播或用于商业用途。
                    </text>
                </view>

                <view class="section">
                    <text class="section-title">六、免责声明</text>
                    <text class="section-text">
                        6.1 本平台不对因网络故障、系统维护等不可抗力因素导致的服务中断承担责任。
                    </text>
                    <text class="section-text">
                        6.2 用户因违反本协议导致的任何损失,由用户自行承担。
                    </text>
                    <text class="section-text">
                        6.3 本平台有权根据实际情况随时修改本协议,修改后的协议将在平台上公布。
                    </text>
                </view>

                <view class="section">
                    <text class="section-title">七、争议解决</text>
                    <text class="section-text">
                        本协议的解释、效力及争议解决均适用中华人民共和国法律。如发生争议,双方应友好协商解决;协商不成的,可向学校有关部门申诉。
                    </text>
                </view>

                <view class="section">
                    <text class="section-title">八、联系方式</text>
                    <text class="section-text">
                        如您对本协议有任何疑问,请联系:
                    </text>
                    <text class="section-text">邮箱: support@example.edu.cn</text>
                    <text class="section-text">电话: 0571-88888888</text>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="footer">
                <button class="accept-btn" @tap="goBack">我已阅读并同意</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
    console.log('用户协议页面加载')
})

const goBack = () => {
    uni.navigateBack()
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 120rpx;
}

.header {
    background: #fff;
    padding: 40rpx 30rpx;
    margin-bottom: 20rpx;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
}

.update-time {
    font-size: 24rpx;
    color: #999;
}

.content {
    background: #fff;
    padding: 30rpx;
}

.section {
    margin-bottom: 40rpx;

    &:last-child {
        margin-bottom: 0;
    }
}

.section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
    line-height: 1.6;
}

.section-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    display: block;
    margin-bottom: 16rpx;
    text-align: justify;

    &:last-child {
        margin-bottom: 0;
    }
}

.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.accept-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
        border: none;
    }

    &:active {
        opacity: 0.9;
        transform: scale(0.98);
    }
}
</style>

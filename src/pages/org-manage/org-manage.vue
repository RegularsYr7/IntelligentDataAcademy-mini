<template>
    <view class="org-manage">
        <!-- 组织信息编辑区域 -->
        <view class="edit-section">
            <view class="section-title">组织信息</view>

            <!-- 组织logo -->
            <view class="form-item">
                <view class="label">组织logo</view>
                <view class="logo-upload" @tap="uploadLogo">
                    <image v-if="orgData.logo" :src="orgData.logo" mode="aspectFill" class="logo-preview" />
                    <view v-else class="logo-placeholder">
                        <text class="upload-icon">📷</text>
                        <text class="upload-text">点击上传</text>
                    </view>
                </view>
            </view>

            <!-- 组织名称 -->
            <view class="form-item">
                <view class="label required">组织名称</view>
                <view class="input-wrapper">
                    <input v-model="orgData.name" class="input" placeholder="请输入组织名称" maxlength="30" />
                </view>
            </view>

            <!-- 组织级别 -->
            <view class="form-item">
                <view class="label">组织级别</view>
                <picker :value="levelIndex" :range="levelOptions" @change="onLevelChange" class="picker">
                    <view class="picker-value">
                        {{ orgData.level || '请选择组织级别' }}
                    </view>
                </picker>
            </view>

            <!-- 所属学院 -->
            <view class="form-item">
                <view class="label">所属学院</view>
                <view class="input-wrapper">
                    <input v-model="orgData.college" class="input" placeholder="请输入所属学院" />
                </view>
            </view>

            <!-- 成立年份 -->
            <view class="form-item">
                <view class="label">成立年份</view>
                <picker mode="date" :value="orgData.foundedYear" fields="year" @change="onYearChange" class="picker">
                    <view class="picker-value">
                        {{ orgData.foundedYear || '请选择成立年份' }}
                    </view>
                </picker>
            </view>

            <!-- 组织简介 -->
            <view class="form-item">
                <view class="label required">组织简介</view>
                <view class="textarea-wrapper">
                    <textarea v-model="orgData.intro" class="textarea" placeholder="请输入组织简介" maxlength="500"
                        :show-confirm-bar="false" />
                </view>
                <view class="text-count">{{ orgData.intro?.length || 0 }}/500</view>
            </view>

            <!-- 活动地点 -->
            <view class="form-item">
                <view class="label">活动地点</view>
                <view class="input-wrapper">
                    <input v-model="orgData.location" class="input" placeholder="请输入常用活动地点" />
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="form-item">
                <view class="label">联系方式</view>
                <view class="input-wrapper">
                    <input v-model="orgData.contact" class="input" placeholder="请输入联系方式" />
                </view>
            </view>
        </view>

        <!-- 人员管理入口 -->
        <view class="member-section" @tap="goToMemberManage">
            <view class="section-content">
                <view class="section-left">
                    <text class="section-icon">👥</text>
                    <text class="section-text">人员管理</text>
                </view>
                <view class="section-right">
                    <text class="member-count">{{ orgData.memberCount || 0 }}人</text>
                    <text class="arrow">›</text>
                </view>
            </view>
        </view>

        <!-- 保存按钮 -->
        <view class="bottom-actions">
            <button class="save-btn" @tap="saveOrgInfo">
                <text class="btn-text">保存修改</text>
            </button>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const orgId = ref('')
const levelIndex = ref(0)
const levelOptions = ['校级', '院级', '系级', '其他']

const orgData = ref({
    logo: '',
    name: '',
    level: '',
    college: '',
    foundedYear: '',
    intro: '',
    location: '',
    contact: '',
    memberCount: 0
})

onLoad((options) => {
    if (options.id) {
        orgId.value = options.id
        loadOrgData(options.id)
    }

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【组织管理页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取组织信息(用于编辑)
    console.log('📍 接口1: 获取组织信息')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/organizations/:id/edit')
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
            logo: 'https://example.com/logo.png',
            name: '数据科学与人工智能社团',
            level: '校级', // 校级、院级、系级、其他
            college: '计算机科学与技术学院',
            foundedYear: '2020',
            intro: '组织简介...',
            location: '科技楼A301',
            contact: 'ai-club@example.com',
            memberCount: 156
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 上传组织logo
    console.log('📍 接口2: 上传组织Logo')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/upload/image')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数: FormData')
    console.log(JSON.stringify({
        file: 'File对象', // 图片文件
        type: 'org_logo' // 上传类型
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            url: 'https://example.com/uploads/logo.png' // 图片URL
        }
    }, null, 2))
    console.log('\n')

    // 接口3: 保存组织信息
    console.log('📍 接口3: 保存组织信息')
    console.log('━'.repeat(80))
    console.log('请求方式: PUT')
    console.log('接口路径: /api/organizations/:id')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        id: 1,
        logo: 'https://example.com/logo.png',
        name: '数据科学与人工智能社团',
        level: '校级',
        college: '计算机科学与技术学院',
        foundedYear: '2020',
        intro: '组织简介...',
        location: '科技楼A301',
        contact: 'ai-club@example.com'
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: '保存成功'
    }, null, 2))
    console.log('\n')

    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 权限验证: 需要验证用户是否为该组织的管理员')
    console.log('2. 必填字段: name, intro')
    console.log('3. Logo上传: 建议限制大小2MB以内,格式jpg/png')
    console.log('4. 成立年份: 选择器返回格式如"2020"')
    console.log('5. 简介字数: 前端限制500字')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 加载组织数据
const loadOrgData = (id) => {
    // TODO: 从服务器加载组织数据
    // 模拟数据
    setTimeout(() => {
        if (id == 1) {
            orgData.value = {
                logo: 'https://via.placeholder.com/100',
                name: '数据科学与人工智能社团',
                level: '校级',
                college: '计算机科学与技术学院',
                foundedYear: '2020',
                intro: '数据科学与人工智能社团致力于推广数据科学和人工智能技术,为同学们提供学习交流的平台。我们定期举办技术讲座、项目实践、竞赛培训等活动,帮助成员提升专业技能。',
                location: '科技楼A301',
                contact: 'ai-club@example.com',
                memberCount: 156
            }
            levelIndex.value = levelOptions.indexOf(orgData.value.level)
        } else if (id == 4) {
            orgData.value = {
                logo: 'https://via.placeholder.com/100',
                name: '创新创业俱乐部',
                level: '院级',
                college: '经济管理学院',
                foundedYear: '2019',
                intro: '创新创业俱乐部为有创业梦想的同学提供资源和指导,组织创业大赛、项目路演、企业参观等活动。',
                location: '创业孵化基地',
                contact: 'startup@example.com',
                memberCount: 89
            }
            levelIndex.value = levelOptions.indexOf(orgData.value.level)
        }
    }, 300)
}

// 上传logo
const uploadLogo = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            // TODO: 上传到服务器
            orgData.value.logo = res.tempFilePaths[0]
            uni.showToast({
                title: 'Logo已选择',
                icon: 'success'
            })
        }
    })
}

// 选择组织级别
const onLevelChange = (e) => {
    levelIndex.value = e.detail.value
    orgData.value.level = levelOptions[e.detail.value]
}

// 选择成立年份
const onYearChange = (e) => {
    orgData.value.foundedYear = e.detail.value
}

// 前往人员管理
const goToMemberManage = () => {
    uni.navigateTo({
        url: `/pages/member-manage/member-manage?id=${orgId.value}`
    })
}

// 保存组织信息
const saveOrgInfo = () => {
    // 验证必填项
    if (!orgData.value.name) {
        uni.showToast({
            title: '请输入组织名称',
            icon: 'none'
        })
        return
    }

    if (!orgData.value.intro) {
        uni.showToast({
            title: '请输入组织简介',
            icon: 'none'
        })
        return
    }

    // TODO: 提交到服务器
    uni.showLoading({ title: '保存中...' })

    setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
        })

        // 延迟返回上一页
        setTimeout(() => {
            uni.navigateBack()
        }, 2000)
    }, 1000)
}
</script>

<style lang="scss" scoped>
.org-manage {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
    padding-bottom: 180rpx;
}

.edit-section {
    background: #fff;
    margin: 20rpx;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.08);
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 40rpx;
    padding-left: 20rpx;
    border-left: 6rpx solid #667eea;
}

.form-item {
    margin-bottom: 40rpx;
    position: relative;

    &:last-child {
        margin-bottom: 0;
    }
}

.label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;

    &.required::after {
        content: '*';
        color: #ff6b6b;
        margin-left: 8rpx;
        font-size: 32rpx;
    }
}

.logo-upload {
    width: 160rpx;
    height: 160rpx;
    border-radius: 16rpx;
    overflow: hidden;
    border: 2rpx dashed #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    transition: all 0.3s;

    &:active {
        transform: scale(0.95);
        border-color: #667eea;
    }
}

.logo-preview {
    width: 100%;
    height: 100%;
}

.logo-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
}

.upload-icon {
    font-size: 48rpx;
}

.upload-text {
    font-size: 24rpx;
    color: #999;
}

.input-wrapper,
.textarea-wrapper {
    width: 100%;
}

.input,
.textarea {
    width: 100%;
    min-height: 80rpx;
    padding: 24rpx;
    background: #f8f9ff;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    box-sizing: border-box;

    &:focus {
        border-color: #667eea;
        background: #fff;
    }
}

.textarea {
    min-height: 240rpx;
    height: auto;
    line-height: 1.6;
}

.text-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
}

.picker {
    width: 100%;
}

.picker-value {
    width: 100%;
    min-height: 80rpx;
    padding: 24rpx;
    background: #f8f9ff;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    &::after {
        content: '›';
        position: absolute;
        right: 24rpx;
        top: 50%;
        transform: translateY(-50%) rotate(90deg);
        color: #999;
        font-size: 32rpx;
    }
}

.member-section {
    background: #fff;
    margin: 20rpx;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.08);
    transition: all 0.3s;

    &:active {
        transform: scale(0.98);
        background: #f8f9ff;
    }
}

.section-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-left {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.section-icon {
    font-size: 40rpx;
}

.section-text {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
}

.section-right {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.member-count {
    font-size: 26rpx;
    color: #667eea;
    font-weight: 500;
}

.arrow {
    font-size: 40rpx;
    color: #999;
}

.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.save-btn {
    width: 100%;
    height: 90rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 45rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.3s;

    &::after {
        border: none;
    }

    &:active {
        transform: scale(0.98);
        opacity: 0.9;
    }
}

.btn-text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 500;
}
</style>

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
                    <text class="member-count">{{ orgData.peopleCount || 0 }}人</text>
                    <text class="arrow">›</text>
                </view>
            </view>
        </view>

        <!-- 待审核列表入口 -->
        <view class="member-section" @tap="goToPendingReviews" v-if="isAdmin">
            <view class="section-content">
                <view class="section-left">
                    <text class="section-icon">📝</text>
                    <text class="section-text">待审核列表</text>
                </view>
                <view class="section-right">
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
import { getOrganizationDetail, updateOrganizationInfo } from '@/api/organization'

const orgId = ref('')
const levelIndex = ref(0)
const levelOptions = ['校级', '院级', '班级', '其他']
const levelValues = ['1', '2', '3', '0']
const isAdmin = ref(false)
const peopleCount = ref(0)

const orgData = ref({
    organizationId: null,
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
})

const loadOrgData = async (id) => {
    try {
        const userInfo = uni.getStorageSync('userInfo')
        const params = {}
        if (userInfo && (userInfo.studentId || userInfo.id)) {
            params.studentId = userInfo.studentId || userInfo.id
        }

        const res = await getOrganizationDetail(id, params)
        if (res && res.organization) {
            const org = res.organization
            orgData.value = {
                organizationId: org.organizationId,
                logo: org.organizationLogo || org.recommendImage,
                name: org.organizationName,
                level: getLevelText(org.organizationLevel),
                college: org.collegeId,
                foundedYear: org.establishYear,
                intro: org.introduction || org.displayText,
                location: org.officeLocation,
                contact: org.contactPhone,
                memberCount: org.memberCount
            }

            // Set level index
            const idx = levelValues.indexOf(org.organizationLevel)
            if (idx !== -1) {
                levelIndex.value = idx
            }

            // Check admin permission
            if (res.isMember) {
                // memberRole: "2"=主席, "1"=管理员, "0"=普通成员
                isAdmin.value = res.memberRole === '2' || res.memberRole === '1'
            }

            if (res.totalMemberCount !== undefined) {
                orgData.value.peopleCount = res.totalMemberCount
            }
        }
    } catch (error) {
        console.error('加载组织信息失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
    }
}

const getLevelText = (level) => {
    const map = { '1': '校级', '2': '院级', '3': '班级', '0': '其他' }
    return map[level] || '未知'
}

const onLevelChange = (e) => {
    levelIndex.value = e.detail.value
    orgData.value.level = levelOptions[levelIndex.value]
}

const onYearChange = (e) => {
    orgData.value.foundedYear = e.detail.value
}

const uploadLogo = () => {
    uni.chooseImage({
        count: 1,
        success: (chooseImageRes) => {
            const tempFilePaths = chooseImageRes.tempFilePaths
            uni.uploadFile({
                url: 'http://intelligentmini.rainyweb.cn/common/upload',
                filePath: tempFilePaths[0],
                name: 'file',
                header: {
                    Authorization: 'Bearer ' + uni.getStorageSync('userToken')
                },
                success: (uploadFileRes) => {
                    const data = JSON.parse(uploadFileRes.data)
                    if (data.code === 200) {
                        orgData.value.logo = data.url
                        uni.showToast({ title: '上传成功', icon: 'success' })
                    } else {
                        uni.showToast({ title: data.msg || '上传失败', icon: 'none' })
                    }
                }
            })
        }
    })
}

const saveOrgInfo = async () => {
    if (!orgData.value.name) {
        uni.showToast({ title: '请输入组织名称', icon: 'none' })
        return
    }
    if (!orgData.value.intro) {
        uni.showToast({ title: '请输入组织简介', icon: 'none' })
        return
    }

    try {
        const userInfo = uni.getStorageSync('userInfo')
        const payload = {
            organizationId: orgData.value.organizationId,
            studentId: userInfo.studentId || userInfo.id,
            organizationName: orgData.value.name,
            organizationLevel: levelValues[levelIndex.value],
            introduction: orgData.value.intro,
            officeLocation: orgData.value.location,
            contactPhone: orgData.value.contact,
            establishYear: orgData.value.foundedYear,
            organizationLogo: orgData.value.logo,
            collegeId: orgData.value.college
        }

        const res = await updateOrganizationInfo(payload)
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
            uni.navigateBack()
        }, 1500)
    } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({ title: error.message || '保存失败', icon: 'none' })
    }
}

const goToMemberManage = () => {
    uni.navigateTo({
        url: `/pages/member-manage/member-manage?id=${orgId.value}`
    })
}

const goToPendingReviews = () => {
    uni.navigateTo({
        url: `/pages/pending-reviews/pending-reviews?orgId=${orgId.value}`
    })
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
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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

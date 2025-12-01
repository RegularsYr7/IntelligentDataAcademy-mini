<template>
    <view class="page">
        <!-- 顶部背景装饰 -->
        <view class="header-bg">
            <view class="circle circle-1"></view>
            <view class="circle circle-2"></view>
        </view>

        <view class="container">
            <!-- 头像和姓名 -->
            <view class="profile-section">
                <view class="avatar-wrapper">
                    <view class="avatar-container">
                        <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
                        <view class="avatar-edit" @tap="changeAvatar">
                            <text class="edit-icon">📷</text>
                        </view>
                    </view>
                </view>
                <text class="user-name">{{ userInfo.name }}</text>
                <text class="user-desc" v-if="userInfo.studentId">学号：{{ userInfo.studentId }}</text>
            </view>

            <!-- 基本信息 -->
            <view class="info-card">
                <view class="card-header">
                    <view class="header-line"></view>
                    <text class="header-title">学校信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="label">学校</text>
                        <text class="value">{{ userInfo.school }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">学院</text>
                        <text class="value">{{ userInfo.college }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">专业</text>
                        <text class="value">{{ userInfo.major }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">学制</text>
                        <text class="value">{{ userInfo.schoolSystem }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">班级</text>
                        <text class="value">{{ userInfo.class }}</text>
                    </view>
                </view>
            </view>

            <!-- 个人信息 -->
            <view class="info-card">
                <view class="card-header">
                    <view class="header-line"></view>
                    <text class="header-title">个人信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="label">社区昵称</text>
                        <view class="value-box">
                            <input class="input" type="text" v-model="userInfo.communityName" placeholder="请输入昵称"
                                placeholder-class="placeholder" maxlength="20" @blur="onCommunityNameChange" />
                            <text class="edit-hint">✎</text>
                        </view>
                    </view>
                    <view class="info-item">
                        <text class="label">身份证号</text>
                        <text class="value">{{ userInfo.idCard }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">入学时间</text>
                        <text class="value">{{ userInfo.enrollmentDate }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">毕业时间</text>
                        <text class="value">{{ userInfo.graduationDate }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">民族</text>
                        <text class="value">{{ userInfo.ethnicity }}</text>
                    </view>
                    <view class="info-item">
                        <text class="label">政治面貌</text>
                        <text class="value">{{ userInfo.politicalStatus }}</text>
                    </view>
                    <picker mode="date" :value="userInfo.birthday" @change="onBirthdayChange">
                        <view class="info-item hover-effect">
                            <text class="label">生日</text>
                            <view class="value-box">
                                <text class="value link">{{ userInfo.birthday || '去设置' }}</text>
                                <text class="arrow">></text>
                            </view>
                        </view>
                    </picker>
                    <picker mode="multiSelector" :range="hometownColumns" :value="hometownIndexes"
                        @change="onHometownChange" @columnchange="onColumnChange">
                        <view class="info-item hover-effect">
                            <text class="label">家乡</text>
                            <view class="value-box">
                                <text class="value link">{{ hometownText }}</text>
                                <text class="arrow">></text>
                            </view>
                        </view>
                    </picker>
                    <picker mode="selector" :range="bloodTypeOptions" @change="onBloodTypeChange">
                        <view class="info-item hover-effect">
                            <text class="label">血型</text>
                            <view class="value-box">
                                <text class="value link">{{ userInfo.bloodType || '去设置' }}</text>
                                <text class="arrow">></text>
                            </view>
                        </view>
                    </picker>
                </view>
            </view>

            <view class="footer-spacing"></view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import cityData from '@/utils/city.js'
import { updateProfile, getStudentInfo, checkMonthlyAvatarChanges } from '@/api/student'
import { chooseAndUploadImage } from '@/utils/upload'

// 原始用户信息，用于对比是否修改
const originalUserInfo = ref(null)

// 用户信息
const userInfo = ref({
})

// 头像修改次数信息
const avatarChangeInfo = ref({
    remaining: 3,
    used: 0,
    total: 3
})

// 初始化省份列表
const provinceList = ref([])
const cityList = ref([])

// 从cityData获取省份列表
const initProvinceList = () => {
    const provinces = []
    Object.keys(cityData["0"]).forEach(key => {
        provinces.push({
            id: parseInt(key),
            name: cityData["0"][key]
        })
    })
    provinceList.value = provinces
}

// 根据省份ID获取城市列表
const getCityListByProvinceId = (provinceId) => {
    const provinceKey = provinceId.toString()
    if (cityData[provinceKey]) {
        const cities = []
        Object.keys(cityData[provinceKey]).forEach(key => {
            cities.push({
                id: parseInt(key),
                name: cityData[provinceKey][key]
            })
        })
        return cities
    }
    return []
}

// 家乡选择器配置
const hometownColumns = ref([
    provinceList.value.map(p => p.name),
    []
])

// 家乡选择器索引
const hometownIndexes = ref([0, 0])

// 血型选择器
const bloodTypeOptions = ref(['A型', 'B型', 'O型', 'AB型'])

// 计算家乡文本 - 直接显示hometown字段
const hometownText = computed(() => {
    return userInfo.value.hometown || '未设置'
})

// 加载用户信息
const loadUserInfo = async () => {
    try {
        const token = uni.getStorageSync('userToken')
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            return
        }

        const cachedUserInfo = uni.getStorageSync('userInfo') || {}

        // 显示加载提示
        uni.showLoading({
            title: '加载中...'
        })

        // 从后端获取最新的学生信息
        const studentData = await getStudentInfo()
        console.log('从后端获取的学生信息:', studentData)

        // 获取学校、学院、专业、班级名称（从缓存中获取，因为后端返回的是ID）
        const schoolName = cachedUserInfo.schoolName || '未设置'
        const collegeName = cachedUserInfo.collegeName || '未设置'
        const majorName = cachedUserInfo.majorName || '未设置'
        const className = cachedUserInfo.className || '未设置'

        // 填充用户信息
        userInfo.value = {
            name: studentData.studentName || '未设置',
            avatar: studentData.avatarUrl || 'https://picsum.photos/200/200?random=user',
            school: schoolName,
            college: collegeName,
            educationLevel: studentData.educationLevel || '未设置',
            major: majorName,
            grade: studentData.grade || '未设置',
            schoolSystem: studentData.schoolingLength ? `${studentData.schoolingLength}年制` : '未设置',
            class: className,
            studentId: studentData.studentNo || '未设置',
            idCard: formatIdCard(studentData.idCard),
            enrollmentDate: formatDate(studentData.enrollmentDate),
            graduationDate: formatDate(studentData.graduationDate),
            ethnicity: studentData.nation || '未设置',
            politicalStatus: studentData.politicalStatus || '未设置',
            birthday: formatBirthdayForPicker(studentData.birthday),
            hometown: studentData.hometown || '',
            hometownProvinceId: 0,
            hometownCityId: 0,
            bloodType: studentData.bloodType || '未设置',
            communityName: studentData.communityName || ''
        }

        // 保存原始数据副本
        originalUserInfo.value = JSON.parse(JSON.stringify(userInfo.value))

        // 初始化城市列表（用于选择器）
        cityList.value = getCityListByProvinceId(1)

        // 更新家乡选择器的列数据
        hometownColumns.value[0] = provinceList.value.map(p => p.name)
        hometownColumns.value[1] = cityList.value.map(c => c.name)

        uni.hideLoading()
    } catch (error) {
        console.error('加载用户信息失败:', error)
        uni.hideLoading()
    }
}

// 格式化身份证号（脱敏处理）
const formatIdCard = (idCard) => {
    if (!idCard) return '未设置'
    if (idCard.length === 18) {
        return idCard.substring(0, 6) + '********' + idCard.substring(14)
    }
    return idCard
}

// 格式化日期
const formatDate = (dateStr) => {
    if (!dateStr) return '未设置'
    try {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}年${month}月${day}日`
    } catch (error) {
        return dateStr
    }
}

// 格式化生日（用于日期选择器）
const formatBirthdayForPicker = (dateStr) => {
    if (!dateStr) return ''
    try {
        const date = new Date(dateStr)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    } catch (error) {
        return ''
    }
}



// 在 onLoad 之前添加保存函数
const saveUserInfo = async (updates) => {
    try {
        const token = uni.getStorageSync('userToken')
        if (!token) {
            uni.showToast({
                title: '请先登录',
                icon: 'none'
            })
            throw new Error('未登录')
        }

        console.log('保存用户信息:', updates)
        await updateProfile(updates)

        // 更新本地缓存
        const cachedUserInfo = uni.getStorageSync('userInfo') || {}
        const newUserInfo = { ...cachedUserInfo, ...updates }
        uni.setStorageSync('userInfo', newUserInfo)

        // 设置刷新标志
        uni.setStorageSync('refreshUserPage', Date.now())

        console.log('用户信息保存成功，已更新缓存')
    } catch (error) {
        console.error('保存用户信息失败:', error)
        throw error
    }
}

// 加载头像修改次数信息
const loadAvatarChangeInfo = async () => {
    try {
        const result = await checkMonthlyAvatarChanges()
        if (result && result.data) {
            avatarChangeInfo.value = result.data
        }
    } catch (error) {
        console.error('获取头像修改次数失败:', error)
    }
}

onLoad(() => {
    console.log('基本信息页面加载')

    // 初始化省份列表
    initProvinceList()

    // 从缓存加载用户信息
    loadUserInfo()
})


// 修改头像
const changeAvatar = async () => {
    try {
        console.log('=== 开始修改头像流程 ===')

        // 1. 先检查本月修改次数
        console.log('调用 checkMonthlyAvatarChanges 接口...')
        const checkResult = await checkMonthlyAvatarChanges()
        console.log('头像修改次数检查结果:', checkResult)

        // 检查返回数据的有效性
        if (!checkResult) {
            console.error('checkResult 为空')
            uni.showToast({
                title: '获取次数信息失败',
                icon: 'none'
            })
            return
        }

        // 判断数据中是否包含 remaining 字段
        // 接口可能直接返回数据对象，也可能包含在 data 字段中
        let resultData = checkResult
        if (checkResult.data && typeof checkResult.data.remaining !== 'undefined') {
            resultData = checkResult.data
        }

        // 验证数据格式
        if (typeof resultData.remaining === 'undefined' ||
            typeof resultData.used === 'undefined' ||
            typeof resultData.total === 'undefined') {
            console.error('返回数据格式错误，缺少必要字段:', resultData)
            uni.showToast({
                title: '获取次数信息失败',
                icon: 'none'
            })
            return
        }

        const { used, remaining, total } = resultData
        console.log(`✓ 当前修改次数: 已使用${used}次, 剩余${remaining}次, 总共${total}次`)

        // 如果剩余次数为0，提示并拦截
        if (remaining <= 0) {
            uni.showModal({
                title: '温馨提示',
                content: `本月头像修改次数已用完（${used}/${total}次），请下个月再试哦~`,
                showCancel: false,
                confirmText: '知道了'
            })
            return
        }

        // 弹窗提示剩余次数
        const confirmMsg = remaining === 1
            ? `本月还可以修改 ${remaining} 次头像（这是最后一次机会哦）\n\n确认要继续修改吗？`
            : `本月还可以修改 ${remaining} 次头像\n\n确认要继续修改吗？`

        const confirmed = await new Promise((resolve) => {
            uni.showModal({
                title: '修改头像',
                content: confirmMsg,
                confirmText: '继续修改',
                cancelText: '取消',
                success: (res) => {
                    resolve(res.confirm)
                }
            })
        })

        if (!confirmed) {
            console.log('用户取消修改头像')
            return
        }

        // 2. 选择并上传图片
        console.log('开始选择图片...')
        const result = await chooseAndUploadImage({
            count: 1,
            sourceType: ['album', 'camera']
        })

        if (result && result.url) {
            console.log('图片上传成功:', result.url)
            userInfo.value.avatar = result.url

            // 3. 保存到服务器
            console.log('开始保存头像到服务器...')
            await saveUserInfo({ avatar: result.url })

            // 4. 刷新头像修改次数信息并提示
            console.log('刷新头像修改次数信息...')
            const newCheckResult = await checkMonthlyAvatarChanges()
            if (newCheckResult && newCheckResult.data) {
                avatarChangeInfo.value = newCheckResult.data
                const { remaining } = newCheckResult.data

                uni.showModal({
                    title: '修改成功',
                    content: `头像修改成功！本月还可修改 ${remaining} 次`,
                    showCancel: false,
                    confirmText: '知道了'
                })
            } else {
                uni.showToast({
                    title: '修改成功',
                    icon: 'success'
                })
            }
        } else {
            console.log('用户取消选择图片')
        }
    } catch (error) {
        console.error('修改头像失败:', error)

        // 隐藏可能还在显示的加载提示
        uni.hideLoading()

        // 如果是服务器返回的次数限制错误
        if (error.msg && error.msg.includes('已达上限')) {
            uni.showModal({
                title: '温馨提示',
                content: error.msg,
                showCancel: false,
                confirmText: '知道了'
            })
        } else {
            uni.showToast({
                title: error.msg || '修改失败',
                icon: 'none'
            })
        }
    }
}

// 生日改变
const onBirthdayChange = async (e) => {
    userInfo.value.birthday = e.detail.value

    // 立即保存
    try {
        await saveUserInfo({ birthday: e.detail.value })
    } catch (error) {

    }
}

// 家乡列改变
const onColumnChange = (e) => {
    const { column, value } = e.detail
    if (column === 0) {
        // 省份改变，更新城市列表
        const selectedProvince = provinceList.value[value]
        if (selectedProvince) {
            cityList.value = getCityListByProvinceId(selectedProvince.id)
            hometownColumns.value[1] = cityList.value.map(c => c.name)
            hometownIndexes.value[1] = 0
        }
    }
}

// 家乡改变
const onHometownChange = async (e) => {
    const indexes = e.detail.value
    const selectedProvince = provinceList.value[indexes[0]]
    const selectedCity = cityList.value[indexes[1]]

    if (selectedProvince && selectedCity) {
        // 更新 ID
        userInfo.value.hometownProvinceId = selectedProvince.id
        userInfo.value.hometownCityId = selectedCity.id

        // 构建新的家乡文本
        const newHometown = `${selectedProvince.name} ${selectedCity.name}`
        userInfo.value.hometown = newHometown

        hometownIndexes.value = indexes

        // 立即保存
        try {
            await saveUserInfo({
                hometownProvinceId: selectedProvince.id,
                hometownCityId: selectedCity.id,
                hometown: newHometown
            })
        } catch (error) {

        }
    }
}

// 血型改变
const onBloodTypeChange = async (e) => {
    userInfo.value.bloodType = bloodTypeOptions.value[e.detail.value]

    // 立即保存
    try {
        await saveUserInfo({ bloodType: userInfo.value.bloodType })
    } catch (error) {

    }
}

// 社区昵称改变
const onCommunityNameChange = async () => {
    const communityName = userInfo.value.communityName?.trim()

    // 如果昵称为空，不保存
    if (!communityName) {
        uni.showToast({
            title: '社区昵称不能为空',
            icon: 'none'
        })
        // 恢复原值
        userInfo.value.communityName = originalUserInfo.value.communityName
        return
    }

    // 验证昵称长度
    if (communityName.length < 2 || communityName.length > 20) {
        uni.showToast({
            title: '昵称长度应为2-20个字符',
            icon: 'none'
        })
        // 恢复原值
        userInfo.value.communityName = originalUserInfo.value.communityName
        return
    }

    // 立即保存
    try {
        await saveUserInfo({ communityName })
        // 更新原始值
        originalUserInfo.value.communityName = communityName
        uni.showToast({
            title: '保存成功',
            icon: 'success'
        })
    } catch (error) {
        console.error('保存社区昵称失败:', error)
        uni.showToast({
            title: error.msg || '保存失败',
            icon: 'none'
        })
        // 恢复原值
        userInfo.value.communityName = originalUserInfo.value.communityName
    }
}

onUnload(() => {
    console.log('基本信息页面卸载')
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background-color: #f5f7fa;
    position: relative;
}

/* 顶部背景装饰 */
.header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 420rpx;
    background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
    border-bottom-left-radius: 40rpx;
    border-bottom-right-radius: 40rpx;
    overflow: hidden;
    z-index: 1;

    .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
    }

    .circle-1 {
        width: 300rpx;
        height: 300rpx;
        top: -60rpx;
        right: -60rpx;
    }

    .circle-2 {
        width: 200rpx;
        height: 200rpx;
        bottom: 40rpx;
        left: -40rpx;
    }
}

.container {
    position: relative;
    z-index: 2;
    padding: 0 30rpx;
    background-color: transparent;
}

/* 个人资料区域 */
.profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60rpx;
    padding-bottom: 40rpx;
    color: #fff;
    background-color: transparent;

    .avatar-wrapper {
        position: relative;
        margin-bottom: 16rpx;

        &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 170rpx;
            height: 170rpx;
            border-radius: 50%;
            border: 2rpx solid rgba(255, 255, 255, 0.3);
            z-index: -1;
        }
    }

    .avatar-container {
        position: relative;
        width: 160rpx;
        height: 160rpx;
    }

    .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 6rpx solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
    }

    .avatar-edit {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 52rpx;
        height: 52rpx;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);

        .edit-icon {
            font-size: 28rpx;
        }
    }

    .user-name {
        font-size: 40rpx;
        font-weight: 600;
        margin-bottom: 8rpx;
        text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }

    .user-desc {
        font-size: 26rpx;
        opacity: 0.9;
        background: rgba(0, 0, 0, 0.1);
        padding: 4rpx 20rpx;
        border-radius: 20rpx;
    }
}

/* 信息卡片 */
.info-card {
    background: #fff;
    border-radius: 24rpx;
    padding: 0 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.03);

    .card-header {
        display: flex;
        align-items: center;
        padding: 30rpx 0;
        border-bottom: 1rpx solid #f5f5f5;

        .header-line {
            width: 8rpx;
            height: 32rpx;
            background: linear-gradient(to bottom, #3a7bd5, #00d2ff);
            border-radius: 4rpx;
            margin-right: 16rpx;
        }

        .header-title {
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
        }
    }
}

/* 信息列表 */
.info-list {
    padding: 10rpx 0;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 100rpx;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f9f9f9;

    &:last-child {
        border-bottom: none;
    }

    &.hover-effect:active {
        opacity: 0.7;
    }

    .label {
        font-size: 28rpx;
        color: #666;
        flex-shrink: 0;
        width: 160rpx;
    }

    .value {
        font-size: 28rpx;
        color: #333;
        text-align: right;
        flex: 1;

        &.link {
            color: #3a7bd5;
        }
    }

    .value-box {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .input {
            text-align: right;
            font-size: 28rpx;
            color: #333;
            width: 100%;
        }

        .placeholder {
            color: #ccc;
        }

        .edit-hint {
            font-size: 24rpx;
            color: #999;
            margin-left: 10rpx;
        }

        .arrow {
            font-size: 24rpx;
            color: #ccc;
            margin-left: 10rpx;
        }
    }
}

.footer-spacing {
    height: 40rpx;
}
</style>

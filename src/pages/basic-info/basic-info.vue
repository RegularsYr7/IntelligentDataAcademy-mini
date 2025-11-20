<template>
    <view class="page">
        <view class="container">
            <!-- 头像和姓名 -->
            <view class="profile-section">
                <view class="avatar-container">
                    <image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
                    <view class="avatar-edit" @tap="changeAvatar">
                        <text class="edit-icon">📷</text>
                    </view>
                </view>
                <text class="user-name">{{ userInfo.name }}</text>
            </view>

            <!-- 基本信息 -->
            <view class="info-section">
                <view class="section-title">
                    <text class="title-icon">🏫</text>
                    <text class="title-text">学校信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="info-label">学校</text>
                        <text class="info-value">{{ userInfo.school }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">学院</text>
                        <text class="info-value">{{ userInfo.college }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">培养层次</text>
                        <text class="info-value">{{ userInfo.educationLevel }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">专业</text>
                        <text class="info-value">{{ userInfo.major }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">年级</text>
                        <text class="info-value">{{ userInfo.grade }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">学制</text>
                        <text class="info-value">{{ userInfo.schoolSystem }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">班级</text>
                        <text class="info-value">{{ userInfo.class }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">学号</text>
                        <text class="info-value">{{ userInfo.studentId }}</text>
                    </view>
                </view>
            </view>

            <!-- 个人信息 -->
            <view class="info-section">
                <view class="section-title">
                    <text class="title-icon">👤</text>
                    <text class="title-text">个人信息</text>
                </view>
                <view class="info-list">
                    <view class="info-item">
                        <text class="info-label">身份证号</text>
                        <text class="info-value">{{ userInfo.idCard }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">入学时间</text>
                        <text class="info-value">{{ userInfo.enrollmentDate }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">毕业时间</text>
                        <text class="info-value">{{ userInfo.graduationDate }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">民族</text>
                        <text class="info-value">{{ userInfo.ethnicity }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">政治面貌</text>
                        <text class="info-value">{{ userInfo.politicalStatus }}</text>
                    </view>
                    <view class="info-item editable">
                        <text class="info-label">生日</text>
                        <view class="info-value-edit">
                            <picker mode="date" :value="userInfo.birthday" @change="onBirthdayChange">
                                <text class="value-text">{{ userInfo.birthday || '未设置' }}</text>
                            </picker>
                            <text class="edit-arrow">></text>
                        </view>
                    </view>
                    <view class="info-item editable">
                        <text class="info-label">家乡</text>
                        <view class="info-value-edit">
                            <picker mode="multiSelector" :range="hometownColumns" :value="hometownIndexes"
                                @change="onHometownChange" @columnchange="onColumnChange">
                                <text class="value-text">{{ hometownText }}</text>
                            </picker>
                            <text class="edit-arrow">></text>
                        </view>
                    </view>
                    <view class="info-item editable">
                        <text class="info-label">血型</text>
                        <view class="info-value-edit">
                            <picker mode="selector" :range="bloodTypeOptions" @change="onBloodTypeChange">
                                <text class="value-text">{{ userInfo.bloodType || '未设置' }}</text>
                            </picker>
                            <text class="edit-arrow">></text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import cityData from '@/utils/city.js'

// 用户信息
const userInfo = ref({
    name: '张三',
    avatar: 'https://picsum.photos/200/200?random=user',
    school: '某某大学',
    college: '计算机科学学院',
    educationLevel: '本科',
    major: '数据科学与大数据技术',
    grade: '2021级',
    schoolSystem: '四年制',
    class: '数据科学21-1班',
    studentId: '2021001001',
    idCard: '110101199901011234',
    enrollmentDate: '2021年9月1日',
    graduationDate: '2025年6月30日',
    ethnicity: '汉族',
    politicalStatus: '共青团员',
    birthday: '1999-01-01',
    hometownProvinceId: 1, // 北京的ID
    hometownCityId: 36, // 北京市的ID
    bloodType: 'A型'
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

// 计算家乡文本
const hometownText = computed(() => {
    const province = provinceList.value.find(p => p.id === userInfo.value.hometownProvinceId)
    const city = cityList.value.find(c => c.id === userInfo.value.hometownCityId)

    if (province && city) {
        return `${province.name} ${city.name}`
    } else if (province) {
        return province.name
    }
    return '未设置'
})

// 加载用户信息
const loadUserInfo = () => {
    const cachedUserInfo = uni.getStorageSync('userInfo')
    if (cachedUserInfo) {
        console.log('加载缓存的用户信息:', cachedUserInfo)

        // 填充用户信息
        userInfo.value = {
            name: cachedUserInfo.studentName || cachedUserInfo.name || '未设置',
            avatar: cachedUserInfo.avatarUrl || cachedUserInfo.avatar || 'https://picsum.photos/200/200?random=user',
            school: cachedUserInfo.schoolName || '未设置',
            college: cachedUserInfo.collegeName || '未设置',
            educationLevel: cachedUserInfo.educationLevel || '未设置',
            major: cachedUserInfo.majorName || '未设置',
            grade: cachedUserInfo.grade || '未设置',
            schoolSystem: cachedUserInfo.schoolingLength ? `${cachedUserInfo.schoolingLength}年制` : '未设置',
            class: cachedUserInfo.className || '未设置',
            studentId: cachedUserInfo.studentNo || cachedUserInfo.studentId || '未设置',
            idCard: formatIdCard(cachedUserInfo.idCard),
            enrollmentDate: formatDate(cachedUserInfo.enrollmentDate),
            graduationDate: formatDate(cachedUserInfo.graduationDate),
            ethnicity: cachedUserInfo.nation || '未设置',
            politicalStatus: cachedUserInfo.politicalStatus || '未设置',
            birthday: formatBirthday(cachedUserInfo.birthday),
            hometownProvinceId: 1, // 暂时使用默认值，如果后端有省市ID则使用
            hometownCityId: 36,
            bloodType: cachedUserInfo.bloodType || '未设置'
        }

        // 如果有家乡字符串，尝试解析
        if (cachedUserInfo.hometown) {
            parseHometown(cachedUserInfo.hometown)
        }
    }

    // 初始化城市列表
    cityList.value = getCityListByProvinceId(userInfo.value.hometownProvinceId)

    // 更新家乡选择器的列数据
    hometownColumns.value[0] = provinceList.value.map(p => p.name)
    hometownColumns.value[1] = cityList.value.map(c => c.name)

    // 初始化家乡选择器的索引
    const provinceIndex = provinceList.value.findIndex(p => p.id === userInfo.value.hometownProvinceId)
    const cityIndex = cityList.value.findIndex(c => c.id === userInfo.value.hometownCityId)

    if (provinceIndex !== -1) {
        hometownIndexes.value[0] = provinceIndex
    }
    if (cityIndex !== -1) {
        hometownIndexes.value[1] = cityIndex
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

// 格式化生日
const formatBirthday = (birthday) => {
    if (!birthday) return ''
    try {
        const date = new Date(birthday)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    } catch (error) {
        return birthday
    }
}

// 解析家乡字符串（如果后端返回的是字符串格式）
const parseHometown = (hometownStr) => {
    // 这里可以根据实际情况解析家乡字符串
    // 暂时保持默认值
    console.log('家乡信息:', hometownStr)
}

onLoad(() => {
    console.log('基本信息页面加载')

    // 初始化省份列表
    initProvinceList()

    // 从缓存加载用户信息
    loadUserInfo()
})


// 修改头像
const changeAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            userInfo.value.avatar = res.tempFilePaths[0]
            uni.showToast({
                title: '头像修改成功',
                icon: 'success'
            })
        }
    })
}

// 生日改变
const onBirthdayChange = (e) => {
    userInfo.value.birthday = e.detail.value
    uni.showToast({
        title: '生日修改成功',
        icon: 'success'
    })
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
const onHometownChange = (e) => {
    const indexes = e.detail.value
    const selectedProvince = provinceList.value[indexes[0]]
    const selectedCity = cityList.value[indexes[1]]

    if (selectedProvince) {
        userInfo.value.hometownProvinceId = selectedProvince.id
    }
    if (selectedCity) {
        userInfo.value.hometownCityId = selectedCity.id
    }

    hometownIndexes.value = indexes
    uni.showToast({
        title: '家乡修改成功',
        icon: 'success'
    })
}

// 血型改变
const onBloodTypeChange = (e) => {
    userInfo.value.bloodType = bloodTypeOptions.value[e.detail.value]
    uni.showToast({
        title: '血型修改成功',
        icon: 'success'
    })
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 20rpx;
}

/* 头像和姓名区域 */
.profile-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40rpx 30rpx 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20rpx;
}

.avatar-container {
    position: relative;
    margin-bottom: 24rpx;
}

.avatar {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    border: 6rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-edit {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 56rpx;
    height: 56rpx;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.edit-icon {
    font-size: 28rpx;
}

.user-name {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
}

/* 信息区域 */
.info-section {
    background: #fff;
    margin: 0 20rpx 20rpx;
    border-radius: 16rpx;
    padding: 30rpx;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.title-icon {
    font-size: 32rpx;
    line-height: 1;
    display: flex;
    align-items: center;
}

.title-text {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    line-height: 1;
}

/* 信息列表 */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 16rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    min-height: 88rpx;

    &.editable {
        cursor: pointer;
        transition: all 0.3s ease;

        &:active {
            background: #e9ecef;
            transform: scale(0.98);
        }
    }
}

.info-label {
    font-size: 28rpx;
    color: #666;
    flex-shrink: 0;
}

.info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    text-align: right;
    flex: 1;
    margin-left: 20rpx;
}

.info-value-edit {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex: 1;
    justify-content: flex-end;
}

.value-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    text-align: right;
}

.edit-arrow {
    font-size: 24rpx;
    color: #999;
}
</style>

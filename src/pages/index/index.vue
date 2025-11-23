<template>
	<view class="page">
		<view class="container">
			<!-- 校园导航 (4:3比例) -->
			<view class="campus-nav" @tap="goToCampusNav">
				<image class="nav-image" :src="campusNavImage" mode="aspectFill"></image>
				<view class="nav-overlay">
					<text class="nav-title">校园导航</text>
					<text class="nav-subtitle">Campus Navigation</text>
				</view>
			</view> <!-- 竞赛章程、风采展示 (55分) -->
			<view class="info-cards">
				<view class="info-card" @tap="goToCompetition">
					<view class="card-icon">🏆</view>
					<view class="card-content">
						<text class="card-title">竞赛章程</text>
						<text class="card-desc">Competition Rules</text>
					</view>
				</view>
				<view class="info-card" @tap="goToShowcase">
					<view class="card-icon">🎨</view>
					<view class="card-content">
						<text class="card-title">风采展示</text>
						<text class="card-desc">Showcase</text>
					</view>
				</view>
			</view>

			<!-- 课表组件 (4:3比例) -->
			<view class="schedule-card" @tap="goToSchedule">
				<view class="schedule-header">
					<text class="schedule-title">我的课表</text>
					<text class="schedule-date">{{ currentDate }}</text>
				</view>
				<view class="schedule-content">
					<view class="current-class" v-if="currentClass">
						<text class="class-status">{{ classStatus }}</text>
						<text class="class-name">{{ currentClass.name }}</text>
						<view class="class-info">
							<text class="class-time">{{ currentClass.weekDay }} {{ currentClass.time }}</text>
							<text class="class-location">📍 {{ currentClass.location }}</text>
						</view>
					</view>
					<view class="no-class" v-else>
						<text class="no-class-text">今日暂无课程</text>
					</view>
				</view>
				<view class="schedule-footer">
					<text class="view-all">查看完整课表 ></text>
				</view>
			</view>

			<!-- 功能入口 (四等分) -->
			<view class="function-grid">
				<view class="function-item" @tap="goToSignIn">
					<view class="function-icon">✅</view>
					<text class="function-text">班级签到</text>
				</view>
				<!-- <view class="function-item" @tap="goToLostFound">
					<view class="function-icon">🔍</view>
					<text class="function-text">失物招领</text>
				</view> -->
				<view class="function-item" @tap="goToFeedback">
					<view class="function-icon">💬</view>
					<text class="function-text">我要反馈</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getNextCourse } from '@/api/schedule'

// 校园导航图片
const campusNavImage = ref('/static/cam.jpg')

// 当前日期
const currentDate = ref('')

// 当前课程信息
const currentClass = ref(null)

// 课程状态文本
const classStatus = computed(() => {
	if (!currentClass.value) return ''
	return currentClass.value.status === 'ongoing' ? '正在上课' : '下节课是'
})

// 获取当前日期
const getCurrentDate = () => {
	const now = new Date()
	const days = ['日', '一', '二', '三', '四', '五', '六']
	const month = now.getMonth() + 1
	const date = now.getDate()
	const day = days[now.getDay()]
	currentDate.value = `${month}月${date}日 星期${day}`
}

onLoad(() => {
	getCurrentDate()

})

onShow(() => {
	loadNextCourse()
})

// 加载下一节课信息
const loadNextCourse = async () => {
	try {
		// 获取用户信息
		const userInfo = uni.getStorageSync('userInfo')
		if (!userInfo || !userInfo.classId) {
			console.log('用户未登录或未绑定班级')
			currentClass.value = null
			return
		}

		console.log('加载下一节课信息, classId:', userInfo.classId)
		const res = await getNextCourse({
			classId: Number(userInfo.classId)
		})
		console.log('下一节课响应:', res)

		// 后端直接返回课程数据，不在 course 对象中
		if (res && res.courseName) {
			currentClass.value = {
				name: res.courseName,
				time: res.timeRange || '未知时间',
				location: res.classroom || '未知地点',
				weekDay: res.weekDay || '',
				status: res.isCurrentCourse ? 'ongoing' : 'upcoming'
			}
		} else {
			// 没有课程
			currentClass.value = null
		}
	} catch (error) {
		console.error('加载下一节课失败:', error)
		currentClass.value = null
	}
}

// 校园导航
const goToCampusNav = () => {
	uni.navigateTo({
		url: '/pages/campus-nav/campus-nav'
	})
}

// 竞赛章程
const goToCompetition = () => {
	uni.navigateTo({
		url: '/pages/competition/competition'
	})
}

// 风采展示
const goToShowcase = () => {
	uni.navigateTo({
		url: '/pages/showcase/showcase'
	})
}

// 查看课表
const goToSchedule = () => {
	uni.navigateTo({
		url: '/pages/schedule/schedule'
	})
}

// 班级签到
const goToSignIn = () => {
	uni.navigateTo({
		url: '/pages/sign-in/sign-in'
	})
}

// 失物招领
const goToLostFound = () => {
	uni.navigateTo({
		url: '/pages/lost-found/lost-found'
	})
}


// 我要反馈
const goToFeedback = () => {
	uni.navigateTo({
		url: '/pages/feedback/feedback'
	})
}
</script>

<style scoped lang="scss">
.container {
	min-height: 100vh;
	background: #f5f5f5;
	padding-top: 5rpx;
	padding-bottom: 20rpx;
}

/* 校园导航 (4:3比例) */
.campus-nav {
	margin: 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
	position: relative;
	aspect-ratio: 4/3;
}

.nav-image {
	width: 100%;
	height: 100%;
}

.nav-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
	padding: 40rpx 30rpx 30rpx;
	display: flex;
	flex-direction: column;
}

.nav-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 8rpx;
}

.nav-subtitle {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

/* 竞赛章程、风采展示 (55分) */
.info-cards {
	display: flex;
	gap: 20rpx;
	padding: 0 20rpx;
	margin-bottom: 20rpx;
}

.info-card {
	flex: 1;
	background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
	border-radius: 16rpx;
	padding: 30rpx 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;

	&:last-child {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}
}

.card-icon {
	font-size: 56rpx;
	margin-bottom: 16rpx;
}

.card-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.card-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #fff;
	margin-bottom: 8rpx;
}

.card-desc {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
}

/* 课表组件 (4:3比例) */
.schedule-card {
	margin: 0 20rpx 20rpx;
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	aspect-ratio: 16/9;
	display: flex;
	flex-direction: column;
}

.schedule-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.schedule-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.schedule-date {
	font-size: 24rpx;
	color: #999;
}

.schedule-content {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 30rpx;
}

.current-class {
	width: 100%;
	text-align: center;
}

.class-status {
	display: block;
	font-size: 28rpx;
	color: #999;
	margin-bottom: 16rpx;
}

.class-name {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 24rpx;
}

.class-info {
	display: flex;
	justify-content: center;
	gap: 40rpx;
}

.class-time,
.class-location {
	font-size: 26rpx;
	color: #666;
}

.no-class {
	text-align: center;
}

.no-class-text {
	font-size: 28rpx;
	color: #999;
}

.schedule-footer {
	padding: 20rpx 30rpx;
	border-top: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.view-all {
	font-size: 26rpx;
	color: #667eea;
}

/* 功能入口 (四等分) */
.function-grid {
	display: flex;
	background: #fff;
	margin: 0 20rpx;
	border-radius: 16rpx;
	overflow: hidden;
}

.function-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 30rpx 0;
	position: relative;

	&:not(:last-child)::after {
		content: '';
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 1rpx;
		height: 60rpx;
		background: #f0f0f0;
	}
}

.function-icon {
	font-size: 48rpx;
	margin-bottom: 12rpx;
}

.function-text {
	font-size: 24rpx;
	color: #666;
}
</style>

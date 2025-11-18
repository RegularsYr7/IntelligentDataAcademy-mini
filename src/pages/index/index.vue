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
							<text class="class-time">{{ currentClass.time }}</text>
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
				<view class="function-item" @tap="goToLostFound">
					<view class="function-icon">🔍</view>
					<text class="function-text">失物招领</text>
				</view>
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
import { onLoad } from '@dcloudio/uni-app'

// 校园导航图片
const campusNavImage = ref('/static/cam.jpg')

// 当前日期
const currentDate = ref('')

// 当前课程信息
const currentClass = ref({
	name: '高等数学',
	time: '10:00-11:40',
	location: '教学楼A201',
	status: 'upcoming' // upcoming: 即将上课, ongoing: 正在上课
})

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
	console.log('首页加载')

	// 打印接口需求文档
	printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
	console.log('\n')
	console.log('='.repeat(80))
	console.log('【首页 - 后端接口需求文档】')
	console.log('='.repeat(80))
	console.log('\n')

	// 接口2: 获取当前课程
	console.log('📍 接口1: 获取当前课程')
	console.log('━'.repeat(80))
	console.log('请求方式: GET')
	console.log('接口路径: /api/schedule/current')
	console.log('请求头: Authorization: Bearer <token>')
	console.log('请求参数: 无')
	console.log('\n响应数据格式:')
	console.log(JSON.stringify({
		code: 200,
		message: 'success',
		data: {
			currentClass: { // 当前课程,如果没有则为null
				name: '数据结构',
				time: '08:00-09:40',
				location: '教学楼A301',
				status: 'ongoing' // ongoing-进行中, upcoming-即将开始, finished-已结束
			},
			nextClass: { // 下一节课,可选
				name: '操作系统',
				time: '10:00-11:40',
				location: '教学楼B201'
			}
		}
	}, null, 2))
	console.log('\n')

	console.log('='.repeat(80))
	console.log('【接口文档打印完毕】')
	console.log('='.repeat(80))
	console.log('\n')
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
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

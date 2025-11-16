<template>
    <view class="page">
        <view class="container">
            <!-- 封面图片 -->
            <view class="cover-section">
                <image class="cover-image" :src="showcase.coverImage" mode="aspectFill"></image>
            </view>

            <!-- 标题区域 -->
            <view class="detail-header">
                <view class="type-badge" :class="getTypeClass(showcase.type)">
                    {{ getTypeName(showcase.type) }}
                </view>
                <text class="detail-title">{{ showcase.title }}</text>
                <view class="detail-meta">
                    <text class="meta-item">
                        <text class="meta-icon">🕒</text>
                        {{ showcase.publishTime }}
                    </text>
                    <text class="meta-item">
                        <text class="meta-icon">👁</text>
                        {{ showcase.views }} 次浏览
                    </text>
                </view>
            </view>

            <!-- 简介卡片 -->
            <view class="intro-card" v-if="showcase.introduction">
                <view class="card-title">
                    <text class="title-icon">💡</text>
                    <text class="title-text">简介</text>
                </view>
                <text class="intro-text">{{ showcase.introduction }}</text>
            </view>

            <!-- 详细内容 (富文本) -->
            <view class="content-section">
                <view class="section-title">
                    <text class="title-icon">📝</text>
                    <text class="title-text">详细介绍</text>
                </view>
                <view class="rich-content">
                    <rich-text :nodes="formattedContent"></rich-text>
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="footer-actions">
                <button class="action-btn btn-share" @tap="shareShowcase">
                    <text class="btn-icon">📤</text>
                    <text class="btn-text">分享</text>
                </button>
                <button class="action-btn btn-like" @tap="likeShowcase">
                    <text class="btn-icon">{{ isLiked ? '❤️' : '🤍' }}</text>
                    <text class="btn-text">{{ isLiked ? '已点赞' : '点赞' }}</text>
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { formatRichText } from '@/utils/richtext'

// 是否已点赞
const isLiked = ref(false)

// 风采详情数据
const showcase = ref({
    id: 0,
    title: '',
    type: '',
    coverImage: '',
    introduction: '',
    publishTime: '',
    views: 0,
    content: ''
})

// 模拟数据
const showcaseData = {
    1: {
        id: 1,
        title: '李明同学荣获国家奖学金',
        type: 'student',
        coverImage: 'https://picsum.photos/750/500?random=student1',
        introduction: '李明同学是计算机学院2021级本科生，品学兼优，成绩优异，积极参加各类科技竞赛和社会实践活动。',
        publishTime: '2025-10-20',
        views: 1523,
        content: `
			<div style="line-height: 1.8; color: #333;">
				<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">个人简介</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					李明，男，计算机科学与技术学院2021级本科生，中共预备党员。入学以来，该生始终以优异的成绩和突出的综合表现位列年级前茅。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">学习成绩</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					连续三年综合测评排名第一，平均绩点4.0/4.0，多门专业课程获得满分成绩。曾获国家奖学金、校一等奖学金等多项荣誉。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">科研竞赛</h2>
				<ul style="margin-bottom: 15px; padding-left: 20px;">
					<li style="margin-bottom: 10px;">参与国家级大学生创新创业训练计划项目，担任项目负责人</li>
					<li style="margin-bottom: 10px;">获全国大学生数学建模竞赛国家一等奖</li>
					<li style="margin-bottom: 10px;">获ACM-ICPC亚洲区域赛银奖</li>
					<li style="margin-bottom: 10px;">发表SCI论文1篇，软件著作权2项</li>
				</ul>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">社会工作</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					担任班级学习委员、学院科协副主席，组织策划多次学术讲座和科技竞赛培训活动，帮助同学提升专业能力。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">获奖感言</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					"国家奖学金是对我过去努力的肯定，更是对未来的激励。我将继续秉承'厚德博学、追求卓越'的校训，
					在学习和科研的道路上不断进取，为母校争光，为祖国建设贡献青春力量！"
				</p>
			</div>
		`
    },
    2: {
        id: 2,
        title: '张教授获评省级教学名师',
        type: 'teacher',
        coverImage: 'https://picsum.photos/750/500?random=teacher1',
        introduction: '张教授从教三十年，教学经验丰富，教学方法独特，深受学生喜爱和尊敬。',
        publishTime: '2025-10-18',
        views: 2341,
        content: `
			<div style="line-height: 1.8; color: #333;">
				<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">教师简介</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					张伟，教授，博士生导师，数学科学学院院长。从教三十载，始终坚守教学一线，
					为本科生和研究生讲授《高等数学》《数学分析》等核心课程。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">教学成果</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					主持省级教学改革项目5项，发表教学研究论文20余篇，主编教材3部。
					所授课程被评为国家级一流本科课程、省级精品课程。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">教学理念</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					张教授坚持"以学生为中心"的教学理念，注重培养学生的数学思维和创新能力。
					他善于将抽象的数学知识与实际应用相结合，让学生在理解中掌握，在应用中提升。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">学生评价</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					"张老师的课堂生动有趣，让我爱上了数学。他不仅传授知识，更教会我们如何思考问题。"<br/>
					"张老师对每一位学生都非常关心，经常在课后为我们答疑解惑，是我们的良师益友。"
				</p>
			</div>
		`
    },
    3: {
        id: 3,
        title: '科技创新社团荣获全国优秀社团',
        type: 'organization',
        coverImage: 'https://picsum.photos/750/500?random=org1',
        introduction: '科技创新社团成立于2010年，致力于培养学生的创新精神和实践能力，是我校最具影响力的学生社团之一。',
        publishTime: '2025-10-15',
        views: 1876,
        content: `
			<div style="line-height: 1.8; color: #333;">
				<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">社团简介</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					科技创新社团成立于2010年，现有会员500余人，涵盖工科、理科等多个专业。
					社团以"激发创新潜能，培养实践能力"为宗旨，为广大科技爱好者提供学习交流平台。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">主要活动</h2>
				<ul style="margin-bottom: 15px; padding-left: 20px;">
					<li style="margin-bottom: 10px;">每周举办技术讲座和经验分享会</li>
					<li style="margin-bottom: 10px;">组织参加各类科技竞赛（如"挑战杯"、电子设计大赛等）</li>
					<li style="margin-bottom: 10px;">开展创新项目孵化，为成员提供技术指导和资源支持</li>
					<li style="margin-bottom: 10px;">举办校园科技文化节、创客马拉松等大型活动</li>
				</ul>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">获奖情况</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					近年来，社团成员在各类科技竞赛中获得国家级奖项30余项、省级奖项100余项。
					多个创新项目成功转化，部分成员创业项目获得投资孵化。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">社团寄语</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					"创新是民族进步的灵魂，实践是检验真理的标准。我们将继续秉承社团精神，
					为培养更多具有创新精神和实践能力的优秀人才而努力！"
				</p>
			</div>
		`
    }
}

// 获取类型名称
const getTypeName = (type) => {
    const typeMap = {
        'student': '优秀学生',
        'teacher': '优秀教师',
        'organization': '优秀组织'
    }
    return typeMap[type] || ''
}

// 获取类型样式类
const getTypeClass = (type) => {
    return `type-${type}`
}

// 格式化富文本内容
const formattedContent = computed(() => {
    return formatRichText(showcase.value.content)
})

onLoad((options) => {
    const id = parseInt(options.id)
    if (showcaseData[id]) {
        showcase.value = showcaseData[id]
        // 增加浏览次数
        showcase.value.views++
    }
    console.log('风采详情页加载', id)

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【风采详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取风采详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/showcase/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            title: '2024年数据分析大赛一等奖',
            cover: 'https://example.com/cover.jpg',
            category: 'achievement',
            description: '详细描述...',
            content: '详细内容...',
            images: ['https://example.com/img1.jpg'],
            date: '2024-10-15',
            participants: [
                {
                    id: 1,
                    name: '张三',
                    avatar: 'https://example.com/avatar.jpg',
                    role: '队长'
                }
            ],
            organization: {
                id: 1,
                name: '数据科学社团',
                logo: 'https://example.com/logo.jpg'
            },
            likeCount: 256,
            viewCount: 1523,
            isLiked: false,
            tags: ['数据分析', '大赛', '一等奖']
        }
    }, null, 2))
    console.log('📝 获取详情时自动增加浏览次数')
    console.log('\n')

    console.log('📍 接口2: 点赞/取消点赞')
    console.log('━'.repeat(80))
    console.log('请求方式: POST')
    console.log('接口路径: /api/showcase/:id/like 或 /api/showcase/:id/unlike')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 分享
const shareShowcase = () => {
    uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
    })
    uni.showToast({
        title: '分享功能',
        icon: 'none'
    })
}

// 点赞
const likeShowcase = () => {
    isLiked.value = !isLiked.value
    uni.showToast({
        title: isLiked.value ? '点赞成功' : '取消点赞',
        icon: 'none'
    })
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 120rpx;
}

/* 封面图片 */
.cover-section {
    width: 100%;
    height: 500rpx;
    position: relative;
}

.cover-image {
    width: 100%;
    height: 100%;
}

/* 标题区域 */
.detail-header {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    position: relative;
}

.type-badge {
    display: inline-block;
    padding: 8rpx 20rpx;
    font-size: 24rpx;
    border-radius: 30rpx;
    margin-bottom: 20rpx;

    &.type-student {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #f5576c;
    }

    &.type-teacher {
        background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
        color: #667eea;
    }

    &.type-organization {
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        color: #ff8a00;
    }
}

.detail-title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    line-height: 1.5;
    margin-bottom: 20rpx;
}

.detail-meta {
    display: flex;
    gap: 40rpx;
}

.meta-item {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
}

.meta-icon {
    margin-right: 8rpx;
}

/* 简介卡片 */
.intro-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.card-title {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
}

.title-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
}

.intro-text {
    font-size: 28rpx;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.95);
}

/* 详细内容 */
.content-section {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .title-icon {
        font-size: 32rpx;
        margin-right: 12rpx;
    }

    .title-text {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
    }
}

.rich-content {
    font-size: 28rpx;
    line-height: 1.8;
    color: #666;
}

/* 底部操作栏 */
.footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx;
    display: flex;
    gap: 20rpx;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.action-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    border: none;
    background: #f5f5f5;
    color: #666;

    &.btn-like {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: #fff;
        font-weight: bold;
    }
}

.btn-icon {
    margin-right: 8rpx;
    font-size: 32rpx;
}

.btn-text {
    font-size: 28rpx;
}
</style>

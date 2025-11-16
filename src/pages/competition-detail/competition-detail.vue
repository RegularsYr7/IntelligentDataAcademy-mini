<template>
    <view class="page">
        <view class="container">
            <!-- 标题区域 -->
            <view class="detail-header">
                <text class="detail-title">{{ competition.title }}</text>
                <view class="detail-meta">
                    <text class="meta-item">
                        <text class="meta-icon">🕒</text>
                        {{ competition.publishTime }}
                    </text>
                    <text class="meta-item">
                        <text class="meta-icon">👁</text>
                        {{ competition.views }} 次浏览
                    </text>
                </view>
            </view>

            <!-- 竞赛信息卡片 -->
            <view class="info-card">
                <view class="info-item">
                    <view class="info-label">
                        <text class="label-icon">📅</text>
                        <text class="label-text">报名区间</text>
                    </view>
                    <text class="info-value">{{ competition.registrationTime }}</text>
                </view>
                <view class="info-item">
                    <view class="info-label">
                        <text class="label-icon">⏰</text>
                        <text class="label-text">竞赛时间</text>
                    </view>
                    <text class="info-value">{{ competition.competitionTime }}</text>
                </view>
                <view class="info-item">
                    <view class="info-label">
                        <text class="label-icon">📍</text>
                        <text class="label-text">竞赛地点</text>
                    </view>
                    <text class="info-value">{{ competition.location }}</text>
                </view>
                <view class="info-item">
                    <view class="info-label">
                        <text class="label-icon">🏷️</text>
                        <text class="label-text">竞赛分类</text>
                    </view>
                    <text class="info-value category">{{ competition.category }}</text>
                </view>
            </view>

            <!-- 竞赛内容 (富文本) -->
            <view id="competition-poster" class="content-section">
                <view class="section-title">
                    <text class="title-icon">📄</text>
                    <text class="title-text">竞赛内容</text>
                </view>
                <view class="rich-content">
                    <rich-text :nodes="formattedContent"></rich-text>
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="footer-actions">
                <button class="action-btn btn-save-image" @tap="saveAsImage" :loading="generating">
                    <text class="btn-icon">📷</text>
                    <text class="btn-text">{{ generating ? '生成中...' : '保存为图片' }}</text>
                </button>
            </view>
        </view>

        <!-- Canvas 用于生成海报 -->
        <canvas canvas-id="posterCanvas"
            :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'fixed', left: '-9999px', top: '-9999px' }"></canvas>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { formatRichText } from '@/utils/richtext'

// 竞赛详情数据
const competition = ref({
    id: 0,
    title: '',
    publishTime: '',
    views: 0,
    registrationTime: '',
    competitionTime: '',
    location: '',
    category: '',
    content: ''
})

// 是否正在生成图片
const generating = ref(false)

// Canvas 尺寸
const canvasWidth = ref(750)
const canvasHeight = ref(1500)

// 系统信息
const systemInfo = ref({})

// 模拟数据
const competitionData = {
    1: {
        id: 1,
        title: '全国大学生数学建模竞赛',
        publishTime: '2025-08-25 10:30',
        views: 1234,
        registrationTime: '2025-09-01 至 2025-09-30',
        competitionTime: '2025-10-15 09:00',
        location: '线上答题 + 线下答辩',
        category: '学科竞赛',
        content: `
			<div style="line-height: 1.8; color: #333;">
				<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">竞赛简介</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					全国大学生数学建模竞赛是全国高校规模最大的基础性学科竞赛，也是世界上规模最大的数学建模竞赛。
					竞赛旨在激励学生学习数学的积极性，提高学生建立数学模型和运用计算机技术解决实际问题的综合能力。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">竞赛内容</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					本次竞赛分为A题和B题，参赛队伍需要在规定时间内完成以下任务：
				</p>
				<ul style="margin-bottom: 15px; padding-left: 20px;">
					<li style="margin-bottom: 10px;">阅读并理解竞赛题目</li>
					<li style="margin-bottom: 10px;">建立数学模型</li>
					<li style="margin-bottom: 10px;">编程实现算法</li>
					<li style="margin-bottom: 10px;">撰写竞赛论文</li>
					<li style="margin-bottom: 10px;">提交最终成果</li>
				</ul>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">参赛要求</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					1. 参赛队伍由3名在校本科生组成<br/>
					2. 可以使用各种图书资料、计算机和软件<br/>
					3. 可以在互联网上搜索资料，但不得与队外任何人讨论赛题<br/>
					4. 竞赛期间不得以任何方式与其他队伍交流
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">奖项设置</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					竞赛设置国家级一等奖、二等奖和省级一等奖、二等奖、三等奖。获奖比例根据参赛队伍数量确定。
					优秀获奖队伍还将获得推荐参加国际数学建模竞赛的机会。
				</p>
				
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">联系方式</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					如有疑问，请联系：<br/>
					联系人：张老师<br/>
					电话：138-0000-0000<br/>
					邮箱：mathmodel@university.edu.cn
				</p>
			</div>
		`
    },
    2: {
        id: 2,
        title: '互联网+大学生创新创业大赛',
        publishTime: '2025-08-10 15:20',
        views: 2345,
        registrationTime: '2025-08-15 至 2025-09-15',
        competitionTime: '2025-10-01 14:00',
        location: '大学生创新创业中心',
        category: '创新创业',
        content: `
			<div style="line-height: 1.8; color: #333;">
				<h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">大赛简介</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					"互联网+"大学生创新创业大赛是面向全国大学生的创新创业竞赛平台，旨在深化高等教育综合改革，
					激发大学生的创造力，培养造就"大众创业、万众创新"的生力军。
				</p>
				<h2 style="font-size: 18px; font-weight: bold; margin: 20px 0 15px;">参赛项目要求</h2>
				<p style="margin-bottom: 15px; text-indent: 2em;">
					项目需具有创新性、实践性和可行性，鼓励跨学科、跨专业组队参赛。
				</p>
			</div>
		`
    }
    // 其他竞赛数据...
}

// 格式化富文本内容
const formattedContent = computed(() => {
    return formatRichText(competition.value.content)
})

onLoad((options) => {
    const id = parseInt(options.id)
    if (competitionData[id]) {
        competition.value = competitionData[id]
        // 增加浏览次数
        competition.value.views++
    }
    console.log('竞赛详情页加载', id)

    // 获取系统信息
    systemInfo.value = uni.getSystemInfoSync()
    canvasWidth.value = systemInfo.value.windowWidth

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【竞赛详情页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    console.log('📍 接口1: 获取竞赛详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/competitions/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({ id: 1 }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            title: '全国大学生数据分析大赛',
            cover: 'https://example.com/cover.jpg',
            level: '国家级',
            category: '数据分析',
            registrationTime: '2025-09-01 至 2025-09-30',
            competitionTime: '2025-10-15 09:00',
            location: '线上答题 + 线下答辩',
            organizer: '教育部',
            prize: '一等奖10000元',
            participants: 1256,
            views: 5432,
            introduction: '详细介绍...',
            requirements: '参赛要求...',
            process: '赛程安排...',
            awards: '奖项设置...',
            contact: '联系方式...',
            content: '<html内容>',
            attachments: [
                {
                    name: '竞赛章程.pdf',
                    url: 'https://example.com/file.pdf',
                    size: '2.5MB'
                }
            ]
        }
    }, null, 2))
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 保存为图片
const saveAsImage = async () => {
    if (generating.value) return

    generating.value = true

    uni.showLoading({
        title: '生成图片中...',
        mask: true
    })

    try {
        // 获取页面容器信息
        const query = uni.createSelectorQuery()
        query.select('.container').boundingClientRect()
        query.select('.detail-header').boundingClientRect()
        query.select('.info-card').boundingClientRect()
        query.select('.content-section').boundingClientRect()

        query.exec(async (res) => {
            if (!res || res.length === 0) {
                uni.hideLoading()
                uni.showToast({
                    title: '获取页面信息失败',
                    icon: 'none'
                })
                generating.value = false
                return
            }

            const [containerRect, headerRect, infoRect, contentRect] = res

            // 第一次绘制：计算实际需要的高度
            const dpr = systemInfo.value.pixelRatio || 2
            const canvasW = containerRect.width

            // 创建临时canvas上下文来计算高度
            const tempCtx = uni.createCanvasContext('posterCanvas')

            let totalHeight = 0
            let currentY = 0

            // 计算标题区域高度
            if (headerRect) {
                totalHeight += 100 // 标题固定高度
                currentY = 100
            }

            currentY += 10 // 间距
            totalHeight += 10

            // 计算信息卡片高度
            if (infoRect) {
                totalHeight += 200 // 信息卡固定高度
                currentY += 200
            }

            currentY += 10 // 间距
            totalHeight += 10

            // 计算内容区域实际高度
            if (contentRect) {
                // 先用临时ctx测算内容高度
                const contentResult = calculateContentHeight(tempCtx, canvasW, currentY)
                totalHeight += contentResult.height
            }

            // 设置最终canvas高度
            const canvasH = totalHeight + 20 // 加底部边距
            canvasWidth.value = canvasW
            canvasHeight.value = canvasH

            // 创建正式canvas上下文
            const ctx = uni.createCanvasContext('posterCanvas')

            // 绘制背景
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(0, 0, canvasW, canvasH)

            currentY = 0

            // 绘制标题区域
            if (headerRect) {
                currentY = drawHeader(ctx, canvasW, currentY)
            }

            currentY += 10 // 间距

            // 绘制信息卡片
            if (infoRect) {
                currentY = drawInfoCard(ctx, canvasW, currentY)
            }

            currentY += 10 // 间距

            // 绘制内容区域（带白色背景）
            if (contentRect) {
                const contentResult = drawContent(ctx, canvasW, currentY)
                // 绘制内容区域的白色背景
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, currentY, canvasW, contentResult.height)
                // 重新绘制内容文字在背景上
                drawContent(ctx, canvasW, currentY)
            }

            // 绘制并保存
            ctx.draw(false, () => {
                setTimeout(() => {
                    uni.canvasToTempFilePath({
                        canvasId: 'posterCanvas',
                        destWidth: canvasW * dpr,
                        destHeight: canvasH * dpr,
                        success: (res) => {
                            uni.hideLoading()

                            // 保存到相册
                            uni.saveImageToPhotosAlbum({
                                filePath: res.tempFilePath,
                                success: () => {
                                    uni.showToast({
                                        title: '已保存到相册',
                                        icon: 'success'
                                    })
                                    generating.value = false
                                },
                                fail: (err) => {
                                    console.error('保存到相册失败:', err)
                                    if (err.errMsg.includes('auth')) {
                                        uni.showModal({
                                            title: '提示',
                                            content: '需要您授权保存图片到相册',
                                            success: (modalRes) => {
                                                if (modalRes.confirm) {
                                                    uni.openSetting()
                                                }
                                            }
                                        })
                                    } else {
                                        uni.showToast({
                                            title: '保存失败',
                                            icon: 'none'
                                        })
                                    }
                                    generating.value = false
                                }
                            })
                        },
                        fail: (err) => {
                            console.error('生成图片失败:', err)
                            uni.hideLoading()
                            uni.showToast({
                                title: '生成失败',
                                icon: 'none'
                            })
                            generating.value = false
                        }
                    })
                }, 500)
            })
        })
    } catch (error) {
        console.error('保存图片失败:', error)
        uni.hideLoading()
        uni.showToast({
            title: '保存失败',
            icon: 'none'
        })
        generating.value = false
    }
}

// 绘制标题区域
const drawHeader = (ctx, canvasW, startY) => {
    const padding = 15
    const titleFontSize = 18
    const metaFontSize = 12

    // 白色背景
    ctx.fillStyle = '#ffffff'
    const headerHeight = 100
    ctx.fillRect(0, startY, canvasW, headerHeight)

    // 标题
    ctx.fillStyle = '#333333'
    ctx.font = `bold ${titleFontSize}px sans-serif`
    ctx.fillText(competition.value.title, padding, startY + padding + titleFontSize)

    // 元信息
    ctx.fillStyle = '#999999'
    ctx.font = `${metaFontSize}px sans-serif`
    const metaY = startY + padding + titleFontSize + 20
    ctx.fillText(`🕒 ${competition.value.publishTime}`, padding, metaY)
    ctx.fillText(`👁 ${competition.value.views} 次浏览`, padding + 150, metaY)

    return startY + headerHeight
}

// 绘制信息卡片
const drawInfoCard = (ctx, canvasW, startY) => {
    const padding = 15
    const fontSize = 14
    const lineHeight = 40

    // 白色背景
    ctx.fillStyle = '#ffffff'
    const cardHeight = 200
    ctx.fillRect(0, startY, canvasW, cardHeight)

    let currentY = startY + padding + fontSize

    // 报名区间
    ctx.fillStyle = '#666666'
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillText('📅 报名区间', padding, currentY)
    ctx.fillStyle = '#333333'
    ctx.fillText(competition.value.registrationTime, padding + 100, currentY)
    currentY += lineHeight

    // 竞赛时间
    ctx.fillStyle = '#666666'
    ctx.fillText('⏰ 竞赛时间', padding, currentY)
    ctx.fillStyle = '#333333'
    ctx.fillText(competition.value.competitionTime, padding + 100, currentY)
    currentY += lineHeight

    // 竞赛地点
    ctx.fillStyle = '#666666'
    ctx.fillText('📍 竞赛地点', padding, currentY)
    ctx.fillStyle = '#333333'
    ctx.fillText(competition.value.location, padding + 100, currentY)
    currentY += lineHeight

    // 竞赛分类
    ctx.fillStyle = '#666666'
    ctx.fillText('🏷️ 竞赛分类', padding, currentY)
    ctx.fillStyle = '#667eea'
    ctx.fillText(competition.value.category, padding + 100, currentY)

    return startY + cardHeight
}

// 计算内容区域实际需要的高度
const calculateContentHeight = (ctx, canvasW, startY) => {
    const padding = 15
    const titleFontSize = 16
    const contentFontSize = 12
    const lineHeight = 20

    let currentY = startY + padding + titleFontSize + 30

    // 简单解析HTML内容
    const contentText = competition.value.content
        .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n【$1】\n')
        .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
        .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()

    ctx.fillStyle = '#666666'
    ctx.font = `${contentFontSize}px sans-serif`

    const lines = contentText.split('\n')
    const maxWidth = canvasW - padding * 2

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) {
            currentY += lineHeight / 2
            continue
        }

        if (line.startsWith('【') && line.endsWith('】')) {
            currentY += lineHeight + 5
            continue
        }

        // 计算自动换行的行数
        const chars = line.split('')
        let currentLine = ''
        for (let j = 0; j < chars.length; j++) {
            const testLine = currentLine + chars[j]
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && currentLine) {
                currentY += lineHeight
                currentLine = chars[j]
            } else {
                currentLine = testLine
            }
        }
        if (currentLine) {
            currentY += lineHeight
        }
    }

    const actualHeight = currentY - startY + padding
    return { endY: currentY + padding, height: actualHeight }
}

// 绘制内容区域（返回实际绘制的高度）
const drawContent = (ctx, canvasW, startY) => {
    const padding = 15
    const titleFontSize = 16
    const contentFontSize = 12
    const lineHeight = 20

    // 标题
    ctx.fillStyle = '#333333'
    ctx.font = `bold ${titleFontSize}px sans-serif`
    ctx.fillText('📄 竞赛内容', padding, startY + padding + titleFontSize)

    // 绘制富文本内容
    let currentY = startY + padding + titleFontSize + 30

    // 简单解析HTML内容并绘制
    const contentText = competition.value.content
        .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n【$1】\n')
        .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n')
        .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim()

    ctx.fillStyle = '#666666'
    ctx.font = `${contentFontSize}px sans-serif`

    // 分行绘制
    const lines = contentText.split('\n')
    const maxWidth = canvasW - padding * 2

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) {
            currentY += lineHeight / 2
            continue
        }

        // 如果是标题（包含【】）
        if (line.startsWith('【') && line.endsWith('】')) {
            ctx.fillStyle = '#333333'
            ctx.font = `bold ${contentFontSize + 2}px sans-serif`
            ctx.fillText(line, padding, currentY)
            ctx.font = `${contentFontSize}px sans-serif`
            ctx.fillStyle = '#666666'
            currentY += lineHeight + 5
            continue
        }

        // 自动换行
        const chars = line.split('')
        let currentLine = ''
        for (let j = 0; j < chars.length; j++) {
            const testLine = currentLine + chars[j]
            const metrics = ctx.measureText(testLine)
            if (metrics.width > maxWidth && currentLine) {
                ctx.fillText(currentLine, padding, currentY)
                currentY += lineHeight
                currentLine = chars[j]
            } else {
                currentLine = testLine
            }
        }
        if (currentLine) {
            ctx.fillText(currentLine, padding, currentY)
            currentY += lineHeight
        }
    }

    // 返回实际使用的高度
    const actualHeight = currentY - startY + padding
    return { endY: currentY + padding, height: actualHeight }
}

// 返回上一页
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

/* 标题区域 */
.detail-header {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
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

/* 竞赛信息卡片 */
.info-card {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }
}

.info-label {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: 40rpx;
}

.label-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.label-text {
    font-size: 28rpx;
    color: #666;
}

.info-value {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    text-align: right;

    &.category {
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        text-align: center;
    }
}

/* 竞赛内容 */
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
}

.title-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.title-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
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

    &.btn-save-image {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

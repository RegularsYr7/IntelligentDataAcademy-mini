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
import { getCompetitionDetail } from '@/api/competition'

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

// 竞赛分类映射
const competitionCategoryMap = {
    '1': '学科竞赛',
    '2': '技能竞赛',
    '3': '创新创业',
    '4': '文化艺术',
    '5': '体育竞技'
}

// 竞赛级别映射
const competitionLevelMap = {
    '1': '国家级',
    '2': '省级',
    '3': '市级',
    '4': '校级',
    '5': '院级'
}

// 加载竞赛详情
const loadCompetitionDetail = async (id) => {
    try {
        const res = await getCompetitionDetail(id)
        console.log('竞赛详情API响应:', res)

        // 兼容多种响应格式
        let item = null
        if (res && res.data) {
            item = res.data
        } else if (res) {
            item = res
        }

        if (item && item.competitionId) {
            console.log('开始映射数据:', item)

            // 格式化时间范围
            const formatTimeRange = (startTime, endTime) => {
                if (!startTime || !endTime) return '暂无'
                return `${startTime} 至 ${endTime}`
            }

            // 数据映射
            competition.value = {
                id: item.competitionId,
                title: item.competitionName || '未命名竞赛',
                publishTime: item.createTime || '',
                views: item.viewCount || 0,
                registrationTime: formatTimeRange(item.registrationStartTime, item.registrationEndTime),
                competitionTime: item.competitionStartTime || '待定',
                location: item.competitionLocation || item.onlineLocation || '待定',
                category: competitionCategoryMap[item.competitionCategory] || '其他',
                level: competitionLevelMap[item.competitionLevel] || '',
                organizer: item.organizer || '',
                content: item.competitionContent || '<p>暂无竞赛内容</p>',
                rules: item.competitionRules || '',
                awardInfo: item.awardInfo || '',
                maxParticipants: item.maxParticipants || 0,
                currentParticipants: item.currentParticipants || 0,
                registrationFee: item.registrationFee || 0,
                contactPerson: item.contactPerson || '',
                contactPhone: item.contactPhone || '',
                contactEmail: item.contactEmail || ''
            }

            console.log('映射后的数据:', competition.value)
        } else {
            console.error('未获取到有效数据')
            uni.showToast({
                title: '数据格式错误',
                icon: 'none'
            })
        }
    } catch (error) {
        console.error('加载竞赛详情失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    }
}

// 格式化富文本内容
const formattedContent = computed(() => {
    return formatRichText(competition.value.content)
})

onLoad(async (options) => {
    console.log('=== 竞赛详情页面加载 ===')
    console.log('接收到的参数:', options)

    const id = parseInt(options.id)
    console.log('解析的竞赛ID:', id)

    // 调用API加载详情
    await loadCompetitionDetail(id)

    // 获取系统信息
    systemInfo.value = uni.getSystemInfoSync()
    canvasWidth.value = systemInfo.value.windowWidth

    console.log('=== 页面初始化完成 ===')
})


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
        background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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

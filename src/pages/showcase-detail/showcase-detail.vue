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
import { getShowcaseDetail } from '@/api/showcase'
import { formatRichText } from '@/utils/richtext'

// 加载状态
const loading = ref(false)

// 是否正在生成图片
const generating = ref(false)

// Canvas 尺寸
const canvasWidth = ref(750)
const canvasHeight = ref(1000)

// 系统信息
const systemInfo = ref({})

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

// 加载详情数据
const loadDetail = async (id) => {
    if (!id) {
        uni.showToast({
            title: '参数错误',
            icon: 'none'
        })
        return
    }

    try {
        loading.value = true

        console.log('正在加载风采详情, ID:', id)
        const res = await getShowcaseDetail(id)

        console.log('='.repeat(80))
        console.log('【风采详情接口返回数据】')
        console.log('='.repeat(80))
        console.log(JSON.stringify(res, null, 2))
        console.log('='.repeat(80))

        // 数据适配 (后端 -> 前端)
        if (res) {
            showcase.value = {
                id: res.showcaseId,
                title: res.showcaseName || '',
                type: res.showcaseType || '',
                coverImage: res.coverImageUrl || 'https://picsum.photos/750/500?random=' + res.showcaseId,
                introduction: res.introduction || '',
                publishTime: formatDate(res.displayTime),
                views: res.viewCount || 0,
                likes: res.likeCount || 0,
                content: res.detailContent || res.displayInfo || '',
                // 额外信息
                awardTime: res.awardTime ? formatDate(res.awardTime) : '',
                awardLevel: res.awardLevel || '',
                awardOrganization: res.awardOrganization || '',
                imageUrls: res.imageUrls ? res.imageUrls.split(',') : [],
                videoUrl: res.videoUrl || '',
                isRecommended: res.isRecommended === 'Y'
            }
        }

    } catch (error) {
        console.error('加载详情失败:', error)
        uni.showToast({
            title: '加载失败',
            icon: 'none'
        })
    } finally {
        loading.value = false
    }
}



// 格式化日期 (yyyy-MM-dd 或 yyyy-MM-dd HH:mm:ss -> yyyy-MM-dd)
const formatDate = (dateStr) => {
    if (!dateStr) return ''
    // 如果已经是 yyyy-MM-dd 格式,直接返回
    if (dateStr.length === 10) return dateStr
    // 如果是完整时间格式,截取日期部分
    return dateStr.split(' ')[0]
}

// 获取类型名称
const getTypeName = (type) => {
    const typeMap = {
        '1': '优秀学生',
        '2': '优秀教师',
        '3': '优秀组织',
        'student': '优秀学生',
        'teacher': '优秀教师',
        'organization': '优秀组织'
    }
    return typeMap[type] || ''
}

// 获取类型样式类
const getTypeClass = (type) => {
    // 将数字类型转换为英文类型
    const typeClassMap = {
        '1': 'type-student',
        '2': 'type-teacher',
        '3': 'type-organization',
        'student': 'type-student',
        'teacher': 'type-teacher',
        'organization': 'type-organization'
    }
    return typeClassMap[type] || ''
}

// 格式化富文本内容
const formattedContent = computed(() => {
    return formatRichText(showcase.value.content)
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
        query.select('.intro-card').boundingClientRect()
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

            const [containerRect, headerRect, introRect, contentRect] = res

            // 计算canvas高度
            const dpr = systemInfo.value.pixelRatio || 2
            const canvasW = containerRect.width

            let totalHeight = 0
            let currentY = 0

            // 封面图片高度
            const coverHeight = 250
            totalHeight += coverHeight
            currentY = coverHeight

            currentY += 10
            totalHeight += 10

            // 标题区域高度
            if (headerRect) {
                totalHeight += 100
                currentY += 100
            }

            currentY += 10
            totalHeight += 10

            // 简介卡片高度
            if (introRect && showcase.value.introduction) {
                totalHeight += 150
                currentY += 150
            }

            currentY += 10
            totalHeight += 10

            // 内容区域高度
            if (contentRect) {
                const tempCtx = uni.createCanvasContext('posterCanvas')
                const contentResult = calculateContentHeight(tempCtx, canvasW, currentY)
                totalHeight += contentResult.height
            }

            const canvasH = totalHeight + 20
            canvasWidth.value = canvasW
            canvasHeight.value = canvasH

            // 创建canvas上下文
            const ctx = uni.createCanvasContext('posterCanvas')

            // 绘制背景
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(0, 0, canvasW, canvasH)

            currentY = 0

            // 绘制封面图片
            try {
                await drawCoverImage(ctx, canvasW, currentY, coverHeight)
                currentY += coverHeight
            } catch (error) {
                console.error('绘制封面失败:', error)
                currentY += coverHeight
            }

            currentY += 10

            // 绘制标题区域
            if (headerRect) {
                currentY = drawHeader(ctx, canvasW, currentY)
            }

            currentY += 10

            // 绘制简介卡片
            if (introRect && showcase.value.introduction) {
                currentY = drawIntroCard(ctx, canvasW, currentY)
            }

            currentY += 10

            // 绘制内容区域
            if (contentRect) {
                const contentResult = drawContent(ctx, canvasW, currentY)
                // 绘制白色背景
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(0, currentY, canvasW, contentResult.height)
                // 重新绘制内容
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

// 绘制封面图片
const drawCoverImage = (ctx, canvasW, startY, coverHeight) => {
    return new Promise((resolve, reject) => {
        if (!showcase.value.coverImage) {
            resolve()
            return
        }

        // 先绘制一个占位背景
        ctx.fillStyle = '#e0e0e0'
        ctx.fillRect(0, startY, canvasW, coverHeight)

        // 获取图片信息并绘制
        uni.getImageInfo({
            src: showcase.value.coverImage,
            success: (imageInfo) => {
                try {
                    // 计算图片缩放比例以填充封面区域
                    const imgWidth = imageInfo.width
                    const imgHeight = imageInfo.height
                    const imgRatio = imgWidth / imgHeight
                    const coverRatio = canvasW / coverHeight

                    let drawWidth, drawHeight, drawX, drawY

                    if (imgRatio > coverRatio) {
                        // 图片更宽,按高度缩放
                        drawHeight = coverHeight
                        drawWidth = imgHeight * imgRatio
                        drawX = -(drawWidth - canvasW) / 2
                        drawY = startY
                    } else {
                        // 图片更高,按宽度缩放
                        drawWidth = canvasW
                        drawHeight = imgWidth / imgRatio
                        drawX = 0
                        drawY = startY - (drawHeight - coverHeight) / 2
                    }

                    // 绘制图片
                    ctx.drawImage(imageInfo.path, drawX, drawY, drawWidth, drawHeight)
                    resolve()
                } catch (error) {
                    console.error('绘制封面图片错误:', error)
                    resolve()
                }
            },
            fail: (err) => {
                console.error('获取封面图片失败:', err)
                resolve() // 即使失败也继续绘制其他内容
            }
        })
    })
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

    // 类型标签
    ctx.fillStyle = '#667eea'
    ctx.font = `bold ${12}px sans-serif`
    ctx.fillText(getTypeName(showcase.value.type), padding, startY + padding + 12)

    // 标题
    ctx.fillStyle = '#333333'
    ctx.font = `bold ${titleFontSize}px sans-serif`
    ctx.fillText(showcase.value.title, padding, startY + padding + 40)

    // 元信息
    ctx.fillStyle = '#999999'
    ctx.font = `${metaFontSize}px sans-serif`
    const metaY = startY + padding + 70
    ctx.fillText(`🕒 ${showcase.value.publishTime}`, padding, metaY)
    ctx.fillText(`👁 ${showcase.value.views} 次浏览`, padding + 150, metaY)

    return startY + headerHeight
}

// 绘制简介卡片
const drawIntroCard = (ctx, canvasW, startY) => {
    const padding = 15
    const fontSize = 14
    const lineHeight = 20

    // 渐变背景 (简化为单色)
    ctx.fillStyle = '#667eea'
    const cardHeight = 150
    ctx.fillRect(0, startY, canvasW, cardHeight)

    // 标题
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${16}px sans-serif`
    ctx.fillText('💡 简介', padding, startY + padding + 16)

    // 简介文本
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.font = `${fontSize}px sans-serif`

    // 简单文本换行处理
    const introText = showcase.value.introduction
    const maxWidth = canvasW - padding * 2
    let currentY = startY + padding + 50

    const chars = introText.split('')
    let currentLine = ''

    for (let i = 0; i < chars.length; i++) {
        const testLine = currentLine + chars[i]
        const metrics = ctx.measureText(testLine)

        if (metrics.width > maxWidth && currentLine) {
            ctx.fillText(currentLine, padding, currentY)
            currentY += lineHeight
            currentLine = chars[i]
        } else {
            currentLine = testLine
        }
    }

    if (currentLine) {
        ctx.fillText(currentLine, padding, currentY)
    }

    return startY + cardHeight
}

// 计算内容区域高度
const calculateContentHeight = (ctx, canvasW, startY) => {
    const padding = 15
    const titleFontSize = 16
    const contentFontSize = 12
    const lineHeight = 20

    let currentY = startY + padding + titleFontSize + 30

    // 解析HTML内容
    const contentText = showcase.value.content
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

        // 计算自动换行
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

// 绘制内容区域
const drawContent = (ctx, canvasW, startY) => {
    const padding = 15
    const titleFontSize = 16
    const contentFontSize = 12
    const lineHeight = 20

    // 标题
    ctx.fillStyle = '#333333'
    ctx.font = `bold ${titleFontSize}px sans-serif`
    ctx.fillText('📝 详细介绍', padding, startY + padding + titleFontSize)

    let currentY = startY + padding + titleFontSize + 30

    // 解析HTML内容并绘制
    const contentText = showcase.value.content
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

        // 标题样式
        if (line.startsWith('【') && line.endsWith('】')) {
            ctx.fillStyle = '#333333'
            ctx.font = `bold ${14}px sans-serif`
            ctx.fillText(line, padding, currentY)
            currentY += lineHeight + 5
            ctx.fillStyle = '#666666'
            ctx.font = `${contentFontSize}px sans-serif`
            continue
        }

        // 自动换行绘制
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

    const actualHeight = currentY - startY + padding
    return { endY: currentY + padding, height: actualHeight }
}

onLoad((options) => {
    const id = options.id
    if (id) {
        loadDetail(id)
    } else {
        uni.showToast({
            title: '缺少必要参数',
            icon: 'none'
        })
    }

    // 获取系统信息
    systemInfo.value = uni.getSystemInfoSync()
    canvasWidth.value = systemInfo.value.windowWidth
})

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
    background: linear-gradient(135deg, #4b6cb7 0%, #182848 100%);
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

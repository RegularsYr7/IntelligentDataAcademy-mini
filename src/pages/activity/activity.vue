<template>
    <view class="page">
        <view class="activity-container">
            <!-- 搜索框 -->
            <view class="search-section">
                <view class="search-box">
                    <text class="search-icon">🔍</text>
                    <input class="search-input" v-model="searchKeyword" placeholder="搜索活动名称" @confirm="onSearch" />
                    <text class="clear-icon" v-if="searchKeyword" @tap="onClear">×</text>
                </view>
            </view>

            <!-- 活动分类 -->
            <view class="category-section">
                <scroll-view class="category-scroll" scroll-x>
                    <view class="category-list">
                        <view class="category-item" v-for="(item, index) in categoryList" :key="index"
                            :class="{ active: currentCategory === index }" @tap="onCategoryChange(index)">
                            <text class="category-text">{{ item.name }}</text>
                        </view>
                    </view>
                </scroll-view>
            </view>

            <!-- 使用通用列表组件 -->
            <view class="list-wrapper">
                <RefreshLoadList ref="listRef" :api="getActivityList" :params="requestParams"
                    :dataMapping="mapActivityData" :pageSize="20" emptyIcon="📭" emptyText="暂无活动">

                    <!-- 自定义列表项样式 (两列网格布局) -->
                    <template #default="{ items }">
                        <view class="activity-grid">
                            <view class="activity-card" v-for="item in items" :key="item.id" @tap="viewActivity(item)">
                                <view class="card-image-wrapper">
                                    <image class="card-image" :src="item.image" mode="aspectFill"></image>
                                    <!-- 积分和状态标签 -->
                                    <view class="overlay-badges">
                                        <view class="points-badge">
                                            <text class="points-icon">⭐</text>
                                            <text class="points-text">{{ item.points }}</text>
                                        </view>
                                        <view class="status-badge" :class="'status-' + item.status">
                                            {{ getStatusText(item.status) }}
                                        </view>
                                    </view>
                                </view>
                                <view class="card-content">
                                    <view class="card-header">
                                        <text class="activity-name">{{ item.title }}</text>
                                    </view>
                                    <view class="activity-time-range">
                                        <text class="time-icon">🕒</text>
                                        <text class="time-text">{{ item.startTime }} - {{ item.endTime }}</text>
                                    </view>
                                    <view class="card-tags">
                                        <view class="tag type-tag" :class="'type-' + item.type">
                                            {{ getTypeText(item.type) }}
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </template>
                </RefreshLoadList>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getActivityList, getActivityTypesMap } from '@/api/activity'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'

// 列表组件引用
const listRef = ref(null)

// 搜索关键词
const searchKeyword = ref('')

// 当前分类
const currentCategory = ref(0)

// 分类列表
const categoryList = ref([
    { id: '', name: '全部' }
])

// 计算请求参数
const requestParams = computed(() => {
    const params = {}

    // 添加分类筛选 (注意:后端参数名是 type,不是 activityType)
    if (currentCategory.value > 0) {
        params.type = categoryList.value[currentCategory.value].id
    }

    // 添加搜索关键词
    if (searchKeyword.value.trim()) {
        params.activityName = searchKeyword.value.trim()
    }

    console.log('requestParams 变化:', params)
    return params
})

// 数据映射函数(后端 -> 前端)
const mapActivityData = (item) => {
    return {
        id: item.activityId,
        title: item.activityName,
        image: item.coverImage || 'https://picsum.photos/300/200?random=' + item.activityId,
        type: item.activityType,
        status: getActivityStatusByCode(item.activityStatus),
        startTime: formatDateTime(item.activityStartTime),
        endTime: formatDateTime(item.activityEndTime),
        points: item.points || item.favoriteCount || 10,
        category: item.activityType,
        location: item.location || item.activityLocation,
        organization: item.organizationName || '',
        participants: item.enrolledCount || item.participantCount || 0,
        maxParticipants: item.maxParticipants || 100,
        description: item.description || item.activityDescription || '',
        isTop: item.isTop === 'Y'
    }
}

// 加载活动分类
const loadActivityTypes = async () => {
    try {
        const data = await getActivityTypesMap()

        if (data && Array.isArray(data)) {
            // data 是数组格式 [{label: "学术讲座", value: "1"}, ...]
            const types = data.map(item => ({
                id: item.value,
                name: item.label
            }))

            categoryList.value = [
                { id: '', name: '全部' },
                ...types
            ]
        }
    } catch (error) {
        console.error('加载活动类型失败:', error)
    }
}

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''

    // 兼容 iOS: 将 "yyyy-MM-dd HH:mm:ss" 格式转换为 "yyyy-MM-ddTHH:mm:ss"
    const formattedStr = dateTimeStr.replace(' ', 'T')
    const date = new Date(formattedStr)

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        return dateTimeStr // 返回原始字符串
    }

    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')

    return `${month}-${day < 10 ? '0' + day : day} ${hour}:${minute}`
}

// 根据状态码获取活动状态
const getActivityStatusByCode = (statusCode) => {
    const statusMap = {
        '0': 'recruiting',  // 报名中
        '1': 'ongoing',     // 进行中
        '2': 'finished'     // 已结束
    }
    return statusMap[statusCode] || 'recruiting'
}

// 获取类型文本
const getTypeText = (type) => {
    // type 是后端返回的值，如 "1", "2", "3", "4"
    // 需要从 categoryList 中查找对应的名称
    const category = categoryList.value.find(cat => cat.id === type)
    if (category) {
        return category.name
    }

    // 备用映射（如果分类还未加载）
    const typeMap = {
        '1': '学术讲座',
        '2': '文体活动',
        '3': '志愿服务',
        '4': '社团活动'
    }
    return typeMap[type] || type
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'recruiting': '报名中',
        'ongoing': '进行中',
        'finished': '已结束'
    }
    return statusMap[status] || ''
}

// 搜索
const onSearch = () => {
    // 触发参数变化,组件会自动重新加载
    listRef.value?.reload()
}

// 清空搜索
const onClear = () => {
    searchKeyword.value = ''
    listRef.value?.reload()
}

// 切换分类
const onCategoryChange = (index) => {
    currentCategory.value = index
    // requestParams 变化会自动触发组件重新加载
}

// 查看活动详情
const viewActivity = (activity) => {
    uni.navigateTo({
        url: `/pages/activity-detail/activity-detail?id=${activity.id}`
    })
}

onLoad(() => {
    // 加载活动分类
    loadActivityTypes()
})

onShow(() => {
    // 从详情页返回时刷新列表
    if (listRef.value) {
        listRef.value.reload()
    }
})

</script>

<style scoped lang="scss">
.page {
    height: 100vh;
    overflow: hidden;
}

.activity-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
}

/* 搜索框 */
.search-section {
    flex-shrink: 0;
    background: #fff;
    padding: 20rpx;
}

/* 列表容器 */
.list-wrapper {
    flex: 1;
    overflow: hidden;
}

.search-box {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 50rpx;
    padding: 0 24rpx;
    height: 70rpx;
}

.search-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
    color: #999;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
    height: 70rpx;
}

.clear-icon {
    font-size: 48rpx;
    color: #999;
    font-weight: 300;
    padding: 0 8rpx;
}

/* 分类标签 */
.category-section {
    flex-shrink: 0;
    background: #fff;
    padding: 0 20rpx 20rpx;
    margin-bottom: 20rpx;
}

.category-scroll {
    white-space: nowrap;
}

.category-list {
    display: inline-flex;
    gap: 20rpx;
}

.category-item {
    display: inline-block;
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    background: #f5f5f5;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .category-text {
            color: #fff;
        }
    }
}

.category-text {
    font-size: 28rpx;
    color: #666;
    font-weight: bold;
    white-space: nowrap;
}

/* 活动网格 (两列) */
.activity-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    padding: 0 20rpx 20rpx 20rpx;
}

.activity-card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-image-wrapper {
    position: relative;
    width: 100%;
    height: 200rpx;
}

.card-image {
    width: 100%;
    height: 100%;
}

.overlay-badges {
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.points-badge {
    display: flex;
    align-items: center;
    gap: 4rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
}

.points-icon {
    font-size: 20rpx;
}

.points-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: bold;
}

.status-badge {
    padding: 6rpx 12rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
    font-weight: bold;
    text-align: center;

    &.status-recruiting {
        background: rgba(82, 196, 26, 0.9);
        color: #fff;
    }

    &.status-ongoing {
        background: rgba(102, 126, 234, 0.9);
        color: #fff;
    }

    &.status-finished {
        background: rgba(153, 153, 153, 0.9);
        color: #fff;
    }
}

.card-content {
    padding: 20rpx;
}

.card-header {
    margin-bottom: 12rpx;
}

.activity-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
}

.activity-time-range {
    display: flex;
    align-items: center;
    gap: 6rpx;
    margin-bottom: 12rpx;
}

.time-icon {
    font-size: 20rpx;
}

.time-text {
    font-size: 22rpx;
    color: #999;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-tags {
    display: flex;
    gap: 8rpx;
    margin-bottom: 12rpx;
}

.tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-size: 20rpx;
}

.type-tag {

    // 1: 学术讲座
    &.type-1 {
        background: rgba(102, 126, 234, 0.1);
        color: #667eea;
    }

    // 2: 文体活动
    &.type-2 {
        background: rgba(250, 173, 20, 0.1);
        color: #faad14;
    }

    // 3: 志愿服务
    &.type-3 {
        background: rgba(82, 196, 26, 0.1);
        color: #52c41a;
    }

    // 4: 社团活动
    &.type-4 {
        background: rgba(245, 87, 108, 0.1);
        color: #f5576c;
    }
}
</style>

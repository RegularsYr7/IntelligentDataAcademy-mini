<template>
    <view class="page">
        <view class="campus-nav-container">

            <!-- 地图容器 -->
            <map id="campusMap" class="map-container" :longitude="mapCenter.longitude" :latitude="mapCenter.latitude"
                :scale="mapScale" :markers="markers" :show-location="true" @markertap="onMarkerTap"
                @regionchange="onRegionChange" @tap="onMapTap">
                <!-- 定位按钮 -->
                <cover-view class="map-controls">
                    <!-- 地点列表按钮 -->
                    <cover-view class="control-btn list-btn" @tap="togglePanel">
                        <cover-view class="btn-text">{{ isPanelExpanded ? '✕' : '📍' }}</cover-view>
                    </cover-view>
                </cover-view>
            </map>

            <!-- 底部地点列表弹出层 -->
            <view class="location-panel-modal" v-if="isPanelExpanded" @tap="closePanel">
                <view class="panel-content" :class="{ 'first-open': isFirstOpen }" @tap.stop>
                    <view class="panel-header">
                        <text class="panel-title">校园地点</text>
                        <view class="close-btn" @tap="closePanel">
                            <text class="close-icon">✕</text>
                        </view>
                    </view>

                    <!-- 搜索栏 -->
                    <view class="search-bar">
                        <view class="search-box">
                            <text class="search-icon">🔍</text>
                            <input class="search-input" placeholder="搜索教学楼、宿舍楼、快递站..." v-model="searchKeyword"
                                @input="onSearch" @confirm="onSearchConfirm" />
                            <text class="clear-icon" v-if="searchKeyword" @tap="clearSearch">✕</text>
                        </view>
                    </view>

                    <!-- 搜索结果列表 -->
                    <view class="search-results" v-if="searchKeyword && filteredLocations.length > 0">
                        <view class="result-item" v-for="(location, index) in filteredLocations" :key="index"
                            @tap="selectLocationAndClose(location)">
                            <text class="result-icon">{{ location.icon }}</text>
                            <view class="result-info">
                                <text class="result-name">{{ location.name }}</text>
                                <text class="result-desc">{{ location.description }}</text>
                            </view>
                            <view class="result-nav-btn" @tap.stop="navigateToLocation(location)">
                                <text class="result-nav-text">导航</text>
                            </view>
                        </view>
                    </view>

                    <!-- 无结果提示 -->
                    <view class="no-results" v-if="searchKeyword && filteredLocations.length === 0">
                        <text class="no-results-text">未找到相关地点</text>
                    </view>

                    <!-- 内容区域 -->
                    <view class="panel-body" v-if="!searchKeyword">
                        <!-- 分类标签 -->
                        <scroll-view class="category-tabs" scroll-x>
                            <view class="category-tab" v-for="(category, index) in categories" :key="index"
                                :class="{ active: currentCategory === category.value }"
                                @tap="switchCategory(category.value)">
                                <text class="tab-text">{{ category.icon }} {{ category.label }}</text>
                            </view>
                        </scroll-view>

                        <!-- 地点列表 -->
                        <scroll-view class="location-list" scroll-y>
                            <view class="location-items">
                                <view class="location-item" v-for="(location, index) in displayLocations" :key="index"
                                    @tap="selectLocationAndClose(location)">
                                    <view class="location-icon">{{ location.icon }}</view>
                                    <view class="location-info">
                                        <text class="location-name">{{ location.name }}</text>
                                        <text class="location-desc">{{ location.description }}</text>
                                    </view>
                                    <view class="nav-btn" @tap.stop="navigateToLocation(location)">
                                        <text class="nav-text">导航</text>
                                    </view>
                                </view>
                            </view>
                        </scroll-view>
                    </view>
                </view>
            </view>

            <!-- 选中地点详情弹窗 -->
            <view class="location-detail-modal" v-if="selectedLocation" @tap="closeDetail">
                <view class="modal-content" @tap.stop>
                    <view class="detail-header">
                        <text class="detail-icon">{{ selectedLocation.icon }}</text>
                        <view class="detail-info">
                            <text class="detail-name">{{ selectedLocation.name }}</text>
                            <text class="detail-desc">{{ selectedLocation.description }}</text>
                        </view>
                        <view class="close-btn" @tap="closeDetail">
                            <text class="close-icon">✕</text>
                        </view>
                    </view>

                    <view class="detail-body">
                        <view class="detail-item" v-if="selectedLocation.openTime">
                            <text class="item-label">开放时间</text>
                            <text class="item-value">{{ selectedLocation.openTime }}</text>
                        </view>
                        <view class="detail-item" v-if="selectedLocation.phone">
                            <text class="item-label">联系电话</text>
                            <text class="item-value">{{ selectedLocation.phone }}</text>
                        </view>
                        <view class="detail-item" v-if="selectedLocation.features">
                            <text class="item-label">设施特色</text>
                            <text class="item-value">{{ selectedLocation.features }}</text>
                        </view>
                    </view>

                    <view class="detail-actions">
                        <view class="action-btn primary-btn" @tap="navigateToLocation(selectedLocation)">
                            <text class="btn-icon">🧭</text>
                            <text class="btn-text">步行导航</text>
                        </view>
                        <view class="action-btn secondary-btn" @tap="shareLocation(selectedLocation)">
                            <text class="btn-icon">📤</text>
                            <text class="btn-text">分享位置</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'

const searchKeyword = ref('')
const isPanelExpanded = ref(true) // 默认展开弹出层
const currentCategory = ref('all')
const selectedLocation = ref(null)
const mapScale = ref(18) // 提高初始缩放级别到18,更精确显示建筑物
const userLocation = ref(null) // 用户当前位置
const isFirstOpen = ref(true) // 是否首次打开弹出层

// 成都文理学院中心坐标
const schoolCenter = {
    longitude: 104.464508,
    latitude: 30.845427
}

const mapCenter = ref({ ...schoolCenter })

// 地点分类
const categories = ref([
    { label: '全部', value: 'all', icon: '📍' },
    { label: '教学楼', value: 'teaching', icon: '🏫' },
    { label: '宿舍楼', value: 'dormitory', icon: '🏠' },
    { label: '生活服务', value: 'service', icon: '🏪' },
    { label: '运动场所', value: 'sports', icon: '⚽' }
])

// 校园地点数据（基于成都文理学院实际位置,使用更精确的坐标偏移）
const locations = ref([
    // 教学楼
    {
        id: 1,
        name: '教学楼A栋',
        description: '主要教学楼，1-6层',
        category: 'teaching',
        icon: '🏫',
        longitude: 104.464108, // 向西偏移约30米
        latitude: 30.845527,   // 向北偏移约10米
        openTime: '周一至周日 7:00-22:00',
        features: '多媒体教室、实验室、自习室'
    },
    {
        id: 2,
        name: '教学楼B栋',
        description: '综合教学楼，1-5层',
        category: 'teaching',
        icon: '🏫',
        longitude: 104.464908, // 向东偏移约30米
        latitude: 30.845527,   // 向北偏移约10米
        openTime: '周一至周日 7:00-22:00',
        features: '阶梯教室、实验室、办公室'
    },
    {
        id: 3,
        name: '教学楼C栋',
        description: '专业教学楼，1-4层',
        category: 'teaching',
        icon: '🏫',
        longitude: 104.463908, // 向西偏移约45米
        latitude: 30.845127,   // 向南偏移约30米
        openTime: '周一至周日 7:00-22:00',
        features: '计算机房、语音室、画室'
    },
    {
        id: 4,
        name: '图书馆',
        description: '综合图书馆，藏书丰富',
        category: 'teaching',
        icon: '📚',
        longitude: 104.464508, // 学校中心位置
        latitude: 30.845927,   // 向北偏移约50米
        openTime: '周一至周日 8:00-22:00',
        features: '自习室、电子阅览室、藏书区',
        phone: '028-12345678'
    },
    {
        id: 5,
        name: '实验中心',
        description: '科研实验中心',
        category: 'teaching',
        icon: '🔬',
        longitude: 104.465108, // 向东偏移约45米
        latitude: 30.845427,   // 中心纬度
        openTime: '周一至周五 8:00-18:00',
        features: '物理实验室、化学实验室、生物实验室'
    },

    // 宿舍楼
    {
        id: 6,
        name: '学生公寓1号楼',
        description: '男生宿舍，6人间',
        category: 'dormitory',
        icon: '🏠',
        longitude: 104.463708, // 向西偏移约60米
        latitude: 30.844927,   // 向南偏移约50米
        openTime: '全天开放',
        features: '独立卫浴、空调、热水'
    },
    {
        id: 7,
        name: '学生公寓2号楼',
        description: '男生宿舍，4人间',
        category: 'dormitory',
        icon: '🏠',
        longitude: 104.464008, // 向西偏移约38米
        latitude: 30.844927,   // 向南偏移约50米
        openTime: '全天开放',
        features: '独立卫浴、空调、热水、阳台'
    },
    {
        id: 8,
        name: '学生公寓3号楼',
        description: '女生宿舍，6人间',
        category: 'dormitory',
        icon: '🏠',
        longitude: 104.464308, // 向西偏移约15米
        latitude: 30.844927,   // 向南偏移约50米
        openTime: '全天开放',
        features: '独立卫浴、空调、热水'
    },
    {
        id: 9,
        name: '学生公寓4号楼',
        description: '女生宿舍，4人间',
        category: 'dormitory',
        icon: '🏠',
        longitude: 104.464608, // 向东偏移约8米
        latitude: 30.844927,   // 向南偏移约50米
        openTime: '全天开放',
        features: '独立卫浴、空调、热水、书桌'
    },

    // 生活服务
    {
        id: 10,
        name: '第一食堂',
        description: '学生餐厅，三层',
        category: 'service',
        icon: '🍜',
        longitude: 104.463508, // 向西偏移约75米
        latitude: 30.845427,   // 中心纬度
        openTime: '早餐 7:00-9:00，午餐 11:00-13:00，晚餐 17:00-19:00',
        features: '川菜、面食、小吃、水果',
        phone: '028-12345679'
    },
    {
        id: 11,
        name: '第二食堂',
        description: '教职工餐厅，两层',
        category: 'service',
        icon: '🍜',
        longitude: 104.465008, // 向东偏移约38米
        latitude: 30.845127,   // 向南偏移约30米
        openTime: '早餐 7:00-9:00，午餐 11:00-13:00，晚餐 17:00-19:00',
        features: '特色菜、营养套餐、清真餐'
    },
    {
        id: 12,
        name: '菜鸟驿站',
        description: '快递收发点',
        category: 'service',
        icon: '📦',
        longitude: 104.465208, // 向东偏移约53米
        latitude: 30.844927,   // 向南偏移约50米
        openTime: '周一至周日 8:00-21:00',
        features: '快递收发、打印服务',
        phone: '028-12345680'
    },
    {
        id: 13,
        name: '校园超市',
        description: '综合超市',
        category: 'service',
        icon: '🏪',
        longitude: 104.463808, // 向西偏移约53米
        latitude: 30.845727,   // 向北偏移约30米
        openTime: '周一至周日 7:00-23:00',
        features: '日用品、零食饮料、文具'
    },
    {
        id: 14,
        name: '医务室',
        description: '校园医疗服务',
        category: 'service',
        icon: '🏥',
        longitude: 104.465308, // 向东偏移约60米
        latitude: 30.845727,   // 向北偏移约30米
        openTime: '周一至周日 8:00-20:00',
        features: '常见病诊疗、应急救护',
        phone: '028-12345681'
    },
    {
        id: 15,
        name: '打印店',
        description: '文印服务中心',
        category: 'service',
        icon: '🖨️',
        longitude: 104.464208, // 向西偏移约23米
        latitude: 30.845927,   // 向北偏移约50米
        openTime: '周一至周日 8:00-22:00',
        features: '打印、复印、扫描、装订'
    },

    // 运动场所
    {
        id: 16,
        name: '田径场',
        description: '标准400米跑道',
        category: 'sports',
        icon: '⚽',
        longitude: 104.465608, // 向东偏移约83米
        latitude: 30.845427,   // 中心纬度
        openTime: '周一至周日 6:00-22:00',
        features: '足球场、篮球场、跑道'
    },
    {
        id: 17,
        name: '体育馆',
        description: '室内体育场馆',
        category: 'sports',
        icon: '🏀',
        longitude: 104.465408, // 向东偏移约68米
        latitude: 30.845127,   // 向南偏移约30米
        openTime: '周一至周日 8:00-21:00',
        features: '篮球场、羽毛球场、乒乓球室',
        phone: '028-12345682'
    },
    {
        id: 18,
        name: '游泳馆',
        description: '标准游泳池',
        category: 'sports',
        icon: '🏊',
        longitude: 104.465608, // 向东偏移约83米
        latitude: 30.845727,   // 向北偏移约30米
        openTime: '夏季 14:00-21:00',
        features: '标准泳池、更衣室、淋浴',
        phone: '028-12345683'
    },
    {
        id: 19,
        name: '网球场',
        description: '室外网球场',
        category: 'sports',
        icon: '🎾',
        longitude: 104.465808, // 向东偏移约98米
        latitude: 30.845427,   // 中心纬度
        openTime: '周一至周日 6:00-22:00',
        features: '4片标准网球场地'
    }
])

// 地图标记点
const markers = computed(() => {
    const locationMarkers = displayLocations.value.map(location => ({
        id: location.id,
        longitude: location.longitude,
        latitude: location.latitude,
        width: 45,  // 增大标记图标尺寸,更容易点击
        height: 45,
        callout: {
            content: location.name,
            color: '#333',
            fontSize: 13,
            borderRadius: 8,
            bgColor: '#ffffff',
            padding: 10,
            display: 'BYCLICK',
            textAlign: 'center'
        },
        // 添加标注点击提示
        label: {
            content: location.icon,
            fontSize: 20,
            color: '#ffffff',
            bgColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'center',
            anchorX: 0,
            anchorY: -10
        }
    }))
    return locationMarkers
})

// 搜索过滤
const filteredLocations = computed(() => {
    if (!searchKeyword.value) return []
    const keyword = searchKeyword.value.toLowerCase()
    return locations.value.filter(location =>
        location.name.toLowerCase().includes(keyword) ||
        location.description.toLowerCase().includes(keyword)
    )
})

// 显示的地点列表
const displayLocations = computed(() => {
    if (currentCategory.value === 'all') {
        return locations.value
    }
    return locations.value.filter(location => location.category === currentCategory.value)
})

onLoad(() => {
    console.log('校园导航页面加载')
    // 获取用户当前位置
    getUserLocation()

    // 打印接口需求文档
    printAPIRequirements()
})

onReady(() => {
    // 页面渲染完成后的操作
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【校园导航页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取地点分类
    console.log('📍 接口1: 获取地点分类')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/campus/categories')
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            categories: [
                { label: '全部', value: 'all', icon: '📍' },
                { label: '教学楼', value: 'teaching', icon: '🏫' },
                { label: '宿舍楼', value: 'dormitory', icon: '🏠' },
                { label: '生活服务', value: 'service', icon: '🏪' },
                { label: '运动场所', value: 'sports', icon: '⚽' }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口2: 获取校园地点列表
    console.log('📍 接口2: 获取校园地点列表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/campus/locations')
    console.log('请求参数:')
    console.log(JSON.stringify({
        category: 'all', // 分类value,从接口1获取的categories中的value字段
        keyword: '教学楼' // 可选,搜索关键词
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            locations: [
                {
                    id: 1,
                    name: '教学楼A栋',
                    description: '主要教学楼，1-6层',
                    category: 'teaching', // 对应分类的value
                    icon: '🏫',
                    longitude: 104.464108,
                    latitude: 30.845527,
                    openTime: '周一至周日 7:00-22:00',
                    features: '多媒体教室、实验室、自习室',
                    phone: '028-12345678'
                }
            ]
        }
    }, null, 2))
    console.log('\n')

    // 接口3: 获取地点详情
    console.log('📍 接口3: 获取地点详情')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/campus/locations/:id')
    console.log('请求参数:')
    console.log(JSON.stringify({
        id: 1
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            id: 1,
            name: '教学楼A栋',
            description: '主要教学楼，1-6层',
            category: 'teaching',
            icon: '🏫',
            longitude: 104.464108,
            latitude: 30.845527,
            openTime: '周一至周日 7:00-22:00',
            features: '多媒体教室、实验室、自习室',
            phone: '028-12345678',
            images: [
                'https://example.com/image1.jpg',
                'https://example.com/image2.jpg'
            ]
        }
    }, null, 2))
    console.log('\n')

    // 数据字典
    console.log('📚 数据字典')
    console.log('━'.repeat(80))
    console.log('分类对象结构:')
    console.log(JSON.stringify({
        label: '分类显示名称',
        value: '分类值(用于筛选参数)',
        icon: '分类图标(emoji或图片URL)'
    }, null, 2))
    console.log('\n地点对象必填字段:')
    console.log(JSON.stringify({
        id: '地点唯一标识',
        name: '地点名称',
        category: '分类value(对应categories中的value)',
        longitude: '经度(GCJ-02坐标系)',
        latitude: '纬度(GCJ-02坐标系)'
    }, null, 2))
    console.log('\n地点对象可选字段:')
    console.log(JSON.stringify({
        description: '地点描述',
        icon: '地点图标',
        openTime: '开放时间',
        features: '设施特色',
        phone: '联系电话',
        images: '地点图片数组'
    }, null, 2))
    console.log('\n')

    // 说明
    console.log('📝 接口说明')
    console.log('━'.repeat(80))
    console.log('1. 工作流程:')
    console.log('   - 页面加载时先调用接口1获取分类列表')
    console.log('   - 用分类的value字段作为参数调用接口2获取地点列表')
    console.log('   - category="all"时返回所有地点,其他值返回对应分类的地点')
    console.log('2. 坐标系统: 使用GCJ-02(火星坐标系),精度保留6位小数')
    console.log('3. 搜索功能: 支持按name和description模糊搜索,不区分大小写')
    console.log('4. 分类筛选: 通过category参数精确匹配地点的category字段')
    console.log('5. 图标字段: 可返回emoji或图片URL,前端会直接展示')
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}

// 获取用户当前位置
const getUserLocation = () => {
    uni.getLocation({
        type: 'gcj02', // 返回可以用于uni.openLocation的经纬度
        isHighAccuracy: true, // 开启高精度定位
        highAccuracyExpireTime: 4000, // 高精度定位超时时间(ms)
        success: (res) => {
            console.log('获取用户位置成功', res)
            userLocation.value = {
                longitude: res.longitude,
                latitude: res.latitude,
                accuracy: res.accuracy // 位置的精确度
            }
            console.log('定位精度:', res.accuracy, '米')
            // 如果用户在校园附近,可以将地图中心设置为用户位置
            // 这里可以根据距离判断是否在校园内
        },
        fail: (err) => {
            console.error('获取用户位置失败', err)
            uni.showToast({
                title: '无法获取您的位置',
                icon: 'none',
                duration: 2000
            })
        }
    })
}

// 搜索输入
const onSearch = () => {
    // 实时搜索
}

// 搜索确认
const onSearchConfirm = () => {
    // 按 Enter 键时只过滤列表，不自动选择第一条
    // 用户可以从搜索结果中手动选择想要的地点
}

// 清除搜索
const clearSearch = () => {
    searchKeyword.value = ''
}

// 选择地点
const selectLocation = (location) => {
    searchKeyword.value = ''
    selectedLocation.value = location
    // 地图居中到该地点,并放大到19级以精确显示建筑物
    mapCenter.value = {
        longitude: location.longitude,
        latitude: location.latitude
    }
    mapScale.value = 19
}

// 切换分类
const switchCategory = (category) => {
    currentCategory.value = category
}

// 切换面板展开状态
const togglePanel = () => {
    isPanelExpanded.value = !isPanelExpanded.value
    // 首次关闭后,标记为非首次打开
    if (!isPanelExpanded.value && isFirstOpen.value) {
        isFirstOpen.value = false
    }
}

// 关闭面板
const closePanel = () => {
    isPanelExpanded.value = false
    // 首次关闭后,标记为非首次打开
    if (isFirstOpen.value) {
        isFirstOpen.value = false
    }
}

// 选择地点并关闭面板
const selectLocationAndClose = (location) => {
    selectLocation(location)
    closePanel()
}

// 重新定位到学校中心
const relocateToCenter = () => {
    mapCenter.value = { ...schoolCenter }
    mapScale.value = 18 // 重置到18级,可以看到整个校园布局
    uni.showToast({
        title: '已定位到校园中心',
        icon: 'none'
    })
}

// 放大地图
const zoomIn = () => {
    if (mapScale.value < 20) { // 最大放大到20级,可以看到建筑物细节
        mapScale.value += 1
    } else {
        uni.showToast({
            title: '已达到最大缩放级别',
            icon: 'none',
            duration: 1500
        })
    }
}

// 缩小地图
const zoomOut = () => {
    if (mapScale.value > 16) { // 最小缩小到16级,保证能看清校园范围
        mapScale.value -= 1
    } else {
        uni.showToast({
            title: '已达到最小缩放级别',
            icon: 'none',
            duration: 1500
        })
    }
}

// 标记点击
const onMarkerTap = (e) => {
    const markerId = e.detail.markerId
    const location = locations.value.find(loc => loc.id === markerId)
    if (location) {
        selectLocation(location)
    }
}

// 地图区域变化
const onRegionChange = (e) => {
    // 可以在这里处理地图拖动、缩放等事件
}

// 地图点击
const onMapTap = () => {
    // 点击地图空白处可以关闭详情弹窗
    if (selectedLocation.value) {
        selectedLocation.value = null
    }
}

// 关闭详情
const closeDetail = () => {
    selectedLocation.value = null
}

// 导航到地点
const navigateToLocation = (location) => {
    uni.openLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.description,
        scale: 19, // 使用19级缩放,更精确显示建筑物位置
        success: () => {
            console.log('打开地图成功')
        },
        fail: (err) => {
            console.error('打开地图失败', err)
            uni.showToast({
                title: '打开地图失败',
                icon: 'none'
            })
        }
    })
}

// 分享位置
const shareLocation = (location) => {
    uni.showShareMenu({
        title: location.name,
        path: `/pages/campus-nav/campus-nav?locationId=${location.id}`
    })
}
</script>

<style scoped lang="scss">
.campus-nav-container {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
}

/* 弹出层内的搜索栏 */
.panel-content .search-bar {
    padding: 16rpx 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
}

.panel-content .search-box {
    display: flex;
    align-items: center;
    height: 72rpx;
    padding: 0 24rpx;
    background-color: #f8f8f8;
    border-radius: 36rpx;
    gap: 12rpx;
}

.panel-content .search-icon {
    font-size: 32rpx;
    color: #666;
}

.panel-content .search-input {
    flex: 1;
    font-size: 28rpx;
    height: 100%;
    background: transparent;
}

.panel-content .clear-icon {
    font-size: 28rpx;
    color: #999;
    padding: 8rpx;
}

/* 弹出层内的搜索结果 */
.panel-content .search-results {
    margin: 16rpx 24rpx 0;
    max-height: 500rpx;
    background-color: #fff;
    border-radius: 12rpx;
    border: 1rpx solid #f0f0f0;
    overflow-y: auto;
}

.panel-content .result-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    gap: 16rpx;
    transition: all 0.3s;

    &:last-child {
        border-bottom: none;
    }

    &:active {
        background-color: #f8f8f8;
    }
}

.panel-content .result-icon {
    font-size: 36rpx;
}

.panel-content .result-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
}

.panel-content .result-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.panel-content .result-desc {
    font-size: 24rpx;
    color: #999;
}

.panel-content .nav-icon {
    font-size: 28rpx;
    color: #667eea;
}

.panel-content .result-nav-btn {
    padding: 8rpx 20rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    flex-shrink: 0;
}

.panel-content .result-nav-text {
    font-size: 24rpx;
    color: #fff;
    white-space: nowrap;
}

.panel-content .no-results {
    margin: 16rpx 24rpx 0;
    padding: 32rpx;
    text-align: center;
    background-color: #f8f8f8;
    border-radius: 12rpx;
}

.panel-content .no-results-text {
    font-size: 26rpx;
    color: #999;
}

/* 地图 */
.map-container {
    width: 100%;
    height: 100%;
}

/* 地图控制按钮 */
.map-controls {
    position: absolute;
    right: 20rpx;
    bottom: 100rpx;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.control-btn {
    width: 72rpx;
    height: 72rpx;
    background-color: #fff;
    border-radius: 36rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon {
    width: 40rpx;
    height: 40rpx;
}

.btn-text {
    font-size: 40rpx;
    color: #333;
    font-weight: 300;
}

.list-btn {
    .btn-text {
        font-size: 32rpx;
    }
}

/* 底部面板弹出层 */
.location-panel-modal {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 200;
    animation: fadeIn 0.3s;
}

.panel-content {
    width: 100%;
    max-width: 100vw;
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    flex-direction: column;
    animation: slideUp 0.3s;
    overflow: hidden;
    box-sizing: border-box;
    max-height: 80vh;
}

.panel-content.first-open {
    max-height: 50vh;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 24rpx 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
}

.panel-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.close-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 50%;
}

.close-icon {
    font-size: 28rpx;
    color: #999;
}

/* 面板主体 */
.panel-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 分类标签 */
.category-tabs {
    padding: 16rpx 24rpx;
    white-space: nowrap;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-x: auto;

    &::-webkit-scrollbar {
        display: none;
    }
}

.category-tab {
    display: inline-block;
    padding: 12rpx 24rpx;
    margin-right: 16rpx;
    background-color: #f5f5f5;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s;

    &.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        .tab-text {
            color: #fff;
        }
    }

    &:last-child {
        margin-right: 0;
    }
}

.tab-text {
    white-space: nowrap;
}

/* 地点列表 */
.location-list {
    flex: 1;
    overflow-y: auto;
    padding: 16rpx 24rpx 24rpx;
    width: 100%;
    box-sizing: border-box;
}

.location-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    box-sizing: border-box;
}

.location-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    gap: 16rpx;
    transition: all 0.3s;
    box-sizing: border-box;
    min-width: 0;
    overflow: hidden;

    &:active {
        background-color: #f0f0f0;
        transform: scale(0.98);
    }
}

.location-icon {
    font-size: 48rpx;
    flex-shrink: 0;
}

.location-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    min-width: 0;
    overflow: hidden;
}

.location-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.location-desc {
    font-size: 24rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-btn {
    padding: 12rpx 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20rpx;
    flex-shrink: 0;
}

.nav-text {
    font-size: 26rpx;
    color: #fff;
    white-space: nowrap;
}

/* 详情弹窗 */
.location-detail-modal {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 200;
    animation: fadeIn 0.3s;
}

.modal-content {
    width: 100%;
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 32rpx;
    animation: slideUp 0.3s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

.detail-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;
}

.detail-icon {
    font-size: 56rpx;
}

.detail-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
}

.detail-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.detail-desc {
    font-size: 26rpx;
    color: #999;
}

.close-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 50%;
}

.close-icon {
    font-size: 28rpx;
    color: #999;
}

.detail-body {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-bottom: 32rpx;
    padding: 24rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
}

.item-label {
    font-size: 28rpx;
    color: #999;
    flex-shrink: 0;
}

.item-value {
    font-size: 28rpx;
    color: #333;
    text-align: right;
    flex: 1;
}

.detail-actions {
    display: flex;
    gap: 16rpx;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 24rpx;
    border-radius: 12rpx;
    transition: all 0.3s;

    &:active {
        transform: scale(0.95);
    }
}

.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    .btn-icon,
    .btn-text {
        color: #fff;
    }
}

.secondary-btn {
    background-color: #f5f5f5;

    .btn-icon {
        font-size: 28rpx;
    }

    .btn-text {
        color: #667eea;
        font-weight: 500;
    }
}

.btn-icon {
    font-size: 32rpx;
}

.btn-text {
    font-size: 28rpx;
    font-weight: 500;
}
</style>

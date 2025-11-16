<template>
    <view class="page">
        <view class="container">
            <!-- 日期信息 -->
            <view class="date-header">
                <view class="date-header-top">
                    <view class="date-info">
                        <text class="current-date">{{ currentDateText }}</text>
                        <text class="week-info" v-if="displayWeek === currentWeek">第{{ displayWeek }}周 星期{{
                            currentDayText
                            }}</text>
                        <text class="week-info" v-else>第{{ displayWeek }}周 当前为第{{ currentWeek }}周</text>
                    </view>
                    <view class="calibrate-btn" v-if="displayWeek !== currentWeek" @tap="backToCurrentWeek">
                        <text class="calibrate-icon">📍</text>
                        <text class="calibrate-text">回到本周</text>
                    </view>
                </view>
            </view>

            <!-- 课表主体 - 滑动切换 -->
            <swiper class="schedule-swiper" :current="swiperIndex" @change="onSwiperChange" :duration="300">
                <swiper-item v-for="week in weekRange" :key="week">
                    <view class="schedule-container">
                        <view class="schedule-table">
                            <!-- 时间列 -->
                            <view class="time-column">
                                <view class="time-header">
                                    <text class="header-line1">节次</text>
                                </view>
                                <view class="time-cell" v-for="(time, index) in timeSlots" :key="index">
                                    <view class="time-group">
                                        <text class="time-period">{{ time.period }}</text>
                                        <text class="time-range">{{ time.range[0] }}</text>
                                        <text class="time-range">{{ time.range[1] }}</text>
                                    </view>
                                    <view class="time-group">
                                        <text class="time-period">{{ time.period2 }}</text>
                                        <text class="time-range">{{ time.range2[0] }}</text>
                                        <text class="time-range">{{ time.range2[1] }}</text>
                                    </view>
                                </view>
                            </view>

                            <!-- 课程列 -->
                            <view class="day-column" v-for="(day, dayIndex) in getWeekDays(week)" :key="dayIndex"
                                :class="{ active: isToday(dayIndex, week) }">
                                <!-- 日期头部 -->
                                <view class="day-header">
                                    <text class="header-line1">{{ day.name }}</text>
                                    <text class="header-line2">{{ day.date }}</text>
                                </view>

                                <!-- 课程单元格 -->
                                <view class="course-cell" v-for="(time, timeIndex) in timeSlots" :key="timeIndex"
                                    @tap="viewCourseDetail(getCourse(dayIndex, timeIndex, week))">
                                    <view class="course-content" v-if="getCourse(dayIndex, timeIndex, week)"
                                        :class="{ highlight: isToday(dayIndex, week) }" :style="{
                                            background: getCourseColor(getCourse(dayIndex, timeIndex, week).id).bg,
                                            borderLeftColor: getCourseColor(getCourse(dayIndex, timeIndex, week).id).border
                                        }">
                                        <text class="course-name">{{ getCourse(dayIndex, timeIndex, week).name }}</text>
                                        <text class="course-location">📍 {{ getCourse(dayIndex, timeIndex,
                                            week).location
                                            }}</text>
                                        <text class="course-teacher">{{ getCourse(dayIndex, timeIndex, week).teacher
                                        }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </swiper-item>
            </swiper>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 当前日期
const now = new Date()
const currentYear = ref(now.getFullYear())
const currentMonth = ref(now.getMonth() + 1)
const currentDay = ref(now.getDate())
const currentWeekDay = ref(now.getDay()) // 0-6, 0是周日

// 学期开始日期（用于计算周次）
const semesterStartDate = new Date(2025, 8, 8) // 2025年9月8日开学

// 当前周次
const currentWeek = computed(() => {
    const diff = now - semesterStartDate
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return Math.floor(days / 7) + 1
})

// 显示的周次（可切换）
const displayWeek = ref(currentWeek.value)

// 周次范围（支持前后各10周）
const weekRange = computed(() => {
    const range = []
    for (let i = 1; i <= 20; i++) {
        range.push(i)
    }
    return range
})

// swiper索引
const swiperIndex = ref(currentWeek.value - 1)

// 当前日期文本
const currentDateText = computed(() => {
    return `${currentYear.value}年${currentMonth.value}月${currentDay.value}日`
})

// 当前星期文本
const currentDayText = computed(() => {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    return days[currentWeekDay.value]
})

// 时间段配置
const timeSlots = [
    {
        period: '1',
        range: ['08:25', '09:10'],
        period2: '2',
        range2: ['09:15', '10:00']
    },
    {
        period: '3',
        range: ['10:20', '11:05'],
        period2: '4',
        range2: ['11:10', '11:55']
    },
    {
        period: '5',
        range: ['14:00', '14:45'],
        period2: '6',
        range2: ['14:50', '15:35']
    },
    {
        period: '7',
        range: ['15:55', '16:40'],
        period2: '8',
        range2: ['16:45', '17:30']
    },
    {
        period: '9',
        range: ['19:00', '19:45'],
        period2: '10',
        range2: ['19:50', '20:35']
    }
]

// 获取指定周的周几数据
const getWeekDays = (week) => {
    const days = ['一', '二', '三', '四', '五', '六', '日']
    const result = []

    // 计算本周一的日期
    const monday = new Date(now)
    const dayOfWeek = now.getDay() || 7 // 将周日的0转为7
    monday.setDate(now.getDate() - dayOfWeek + 1 + (week - currentWeek.value) * 7)

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        result.push({
            name: days[i],
            date: `${date.getMonth() + 1}/${date.getDate()}`
        })
    }

    return result
}

// 课程颜色配置（根据课程名称哈希生成固定颜色）
const courseColors = [
    { bg: 'rgba(99, 102, 241, 0.12)', border: '#6366f1' },   // 靛蓝色
    { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981' },   // 翡翠绿
    { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b' },   // 琥珀色
    { bg: 'rgba(239, 68, 68, 0.12)', border: '#ef4444' },    // 红色
    { bg: 'rgba(168, 85, 247, 0.12)', border: '#a855f7' },   // 紫色
    { bg: 'rgba(236, 72, 153, 0.12)', border: '#ec4899' },   // 粉红色
    { bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4' },    // 青色
    { bg: 'rgba(132, 204, 22, 0.12)', border: '#84cc16' },   // 青柠色
    { bg: 'rgba(251, 146, 60, 0.12)', border: '#fb923c' },   // 橙色
    { bg: 'rgba(147, 51, 234, 0.12)', border: '#9333ea' },   // 深紫色
    { bg: 'rgba(244, 63, 94, 0.12)', border: '#f43f5e' },    // 玫瑰色
    { bg: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6' },   // 蓝色
    { bg: 'rgba(34, 197, 94, 0.12)', border: '#22c55e' },    // 绿色
    { bg: 'rgba(249, 115, 22, 0.12)', border: '#f97316' },   // 深橙色
    { bg: 'rgba(139, 92, 246, 0.12)', border: '#8b5cf6' }    // 紫罗兰色
]

// 根据课程ID获取颜色
const getCourseColor = (courseId) => {
    if (!courseId) return courseColors[0]
    const index = (courseId - 1) % courseColors.length
    return courseColors[index]
}

// 课程数据（模拟数据）
const courses = ref({
    1: { // 第1周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            3: { id: 3, name: '计算机导论', location: '实验楼C201', teacher: '刘老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            3: { id: 7, name: '数据库原理', location: '实验楼C302', teacher: '杨老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' }
        }
    },
    2: { // 第2周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            3: { id: 3, name: '计算机导论', location: '实验楼C201', teacher: '刘老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            2: { id: 19, name: '移动开发', location: '实验楼C303', teacher: '陈老师' }
        }
    },
    3: { // 第3周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            1: { id: 15, name: '算法设计', location: '实验楼C302', teacher: '孙老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' },
            3: { id: 7, name: '数据库原理', location: '实验楼C302', teacher: '杨老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            0: { id: 18, name: '离散数学', location: '教学楼B301', teacher: '冯老师' },
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' }
        }
    },
    4: { // 第4周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            4: { id: 14, name: '形势与政策', location: '教学楼D401', teacher: '李老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        }
    },
    5: { // 第5周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            3: { id: 3, name: '计算机导论', location: '实验楼C201', teacher: '刘老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            1: { id: 15, name: '算法设计', location: '实验楼C302', teacher: '孙老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            3: { id: 7, name: '数据库原理', location: '实验楼C302', teacher: '杨老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 17, name: 'Web开发', location: '实验楼C205', teacher: '郑老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            0: { id: 18, name: '离散数学', location: '教学楼B301', teacher: '冯老师' },
            2: { id: 19, name: '移动开发', location: '实验楼C303', teacher: '陈老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' },
            2: { id: 20, name: '数据分析', location: '实验楼C102', teacher: '何老师' }
        }
    },
    6: { // 第6周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        }
    },
    7: { // 第7周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            4: { id: 14, name: '形势与政策', location: '教学楼D401', teacher: '李老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        }
    },
    8: { // 第8周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            1: { id: 15, name: '算法设计', location: '实验楼C302', teacher: '孙老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 17, name: 'Web开发', location: '实验楼C205', teacher: '郑老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            0: { id: 18, name: '离散数学', location: '教学楼B301', teacher: '冯老师' },
            2: { id: 19, name: '移动开发', location: '实验楼C303', teacher: '陈老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' },
            2: { id: 20, name: '数据分析', location: '实验楼C102', teacher: '何老师' }
        }
    },
    10: { // 第10周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            3: { id: 7, name: '数据库原理', location: '实验楼C302', teacher: '杨老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            2: { id: 19, name: '移动开发', location: '实验楼C303', teacher: '陈老师' }
        }
    },
    11: { // 第11周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            3: { id: 3, name: '计算机导论', location: '实验楼C201', teacher: '刘老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            1: { id: 15, name: '算法设计', location: '实验楼C302', teacher: '孙老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            4: { id: 14, name: '形势与政策', location: '教学楼D401', teacher: '李老师' }
        },
        4: { // 周五
            0: { id: 18, name: '离散数学', location: '教学楼B301', teacher: '冯老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' }
        }
    },
    12: { // 第12周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 17, name: 'Web开发', location: '实验楼C205', teacher: '郑老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            2: { id: 19, name: '移动开发', location: '实验楼C303', teacher: '陈老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' },
            2: { id: 20, name: '数据分析', location: '实验楼C102', teacher: '何老师' }
        }
    },
    13: { // 第13周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            1: { id: 15, name: '算法设计', location: '实验楼C302', teacher: '孙老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' },
            3: { id: 7, name: '数据库原理', location: '实验楼C302', teacher: '杨老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            0: { id: 18, name: '离散数学', location: '教学楼B301', teacher: '冯老师' },
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        }
    },
    14: { // 第14周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 11, name: '线性代数', location: '教学楼A203', teacher: '李老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' }
        },
        2: { // 周三
            0: { id: 16, name: '概率论', location: '教学楼B203', teacher: '钱老师' },
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            2: { id: 13, name: '编译原理', location: '实验楼C401', teacher: '吴老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            4: { id: 14, name: '形势与政策', location: '教学楼D401', teacher: '李老师' }
        },
        4: { // 周五
            1: { id: 8, name: '软件工程', location: '教学楼A502', teacher: '周老师' },
            3: { id: 9, name: '人工智能', location: '实验楼C401', teacher: '吴老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' }
        }
    },
    15: { // 第15周
        0: { // 周一
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
            3: { id: 3, name: '计算机导论', location: '实验楼C201', teacher: '刘老师' }
        },
        1: { // 周二
            0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
            1: { id: 15, name: '算法设计', location: '实验楼C302', teacher: '孙老师' },
            3: { id: 12, name: '体育', location: '体育馆', teacher: '周老师' }
        },
        2: { // 周三
            1: { id: 6, name: '操作系统', location: '教学楼A401', teacher: '陈老师' },
            3: { id: 7, name: '数据库原理', location: '实验楼C302', teacher: '杨老师' }
        },
        3: { // 周四
            0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' },
            1: { id: 17, name: 'Web开发', location: '实验楼C205', teacher: '郑老师' },
            2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' }
        },
        4: { // 周五
            0: { id: 18, name: '离散数学', location: '教学楼B301', teacher: '冯老师' },
            2: { id: 19, name: '移动开发', location: '实验楼C303', teacher: '陈老师' }
        },
        5: { // 周六
            1: { id: 10, name: 'Python编程', location: '实验楼C101', teacher: '徐老师' },
            2: { id: 20, name: '数据分析', location: '实验楼C102', teacher: '何老师' }
        }
    }
})

// 判断是否是今天
const isToday = (dayIndex, week) => {
    if (week !== currentWeek.value) {
        return false
    }
    const todayIndex = currentWeekDay.value === 0 ? 6 : currentWeekDay.value - 1
    return dayIndex === todayIndex
}

// 获取课程
const getCourse = (dayIndex, timeIndex, week) => {
    const weekData = courses.value[week]
    if (!weekData) return null
    const dayData = weekData[dayIndex]
    if (!dayData) return null
    return dayData[timeIndex] || null
}

// swiper切换事件
const onSwiperChange = (e) => {
    const index = e.detail.current
    swiperIndex.value = index
    displayWeek.value = index + 1
}

// 返回当前周
const backToCurrentWeek = () => {
    swiperIndex.value = currentWeek.value - 1
    displayWeek.value = currentWeek.value
}

// 查看课程详情
const viewCourseDetail = (course) => {
    if (!course) return

    uni.showModal({
        title: course.name,
        content: `授课教师: ${course.teacher}\n上课地点: ${course.location}`,
        showCancel: false
    })
}

onLoad(() => {
    console.log('课表页面加载')

    // 打印接口需求文档
    printAPIRequirements()
})

// ==================== 接口需求文档 ====================
const printAPIRequirements = () => {
    console.log('\n')
    console.log('='.repeat(80))
    console.log('【课程表页面 - 后端接口需求文档】')
    console.log('='.repeat(80))
    console.log('\n')

    // 接口1: 获取课程表
    console.log('📍 接口1: 获取课程表')
    console.log('━'.repeat(80))
    console.log('请求方式: GET')
    console.log('接口路径: /api/schedule')
    console.log('请求头: Authorization: Bearer <token>')
    console.log('请求参数:')
    console.log(JSON.stringify({
        week: 1, // 第几周,不传则返回当前周
        semester: '2024-2025-1' // 学期,不传则返回当前学期
    }, null, 2))
    console.log('\n响应数据格式:')
    console.log(JSON.stringify({
        code: 200,
        message: 'success',
        data: {
            currentWeek: 10,
            semester: '2024-2025-1',
            semesterStartDate: '2025-09-08', // 学期开始日期
            courses: {
                1: { // 第1周
                    0: { // 周一(0-6对应周一到周日)
                        0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' }, // 第1节次(0-4对应5个大节)
                        2: { id: 2, name: '大学英语', location: '教学楼B101', teacher: '王老师' },
                        3: { id: 3, name: '计算机导论', location: '实验楼C201', teacher: '刘老师' }
                    },
                    1: { // 周二
                        0: { id: 4, name: '数据结构', location: '实验楼C301', teacher: '赵老师' },
                        2: { id: 5, name: '计算机网络', location: '教学楼A305', teacher: '刘老师' }
                    }
                },
                2: { // 第2周
                    0: {
                        0: { id: 1, name: '高等数学', location: '教学楼A201', teacher: '张教授' }
                    }
                }
            }
        }
    }, null, 2))
    console.log('\n')

    console.log('='.repeat(80))
    console.log('【接口文档打印完毕】')
    console.log('='.repeat(80))
    console.log('\n')
}
</script>

<style scoped lang="scss">
.container {
    min-height: 100vh;
    background: #f5f5f5;
}

/* 日期头部 */
.date-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 30rpx;
}

.date-header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20rpx;
}

.date-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    flex: 1;
}

.current-date {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
}

.week-info {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
}

.calibrate-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12rpx;
    padding: 12rpx 20rpx;
    backdrop-filter: blur(10rpx);
    border: 1rpx solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;

    &:active {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.95);
    }
}

.calibrate-icon {
    font-size: 28rpx;
    line-height: 1;
}

.calibrate-text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 500;
    white-space: nowrap;
}

/* 课表滑动容器 */
.schedule-swiper {
    height: calc(100vh - 140rpx);
}

/* 课表主体 */
.schedule-container {
    padding: 20rpx;
    height: 100%;
    overflow-y: auto;
}

.schedule-table {
    display: flex;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    height: 100%;
}

/* 时间列 */
.time-column {
    display: flex;
    flex-direction: column;
    border-right: 2rpx solid #f0f0f0;
    width: 80rpx;
    flex-shrink: 0;
}

.time-header {
    height: 60rpx;
    padding: 8rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 2rpx solid #f0f0f0;
}

.header-line1 {
    font-size: 20rpx;
    font-weight: bold;
    color: #667eea;
}

.time-cell {
    flex: 1;
    min-height: 0;
    padding: 4rpx 2rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    border-bottom: 1rpx solid #f0f0f0;
    background: #fafafa;

    &:last-child {
        border-bottom: none;
    }
}

.time-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rpx;
}

.time-period {
    font-size: 22rpx;
    font-weight: bold;
    color: #667eea;
    text-align: center;
    line-height: 1.2;
}

.time-range {
    font-size: 18rpx;
    color: #666;
    text-align: center;
    line-height: 1.3;
    white-space: nowrap;
}

.day-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
    width: calc((100vw - 120rpx) / 7);
    flex-shrink: 0;
    border-right: 1rpx solid #f0f0f0;

    &:last-child {
        border-right: none;
    }

    &.active {
        .day-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

            .header-line1,
            .header-line2 {
                color: #fff;
            }
        }
    }
}

.day-header {
    height: 60rpx;
    padding: 6rpx;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.header-line2 {
    font-size: 16rpx;
    color: #999;
}

.course-cell {
    flex: 1;
    min-height: 0;
    padding: 4rpx;
    border-bottom: 1rpx solid #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:last-child {
        border-bottom: none;
    }
}

.course-content {
    width: 100%;
    height: 100%;
    border-radius: 4rpx;
    padding: 4rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2rpx;
    border-left: 2rpx solid;

    &.highlight {
        opacity: 0.85;
        box-shadow: 0 0 8rpx rgba(102, 126, 234, 0.3);
    }
}

.course-name {
    font-size: 18rpx;
    font-weight: bold;
    color: #333;
    word-break: break-all;
    line-height: 1.3;
}

.course-location {
    font-size: 14rpx;
    color: #666;
    word-break: break-all;
    line-height: 1.3;
}

.course-teacher {
    font-size: 14rpx;
    color: #999;
    word-break: break-all;
    line-height: 1.3;
}
</style>

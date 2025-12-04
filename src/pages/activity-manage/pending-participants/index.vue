<template>
    <view class="page">
        <RefreshLoadList ref="refreshList" :api="fetchList" :page-size="20" :auto-load="false"
            @load-success="handleLoadSuccess">
            <template #header>
                <view class="header">
                    <text class="title">待录取名单</text>
                    <text class="subtitle">共 {{ total }} 人待审核</text>
                </view>
            </template>

            <template #default="{ items }">
                <view class="list">
                    <view v-for="(item, index) in items" :key="item.participantId" class="list-item">
                        <view class="item-left">
                            <image :src="item.studentAvatar || '/static/images/default-avatar.png'" class="avatar"
                                mode="aspectFill"></image>
                            <view class="info">
                                <text class="name">{{ item.studentName }}</text>
                                <text class="student-no">{{ item.studentNo }}</text>
                                <text class="time">报名时间: {{ formatDate(item.enrollTime) }}</text>
                            </view>
                        </view>
                        <button class="approve-btn" size="mini" @tap="handleApprove(item)">通过</button>
                    </view>
                </view>
            </template>
        </RefreshLoadList>
    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPendingParticipants, approveParticipants } from '@/api/activity'
import RefreshLoadList from '@/components/RefreshLoadList/RefreshLoadList.vue'

const activityId = ref(null)
const total = ref(0)
const refreshList = ref(null)

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

const fetchList = (params) => {
    if (!activityId.value) return Promise.reject('Activity ID is missing')
    return getPendingParticipants(activityId.value, params)
}

const handleLoadSuccess = (res) => {
    total.value = res.total
}

const handleApprove = async (item) => {
    uni.showModal({
        title: '确认录取',
        content: `确定要录取 ${item.studentName} 吗？`,
        success: async (res) => {
            if (res.confirm) {
                try {
                    await approveParticipants({
                        participantIds: item.participantId
                    })

                    uni.showToast({
                        title: '已录取',
                        icon: 'success'
                    })
                    // 刷新列表
                    refreshList.value.reload()
                } catch (error) {

                    console.error('审核失败:', error)
                }
            }
        }
    })
}

onLoad((options) => {
    if (options.id) {
        activityId.value = options.id
        // 等待 activityId 设置好后再加载数据
        setTimeout(() => {
            if (refreshList.value) {
                refreshList.value.loadData(true)
            }
        }, 100)
    }
})
</script>

<style scoped lang="scss">
.page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
}

.header {
    background: #fff;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;
}

.title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
}

.subtitle {
    font-size: 24rpx;
    color: #666;
}

.list {
    padding: 20rpx;
}

.list-item {
    background: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-left {
    display: flex;
    align-items: center;
    flex: 1;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    background: #eee;
}

.info {
    display: flex;
    flex-direction: column;
}

.name {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 4rpx;
}

.student-no {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 4rpx;
}

.time {
    font-size: 22rpx;
    color: #999;
}

.approve-btn {
    background: #007aff;
    color: #fff;
    font-size: 24rpx;
    padding: 0 30rpx;
    height: 56rpx;
    line-height: 56rpx;
    border-radius: 28rpx;
    margin: 0;
}
</style>

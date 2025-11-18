/**
 * 活动管理相关接口
 */
import request from "@/utils/request";

/**
 * 获取活动列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.activityName - 活动名称(可选)
 * @param {string} params.activityType - 活动类型(可选)
 * @param {string} params.status - 状态(可选)
 */
export const getActivityList = (params) => {
  return request.get("/edu/activity/miniprogram", params);
};

/**
 * 获取活动详情
 * @param {string} id - 活动ID
 */
export const getActivityDetail = (id) => {
  return request.get(`/edu/activity/detail/${id}`);
};

/**
 * 报名活动
 * @param {Object} data - 报名信息
 * @param {string} data.activityId - 活动ID
 */
export const enrollActivity = (data) => {
  return request.post("/edu/activity/enroll", data);
};

/**
 * 取消报名
 * @param {Object} data - 取消报名信息
 * @param {string} data.activityId - 活动ID
 */
export const cancelEnroll = (data) => {
  return request.post("/edu/activity/cancelEnroll", data);
};

/**
 * 活动签到
 * @param {Object} data - 签到信息
 * @param {string} data.activityId - 活动ID
 * @param {string} data.signInCode - 签到码(可选)
 */
export const signInActivity = (data) => {
  return request.post("/edu/activity/signIn", data);
};

/**
 * 完成活动
 * @param {Object} data - 完成信息
 * @param {string} data.activityId - 活动ID
 */
export const completeActivity = (data) => {
  return request.post("/edu/activity/complete", data);
};

/**
 * 获取活动类型映射
 */
export const getActivityTypesMap = () => {
  return request.get("/edu/activity/types/map");
};

/**
 * 创建活动
 * @param {Object} data - 活动信息
 */
export const createActivity = (data) => {
  return request.post("/edu/activity", data);
};

/**
 * 更新活动
 * @param {Object} data - 活动信息
 */
export const updateActivity = (data) => {
  return request.put("/edu/activity", data);
};

/**
 * 删除活动
 * @param {string} activityIds - 活动ID(多个用逗号分隔)
 */
export const deleteActivity = (activityIds) => {
  return request.delete(`/edu/activity/${activityIds}`);
};

/**
 * 获取活动参与记录列表
 * @param {Object} params - 查询参数
 */
export const getParticipantList = (params) => {
  return request.get("/edu/participant/list", params);
};

/**
 * 获取活动参与记录详情
 * @param {string} participantId - 参与记录ID
 */
export const getParticipantDetail = (participantId) => {
  return request.get(`/edu/participant/${participantId}`);
};

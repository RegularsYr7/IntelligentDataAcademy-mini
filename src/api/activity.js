/**
 * 活动管理相关接口
 */
import request from "@/utils/request";

/**
 * 获取活动列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.type - 活动类型(可选)
 * @param {number} params.organizationId - 组织ID(可选)
 * @param {string} params.search - 搜索关键词(可选)
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
 * @param {Object} params - 取消报名信息
 * @param {number} params.activityId - 活动ID
 */
export const cancelEnroll = ({ activityId }) => {
  return request.post(`/edu/activity/cancelEnroll?activityId=${activityId}`);
};

/**
 * 活动签到 (扫码签到)
 * @param {Object} data - 签到信息
 * @param {string} data.signInCode - 二维码内容
 * @param {number} data.activityId - 活动ID
 */
export const signInActivity = (data) => {
  return request.post("/edu/activity/signIn", data);
};

/**
 * 生成签到二维码
 * @param {string} activityId - 活动ID
 */
export const generateQRCode = (activityId) => {
  return request.get(`/edu/activity/generateQRCode/${activityId}`);
};

/**
 * 获取参与人员列表
 * @param {string} activityId - 活动ID
 * @param {Object} params - 查询参数
 * @param {string} params.filter - 筛选条件(all/signed/unsigned)
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 */
export const getParticipants = (activityId, params) => {
  return request.get(`/edu/activity/participants/${activityId}`, params);
};

/**
 * 获取待审核人员列表
 * @param {string} activityId - 活动ID
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 */
export const getPendingParticipants = (activityId, params) => {
  return request.get(`/edu/activity/pending/${activityId}`, params);
};

/**
 * 审核报名（批量录取）
 * @param {Object} data - 审核信息
 * @param {string|Array} data.participantIds - 参与记录ID列表
 */
export const approveParticipants = (data) => {
  return request.post("/edu/activity/approve", data);
};

/**
 * 结束活动
 * @param {Object} data - 结束信息
 * @param {number} data.activityId - 活动ID
 * @param {string} data.finishNote - 结束备注(可选)
 */
export const finishActivity = (data) => {
  return request.post("/edu/activity/finish", data);
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

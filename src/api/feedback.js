/**
 * 意见反馈相关接口
 */
import request from "@/utils/request";

/**
 * 获取反馈列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.status - 状态(可选)
 */
export const getFeedbackList = (params) => {
  return request.get("/edu/feedback/miniprogram", params);
};

/**
 * 提交反馈
 * @param {Object} data - 反馈信息
 * @param {string} data.feedbackType - 反馈类型
 * @param {string} data.content - 反馈内容
 * @param {Array} data.images - 图片数组(可选)
 * @param {string} data.contactInfo - 联系方式(可选)
 */
export const submitFeedback = (data) => {
  return request.post("/edu/feedback/submit", data);
};

/**
 * 追加反馈
 * @param {Object} data - 追加信息
 * @param {string} data.feedbackId - 反馈ID
 * @param {string} data.content - 追加内容
 * @param {Array} data.images - 图片数组(可选)
 */
export const appendFeedback = (data) => {
  return request.post("/edu/feedback/append", data);
};

/**
 * 撤销反馈
 * @param {Object} data - 撤销信息
 * @param {string} data.feedbackId - 反馈ID
 */
export const withdrawFeedback = (data) => {
  return request.post("/edu/feedback/withdraw", data);
};

/**
 * 获取反馈进度
 * @param {string} feedbackId - 反馈ID
 */
export const getFeedbackProgress = (feedbackId) => {
  return request.get(`/edu/feedback/progress/${feedbackId}`);
};

/**
 * 获取反馈状态映射
 */
export const getFeedbackStatusMap = () => {
  return request.get("/edu/feedback/status/map");
};

/**
 * 获取反馈列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getFeedbackListAdmin = (params) => {
  return request.get("/edu/feedback/list", params);
};

/**
 * 获取反馈详情
 * @param {string} feedbackId - 反馈ID
 */
export const getFeedbackDetail = (feedbackId) => {
  return request.get(`/edu/feedback/${feedbackId}`);
};

/**
 * 创建反馈
 * @param {Object} data - 反馈信息
 */
export const createFeedback = (data) => {
  return request.post("/edu/feedback", data);
};

/**
 * 更新反馈
 * @param {Object} data - 反馈信息
 */
export const updateFeedback = (data) => {
  return request.put("/edu/feedback", data);
};

/**
 * 删除反馈
 * @param {string} feedbackIds - 反馈ID(多个用逗号分隔)
 */
export const deleteFeedback = (feedbackIds) => {
  return request.delete(`/edu/feedback/${feedbackIds}`);
};

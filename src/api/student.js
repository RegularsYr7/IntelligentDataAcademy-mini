/**
 * 学生管理相关接口
 */
import request from "@/utils/request";

/**
 * 学生登录(账号密码)
 * @param {Object} data - 登录信息
 * @param {string} data.studentNo - 学号
 * @param {string} data.password - 密码
 * @returns {Promise} 返回完整响应（包含 token）
 */
export const login = (data) => {
  return request.post("/edu/student/login", data, { rawResponse: true });
};

/**
 * 微信登录
 * @param {Object} data - 登录参数
 * @param {string} data.wxCode - 微信登录code
 * @param {string} data.phoneCode - 手机号授权code
 * @returns {Promise} 返回完整响应（包含 token）
 */
export const loginByWechat = (data) => {
  return request.post(`/edu/student/loginByWechat`, data, {
    rawResponse: true,
  });
};

/**
 * 绑定手机号
 * @param {Object} data - 手机号信息
 * @param {string} data.phone - 手机号
 * @param {string} data.code - 验证码
 */
export const bindPhone = (data) => {
  return request.post("/edu/student/bindPhone", data);
};

/**
 * 更新个人资料
 * @param {Object} data - 个人资料
 * @param {string} data.avatar - 头像URL
 * @param {string} data.nickname - 昵称
 * @param {string} data.gender - 性别
 * @param {string} data.signature - 个性签名
 */
export const updateProfile = (data) => {
  return request.post("/edu/student/updateProfile", data);
};

/**
 * 修改密码
 * @param {Object} data - 密码信息
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 */
export const updatePassword = (data) => {
  return request.post("/edu/student/updatePassword", data);
};

/**
 * 获取我的活动（基于 token 自动识别当前学生）
 * @param {Object} params - 可选筛选参数
 * @param {number} params.currentStatus - 活动状态过滤（可选）
 */
export const getMyActivities = (params = {}) => {
  return request.post("/edu/student/myActivities", params);
};

/**
 * 获取我的组织（基于 token 自动识别当前学生）
 * @param {Object} params - 可选筛选参数
 */
export const getMyOrganizations = (params = {}) => {
  return request.post("/edu/student/myOrganizations", params);
};

/**
 * 获取我的成长记录（基于 token 自动识别当前学生）
 * @param {Object} params - 请求参数
 * @param {string} params.recordType - 记录类型 (可选)
 */
export const getMyGrowthRecords = (params = {}) => {
  return request.post("/edu/student/myGrowthRecords", params);
};

/**
 * 获取学生详情
 * @param {string} studentId - 学生ID
 */
export const getStudentDetail = (studentId) => {
  return request.get(`/edu/student/${studentId}`);
};

/**
 * 获取当前登录学生信息（基于 token 识别身份）
 * @returns {Promise} 学生完整信息
 */
export const getStudentInfo = () => {
  return request.get("/edu/student/getStudentInfo");
};

/**
 * 获取学生列表
 * @param {Object} params - 查询参数
 */
export const getStudentList = (params) => {
  return request.get("/edu/student/list", params);
};

/**
 * 检查本月头像修改次数
 * @returns {Promise} 返回 { used: 已使用次数, remaining: 剩余次数, total: 总次数 }
 */
export const checkMonthlyAvatarChanges = () => {
  return request.get("/edu/student/checkMonthlyAvatarChanges");
};

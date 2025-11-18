/**
 * 签到管理相关接口
 */
import request from "@/utils/request";

// ==================== 签到任务相关 ====================

/**
 * 获取当前签到任务
 */
export const getCurrentTask = () => {
  return request.get("/edu/task/current");
};

/**
 * 验证签到位置
 * @param {Object} data - 位置信息
 * @param {string} data.taskId - 任务ID
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 */
export const validateLocation = (data) => {
  return request.post("/edu/task/validateLocation", data);
};

/**
 * 获取签到任务列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 */
export const getTaskList = (params) => {
  return request.get("/edu/task/list", params);
};

/**
 * 获取签到任务详情
 * @param {string} taskId - 任务ID
 */
export const getTaskDetail = (taskId) => {
  return request.get(`/edu/task/${taskId}`);
};

/**
 * 创建签到任务
 * @param {Object} data - 任务信息
 * @param {string} data.taskName - 任务名称
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @param {number} data.latitude - 纬度(可选)
 * @param {number} data.longitude - 经度(可选)
 * @param {number} data.range - 签到范围(米,可选)
 */
export const createTask = (data) => {
  return request.post("/edu/task", data);
};

/**
 * 更新签到任务
 * @param {Object} data - 任务信息
 */
export const updateTask = (data) => {
  return request.put("/edu/task", data);
};

/**
 * 删除签到任务
 * @param {string} taskIds - 任务ID(多个用逗号分隔)
 */
export const deleteTask = (taskIds) => {
  return request.delete(`/edu/task/${taskIds}`);
};

// ==================== 签到记录相关 ====================

/**
 * 提交签到
 * @param {Object} data - 签到信息
 * @param {string} data.taskId - 任务ID
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 */
export const submitCheckin = (data) => {
  return request.post("/edu/record/submit", data);
};

/**
 * 获取我的签到记录
 * @param {Object} params - 查询参数
 */
export const getMyRecords = (params) => {
  return request.get("/edu/record/myRecords", params);
};

/**
 * 获取签到记录列表
 * @param {Object} params - 查询参数
 */
export const getRecordList = (params) => {
  return request.get("/edu/record/list", params);
};

/**
 * 获取签到记录详情
 * @param {string} recordId - 记录ID
 */
export const getRecordDetail = (recordId) => {
  return request.get(`/edu/record/${recordId}`);
};

/**
 * 获取签到统计
 * @param {Object} params - 查询参数
 */
export const getCheckinStatistics = (params) => {
  return request.get("/edu/record/statistics", params);
};

/**
 * 删除签到记录
 * @param {string} recordIds - 记录ID(多个用逗号分隔)
 */
export const deleteRecord = (recordIds) => {
  return request.delete(`/edu/record/${recordIds}`);
};

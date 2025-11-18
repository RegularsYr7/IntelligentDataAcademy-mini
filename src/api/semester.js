/**
 * 学期管理相关接口
 */
import request from "@/utils/request";

/**
 * 获取当前学期
 */
export const getCurrentSemester = () => {
  return request.get("/edu/semester/current");
};

/**
 * 获取学期列表(小程序端)
 * @param {Object} params - 查询参数
 */
export const getSemesterList = (params) => {
  return request.get("/edu/semester/miniprogram", params);
};

/**
 * 获取学期列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getSemesterListAdmin = (params) => {
  return request.get("/edu/semester/list", params);
};

/**
 * 获取学期详情
 * @param {string} semesterId - 学期ID
 */
export const getSemesterDetail = (semesterId) => {
  return request.get(`/edu/semester/${semesterId}`);
};

/**
 * 创建学期
 * @param {Object} data - 学期信息
 * @param {string} data.semesterName - 学期名称
 * @param {string} data.startDate - 开始日期
 * @param {string} data.endDate - 结束日期
 * @param {number} data.totalWeeks - 总周数
 */
export const createSemester = (data) => {
  return request.post("/edu/semester", data);
};

/**
 * 更新学期
 * @param {Object} data - 学期信息
 */
export const updateSemester = (data) => {
  return request.put("/edu/semester", data);
};

/**
 * 删除学期
 * @param {string} semesterIds - 学期ID(多个用逗号分隔)
 */
export const deleteSemester = (semesterIds) => {
  return request.delete(`/edu/semester/${semesterIds}`);
};

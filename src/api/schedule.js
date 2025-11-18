/**
 * 课程表相关接口
 */
import request from "@/utils/request";

/**
 * 获取课程表(小程序端)
 * @param {Object} params - 查询参数
 * @param {string} params.semesterId - 学期ID(可选)
 * @param {number} params.weekNum - 周次(可选)
 */
export const getSchedule = (params) => {
  return request.get("/edu/schedule/miniprogram", params);
};

/**
 * 获取当前周次
 * @param {Object} params - 查询参数
 * @param {number} params.classId - 班级ID(必填)
 */
export const getCurrentWeek = (params) => {
  return request.get("/edu/schedule/currentWeek", params);
};

/**
 * 获取下一节课
 */
export const getNextCourse = () => {
  return request.get("/edu/schedule/nextCourse");
};

/**
 * 获取课程表列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getScheduleList = (params) => {
  return request.get("/edu/schedule/list", params);
};

/**
 * 获取课程表详情
 * @param {string} scheduleId - 课程表ID
 */
export const getScheduleDetail = (scheduleId) => {
  return request.get(`/edu/schedule/${scheduleId}`);
};

/**
 * 创建课程表
 * @param {Object} data - 课程表信息
 * @param {string} data.courseName - 课程名称
 * @param {string} data.teacher - 教师
 * @param {string} data.location - 地点
 * @param {number} data.weekday - 星期几(1-7)
 * @param {number} data.startSection - 开始节次
 * @param {number} data.endSection - 结束节次
 * @param {string} data.weekRange - 周次范围
 */
export const createSchedule = (data) => {
  return request.post("/edu/schedule", data);
};

/**
 * 更新课程表
 * @param {Object} data - 课程表信息
 */
export const updateSchedule = (data) => {
  return request.put("/edu/schedule", data);
};

/**
 * 删除课程表
 * @param {string} scheduleIds - 课程表ID(多个用逗号分隔)
 */
export const deleteSchedule = (scheduleIds) => {
  return request.delete(`/edu/schedule/${scheduleIds}`);
};

/**
 * 量化分记录相关接口
 */
import request from "@/utils/request";

/**
 * 获取量化分记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.studentId - 学生ID(可选)
 * @param {string} params.recordType - 记录类型(可选)
 */
export const getQuantitativeRecordList = (params) => {
  return request.get("/edu/quantitative/list", params);
};

/**
 * 获取量化分记录详情
 * @param {string} recordId - 记录ID
 */
export const getQuantitativeRecordDetail = (recordId) => {
  return request.get(`/edu/quantitative/${recordId}`);
};

/**
 * 创建量化分记录
 * @param {Object} data - 记录信息
 * @param {string} data.studentId - 学生ID
 * @param {string} data.recordType - 记录类型
 * @param {number} data.score - 分数
 * @param {string} data.reason - 原因
 */
export const createQuantitativeRecord = (data) => {
  return request.post("/edu/quantitative", data);
};

/**
 * 更新量化分记录
 * @param {Object} data - 记录信息
 */
export const updateQuantitativeRecord = (data) => {
  return request.put("/edu/quantitative", data);
};

/**
 * 删除量化分记录
 * @param {string} recordIds - 记录ID(多个用逗号分隔)
 */
export const deleteQuantitativeRecord = (recordIds) => {
  return request.delete(`/edu/quantitative/${recordIds}`);
};

/**
 * 地图地标相关接口
 */
import request from "@/utils/request";

/**
 * 获取地标列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.landmarkName - 地标名称(可选)
 * @param {string} params.category - 类别(可选)
 */
export const getLandmarkList = (params) => {
  return request.get("/edu/landmark/miniprogram", params);
};

/**
 * 获取地标列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getLandmarkListAdmin = (params) => {
  return request.get("/edu/landmark/list", params);
};

/**
 * 获取地标详情
 * @param {string} landmarkId - 地标ID
 */
export const getLandmarkDetail = (landmarkId) => {
  return request.get(`/edu/landmark/${landmarkId}`);
};

/**
 * 创建地标
 * @param {Object} data - 地标信息
 * @param {string} data.landmarkName - 地标名称
 * @param {string} data.category - 类别
 * @param {number} data.latitude - 纬度
 * @param {number} data.longitude - 经度
 * @param {string} data.description - 描述(可选)
 * @param {string} data.image - 图片(可选)
 */
export const createLandmark = (data) => {
  return request.post("/edu/landmark", data);
};

/**
 * 更新地标
 * @param {Object} data - 地标信息
 */
export const updateLandmark = (data) => {
  return request.put("/edu/landmark", data);
};

/**
 * 删除地标
 * @param {string} landmarkIds - 地标ID(多个用逗号分隔)
 */
export const deleteLandmark = (landmarkIds) => {
  return request.delete(`/edu/landmark/${landmarkIds}`);
};

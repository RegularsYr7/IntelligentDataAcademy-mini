/**
 * 失物招领相关接口
 */
import request from "@/utils/request";

/**
 * 获取失物招领列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.itemType - 物品类型(可选: lost/found)
 * @param {string} params.tag - 标签(可选)
 */
export const getLostFoundList = (params) => {
  return request.get("/edu/found/miniprogram", params);
};

/**
 * 获取失物招领详情
 * @param {string} id - 失物ID
 */
export const getLostFoundDetail = (id) => {
  return request.get(`/edu/found/detail/${id}`);
};

/**
 * 提交失物招领
 * @param {Object} data - 失物信息
 * @param {string} data.itemType - 物品类型(lost/found)
 * @param {string} data.itemName - 物品名称
 * @param {string} data.description - 描述
 * @param {string} data.lostTime - 丢失/拾取时间
 * @param {string} data.location - 地点
 * @param {Array} data.images - 图片数组(可选)
 * @param {string} data.tag - 标签(可选)
 * @param {string} data.contactInfo - 联系方式
 */
export const submitLostFound = (data) => {
  return request.post("/edu/found/submit", data);
};

/**
 * 标记为已解决
 * @param {Object} data - 标记信息
 * @param {string} data.itemId - 失物ID
 */
export const markResolved = (data) => {
  return request.post("/edu/found/markResolved", data);
};

/**
 * 获取失物标签映射
 */
export const getLostFoundTagsMap = () => {
  return request.get("/edu/found/tags/map");
};

/**
 * 获取失物招领列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getLostFoundListAdmin = (params) => {
  return request.get("/edu/found/list", params);
};

/**
 * 获取失物招领详情(管理端)
 * @param {string} itemId - 失物ID
 */
export const getLostFoundDetailAdmin = (itemId) => {
  return request.get(`/edu/found/${itemId}`);
};

/**
 * 创建失物招领
 * @param {Object} data - 失物信息
 */
export const createLostFound = (data) => {
  return request.post("/edu/found", data);
};

/**
 * 更新失物招领
 * @param {Object} data - 失物信息
 */
export const updateLostFound = (data) => {
  return request.put("/edu/found", data);
};

/**
 * 删除失物招领
 * @param {string} itemIds - 失物ID(多个用逗号分隔)
 */
export const deleteLostFound = (itemIds) => {
  return request.delete(`/edu/found/${itemIds}`);
};

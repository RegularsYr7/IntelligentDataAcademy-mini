/**
 * 风采展示相关接口
 */
import request from "@/utils/request";

/**
 * 获取风采展示列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.showcaseType - 展示类型(可选)
 */
export const getShowcaseList = (params) => {
  return request.get("/edu/showcase/miniprogram", params);
};

/**
 * 获取风采展示详情
 * @param {string} id - 展示ID
 */
export const getShowcaseDetail = (id) => {
  return request.get(`/edu/showcase/detail/${id}`);
};

/**
 * 获取风采展示类型映射
 */
export const getShowcaseTypesMap = () => {
  return request.get("/edu/showcase/types/map");
};

/**
 * 获取风采展示列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getShowcaseListAdmin = (params) => {
  return request.get("/edu/showcase/list", params);
};

/**
 * 获取风采展示详情(管理端)
 * @param {string} showcaseId - 展示ID
 */
export const getShowcaseDetailAdmin = (showcaseId) => {
  return request.get(`/edu/showcase/${showcaseId}`);
};

/**
 * 创建风采展示
 * @param {Object} data - 展示信息
 * @param {string} data.showcaseType - 展示类型
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {Array} data.images - 图片数组
 */
export const createShowcase = (data) => {
  return request.post("/edu/showcase", data);
};

/**
 * 更新风采展示
 * @param {Object} data - 展示信息
 */
export const updateShowcase = (data) => {
  return request.put("/edu/showcase", data);
};

/**
 * 删除风采展示
 * @param {string} showcaseIds - 展示ID(多个用逗号分隔)
 */
export const deleteShowcase = (showcaseIds) => {
  return request.delete(`/edu/showcase/${showcaseIds}`);
};

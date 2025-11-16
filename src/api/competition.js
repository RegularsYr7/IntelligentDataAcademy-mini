/**
 * 竞赛相关API
 */
import request from "@/utils/request";

/**
 * 获取竞赛列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.category - 分类
 * @param {string} params.status - 状态(upcoming/ongoing/ended)
 * @returns {Promise} 返回竞赛列表
 */
export const getCompetitionList = (params) => {
  return request.get("/api/competition/list", params);
};

/**
 * 获取竞赛详情
 * @param {number|string} id - 竞赛ID
 * @returns {Promise} 返回竞赛详细信息
 */
export const getCompetitionDetail = (id) => {
  return request.get(`/api/competition/${id}`);
};

/**
 * 获取热门推荐竞赛
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 返回数量
 * @returns {Promise} 返回热门竞赛列表
 */
export const getHotCompetitions = (params) => {
  return request.get("/api/competition/hot", params);
};

/**
 * 获取最新竞赛
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 返回数量
 * @returns {Promise} 返回最新竞赛列表
 */
export const getNewCompetitions = (params) => {
  return request.get("/api/competition/new", params);
};

/**
 * 收藏竞赛
 * @param {number|string} id - 竞赛ID
 * @returns {Promise}
 */
export const collectCompetition = (id) => {
  return request.post(`/api/competition/${id}/collect`);
};

/**
 * 取消收藏竞赛
 * @param {number|string} id - 竞赛ID
 * @returns {Promise}
 */
export const uncollectCompetition = (id) => {
  return request.delete(`/api/competition/${id}/collect`);
};

/**
 * 搜索竞赛
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回搜索结果
 */
export const searchCompetition = (params) => {
  return request.get("/api/competition/search", params);
};

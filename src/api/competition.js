/**
 * 竞赛信息相关接口
 */
import request from "@/utils/request";

/**
 * 获取竞赛列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.competitionName - 竞赛名称(可选)
 * @param {string} params.category - 竞赛类别(可选)
 */
export const getCompetitionList = (params) => {
  return request.get("/edu/competition/miniprogram", params);
};

/**
 * 获取竞赛详情
 * @param {string} id - 竞赛ID
 */
export const getCompetitionDetail = (id) => {
  return request.get(`/edu/competition/detail/${id}`);
};

/**
 * 获取竞赛类别映射
 */
export const getCompetitionCategoriesMap = () => {
  return request.get("/edu/competition/categories/map");
};

/**
 * 获取竞赛列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getCompetitionListAdmin = (params) => {
  return request.get("/edu/competition/list", params);
};

/**
 * 获取竞赛详情(管理端)
 * @param {string} competitionId - 竞赛ID
 */
export const getCompetitionDetailAdmin = (competitionId) => {
  return request.get(`/edu/competition/${competitionId}`);
};

/**
 * 创建竞赛
 * @param {Object} data - 竞赛信息
 * @param {string} data.competitionName - 竞赛名称
 * @param {string} data.category - 竞赛类别
 * @param {string} data.description - 竞赛描述
 * @param {string} data.registrationStartTime - 报名开始时间
 * @param {string} data.registrationEndTime - 报名结束时间
 * @param {string} data.competitionStartTime - 竞赛开始时间
 * @param {string} data.competitionEndTime - 竞赛结束时间
 */
export const createCompetition = (data) => {
  return request.post("/edu/competition", data);
};

/**
 * 更新竞赛
 * @param {Object} data - 竞赛信息
 */
export const updateCompetition = (data) => {
  return request.put("/edu/competition", data);
};

/**
 * 删除竞赛
 * @param {string} competitionIds - 竞赛ID(多个用逗号分隔)
 */
export const deleteCompetition = (competitionIds) => {
  return request.delete(`/edu/competition/${competitionIds}`);
};

/**
 * 社区问答相关API
 */
import request from "@/utils/request";

/**
 * 获取问答列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.sort - 排序方式(hot/new/recommend)
 * @returns {Promise} 返回问答列表
 */
export const getQaList = (params) => {
  return request.get("/api/qa/list", params);
};

/**
 * 获取问答详情
 * @param {number|string} id - 问答ID
 * @returns {Promise} 返回问答详细信息
 */
export const getQaDetail = (id) => {
  return request.get(`/api/qa/${id}`);
};

/**
 * 发布问答
 * @param {Object} data - 问答数据
 * @param {string} data.content - 内容
 * @param {Array<string>} data.images - 图片URL数组
 * @param {Array<string>} data.tags - 标签数组
 * @returns {Promise} 返回新发布的问答信息
 */
export const publishQa = (data) => {
  return request.post("/api/qa", data);
};

/**
 * 删除问答
 * @param {number|string} id - 问答ID
 * @returns {Promise}
 */
export const deleteQa = (id) => {
  return request.delete(`/api/qa/${id}`);
};

/**
 * 点赞问答
 * @param {number|string} id - 问答ID
 * @returns {Promise}
 */
export const likeQa = (id) => {
  return request.post(`/api/qa/${id}/like`);
};

/**
 * 取消点赞问答
 * @param {number|string} id - 问答ID
 * @returns {Promise}
 */
export const unlikeQa = (id) => {
  return request.delete(`/api/qa/${id}/like`);
};

/**
 * 获取问答评论列表
 * @param {number|string} id - 问答ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回评论列表
 */
export const getQaComments = (id, params) => {
  return request.get(`/api/qa/${id}/comments`, params);
};

/**
 * 评论问答
 * @param {number|string} id - 问答ID
 * @param {Object} data - 评论数据
 * @param {string} data.content - 评论内容
 * @param {number|string} data.replyTo - 回复的评论ID(可选)
 * @returns {Promise} 返回新发布的评论信息
 */
export const commentQa = (id, data) => {
  return request.post(`/api/qa/${id}/comments`, data);
};

/**
 * 删除评论
 * @param {number|string} qaId - 问答ID
 * @param {number|string} commentId - 评论ID
 * @returns {Promise}
 */
export const deleteComment = (qaId, commentId) => {
  return request.delete(`/api/qa/${qaId}/comments/${commentId}`);
};

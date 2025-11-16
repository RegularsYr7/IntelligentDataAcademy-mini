/**
 * 商品相关API
 */
import request from "@/utils/request";

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.category - 分类
 * @param {string} params.sort - 排序方式(price_asc/price_desc/time_desc)
 * @returns {Promise} 返回商品列表
 */
export const getGoodsList = (params) => {
  return request.get("/api/goods/list", params);
};

/**
 * 获取商品详情
 * @param {number|string} id - 商品ID
 * @returns {Promise} 返回商品详细信息
 */
export const getGoodsDetail = (id) => {
  return request.get(`/api/goods/${id}`);
};

/**
 * 发布商品
 * @param {Object} data - 商品数据
 * @param {string} data.title - 商品标题
 * @param {string} data.description - 商品描述
 * @param {number} data.price - 价格
 * @param {string} data.category - 分类
 * @param {Array<string>} data.images - 图片URL数组
 * @returns {Promise} 返回新发布的商品信息
 */
export const publishGoods = (data) => {
  return request.post("/api/goods", data);
};

/**
 * 更新商品信息
 * @param {number|string} id - 商品ID
 * @param {Object} data - 商品数据
 * @returns {Promise} 返回更新后的商品信息
 */
export const updateGoods = (id, data) => {
  return request.put(`/api/goods/${id}`, data);
};

/**
 * 删除商品
 * @param {number|string} id - 商品ID
 * @returns {Promise}
 */
export const deleteGoods = (id) => {
  return request.delete(`/api/goods/${id}`);
};

/**
 * 获取我的商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.status - 状态(onsale/sold/offsale)
 * @returns {Promise} 返回我的商品列表
 */
export const getMyGoods = (params) => {
  return request.get("/api/goods/my", params);
};

/**
 * 收藏商品
 * @param {number|string} id - 商品ID
 * @returns {Promise}
 */
export const collectGoods = (id) => {
  return request.post(`/api/goods/${id}/collect`);
};

/**
 * 取消收藏商品
 * @param {number|string} id - 商品ID
 * @returns {Promise}
 */
export const uncollectGoods = (id) => {
  return request.delete(`/api/goods/${id}/collect`);
};

/**
 * 获取收藏的商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回收藏商品列表
 */
export const getCollectGoods = (params) => {
  return request.get("/api/goods/collect", params);
};

/**
 * 搜索商品
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回搜索结果
 */
export const searchGoods = (params) => {
  return request.get("/api/goods/search", params);
};

/**
 * 上架商品
 * @param {number|string} id - 商品ID
 * @returns {Promise}
 */
export const onSaleGoods = (id) => {
  return request.put(`/api/goods/${id}/onsale`);
};

/**
 * 下架商品
 * @param {number|string} id - 商品ID
 * @returns {Promise}
 */
export const offSaleGoods = (id) => {
  return request.put(`/api/goods/${id}/offsale`);
};

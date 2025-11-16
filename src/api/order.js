/**
 * 订单相关API
 */
import request from "@/utils/request";

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @param {number|string} data.goodsId - 商品ID
 * @param {number|string} data.addressId - 地址ID
 * @param {string} data.remark - 备注
 * @returns {Promise} 返回订单信息
 */
export const createOrder = (data) => {
  return request.post("/api/order", data);
};

/**
 * 获取订单详情
 * @param {number|string} id - 订单ID
 * @returns {Promise} 返回订单详细信息
 */
export const getOrderDetail = (id) => {
  return request.get(`/api/order/${id}`);
};

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 订单状态(unpaid/paid/shipped/finished/cancelled)
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回订单列表
 */
export const getOrderList = (params) => {
  return request.get("/api/order/list", params);
};

/**
 * 支付订单
 * @param {number|string} id - 订单ID
 * @param {Object} data - 支付数据
 * @param {string} data.paymentMethod - 支付方式(wechat/alipay)
 * @returns {Promise} 返回支付信息
 */
export const payOrder = (id, data) => {
  return request.post(`/api/order/${id}/pay`, data);
};

/**
 * 取消订单
 * @param {number|string} id - 订单ID
 * @param {Object} data - 取消原因
 * @param {string} data.reason - 取消原因
 * @returns {Promise}
 */
export const cancelOrder = (id, data) => {
  return request.post(`/api/order/${id}/cancel`, data);
};

/**
 * 确认收货
 * @param {number|string} id - 订单ID
 * @returns {Promise}
 */
export const confirmOrder = (id) => {
  return request.post(`/api/order/${id}/confirm`);
};

/**
 * 删除订单
 * @param {number|string} id - 订单ID
 * @returns {Promise}
 */
export const deleteOrder = (id) => {
  return request.delete(`/api/order/${id}`);
};

/**
 * 申请退款
 * @param {number|string} id - 订单ID
 * @param {Object} data - 退款数据
 * @param {string} data.reason - 退款原因
 * @param {Array<string>} data.images - 凭证图片
 * @returns {Promise}
 */
export const refundOrder = (id, data) => {
  return request.post(`/api/order/${id}/refund`, data);
};

/**
 * 评价订单
 * @param {number|string} id - 订单ID
 * @param {Object} data - 评价数据
 * @param {number} data.rating - 评分(1-5)
 * @param {string} data.content - 评价内容
 * @param {Array<string>} data.images - 评价图片
 * @returns {Promise}
 */
export const reviewOrder = (id, data) => {
  return request.post(`/api/order/${id}/review`, data);
};

/**
 * 地址相关API
 */
import request from "@/utils/request";

/**
 * 获取地址列表
 * @returns {Promise} 返回地址列表
 */
export const getAddressList = () => {
  return request.get("/api/address/list");
};

/**
 * 获取地址详情
 * @param {number|string} id - 地址ID
 * @returns {Promise} 返回地址详细信息
 */
export const getAddressDetail = (id) => {
  return request.get(`/api/address/${id}`);
};

/**
 * 添加地址
 * @param {Object} data - 地址数据
 * @param {string} data.name - 收货人姓名
 * @param {string} data.phone - 收货人电话
 * @param {string} data.province - 省份
 * @param {string} data.city - 城市
 * @param {string} data.district - 区县
 * @param {string} data.detail - 详细地址
 * @param {boolean} data.isDefault - 是否默认地址
 * @returns {Promise} 返回新添加的地址信息
 */
export const addAddress = (data) => {
  return request.post("/api/address", data);
};

/**
 * 更新地址
 * @param {number|string} id - 地址ID
 * @param {Object} data - 地址数据
 * @returns {Promise} 返回更新后的地址信息
 */
export const updateAddress = (id, data) => {
  return request.put(`/api/address/${id}`, data);
};

/**
 * 删除地址
 * @param {number|string} id - 地址ID
 * @returns {Promise}
 */
export const deleteAddress = (id) => {
  return request.delete(`/api/address/${id}`);
};

/**
 * 设置默认地址
 * @param {number|string} id - 地址ID
 * @returns {Promise}
 */
export const setDefaultAddress = (id) => {
  return request.put(`/api/address/${id}/default`);
};

/**
 * 获取默认地址
 * @returns {Promise} 返回默认地址信息
 */
export const getDefaultAddress = () => {
  return request.get("/api/address/default");
};

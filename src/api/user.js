/**
 * 用户相关API
 */
import request from "@/utils/request";

/**
 * 用户登录(账号密码)
 * @param {Object} data - 登录数据
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} 返回用户信息和token
 */
export const login = (data) => {
  return request.post("/api/user/login", data);
};

/**
 * 微信手机号登录
 * @param {Object} data - 登录数据
 * @param {string} data.code - wx.login获取的code
 * @param {string} data.encryptedData - 加密数据
 * @param {string} data.iv - 加密算法初始向量
 * @returns {Promise} 返回用户信息和token
 */
export const wechatPhoneLogin = (data) => {
  return request.post("/api/user/wechat-phone-login", data);
};

/**
 * 绑定微信手机号
 * @param {Object} data - 绑定数据
 * @param {string} data.code - wx.login获取的code
 * @param {string} data.encryptedData - 加密数据
 * @param {string} data.iv - 加密算法初始向量
 * @returns {Promise} 返回绑定结果
 */
export const bindWechatPhone = (data) => {
  return request.post("/api/user/bind-wechat-phone", data);
};

/**
 * 模拟登录(开发环境)
 * @returns {Promise} 返回模拟用户信息和token
 */
export const mockLogin = () => {
  return request.post("/api/user/mock-login");
};

/**
 * 获取用户信息
 * @returns {Promise} 返回用户详细信息
 */
export const getUserInfo = () => {
  return request.get("/api/user/info");
};

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @param {string} data.nickname - 昵称
 * @param {string} data.avatar - 头像URL
 * @param {string} data.bio - 个人简介
 * @returns {Promise} 返回更新后的用户信息
 */
export const updateUserInfo = (data) => {
  return request.put("/api/user/info", data);
};

/**
 * 退出登录
 * @returns {Promise}
 */
export const logout = () => {
  return request.post("/api/user/logout");
};

/**
 * 修改密码
 * @param {Object} data - 密码数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise}
 */
export const changePassword = (data) => {
  return request.put("/api/user/password", data);
};

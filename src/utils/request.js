/**
 * 网络请求封装模块
 * 基于 uni.request 封装,统一处理请求、响应、错误
 */

/**
import request from '@/utils/request'

// GET 请求
const data = await request.get('/api/users', { page: 1 })

// POST 请求(关闭加载提示)
await request.post('/api/login', { username, password }, { loading: false })

// 上传图片
const url = await request.upload('/api/upload', filePath)

 */

// 配置项
const config = {
  baseURL: import.meta.env.VITE_APP_BASE_URL || "http://localhost:8081",
  // baseURL: import.meta.env.VITE_APP_BASE_URL,

  // 请求超时时间(ms)
  timeout: 25000,

  // 请求头
  header: {
    "Content-Type": "application/json",
  },
};

/**
 * 请求拦截器
 * @param {Object} options 请求配置
 * @returns {Object} 处理后的配置
 */
const requestInterceptor = (options) => {
  // 自动添加token
  const token = uni.getStorageSync("userToken");
  if (token) {
    options.header = {
      ...options.header,
      Authorization: `Bearer ${token}`,
    };
  }



  // 打印请求日志(开发环境)
  if (process.env.NODE_ENV === "development") {
    console.log(`[REQUEST] ${options.method} ${options.url}`);
    console.log("[REQUEST DATA]", options.data);
  }

  return options;
};

/**
 * 响应拦截器
 * @param {Object} response 响应数据
 * @returns {Promise} 处理后的数据或错误
 */
const responseInterceptor = (response, options) => {
  // 隐藏加载提示
  if (options.loading !== false) {
    ;
  }

  const { statusCode, data } = response;

  // HTTP状态码处理
  if (statusCode === 200) {
    // 业务状态码处理
    if (data.code === 200) {
      // 如果需要完整响应（用于登录等需要获取 token 的场景）
      if (options.rawResponse) {
        return Promise.resolve(data);
      }

      // 如果 data 有 data 字段，返回 data.data
      // 否则返回整个 data 对象（兼容分页数据格式 {total, rows, code, msg}）
      if (data.data !== undefined) {
        return Promise.resolve(data.data);
      } else {
        // 返回除了 code 和 msg 之外的数据
        const { code, msg, ...rest } = data;
        return Promise.resolve(rest);
      }
    } else {
      // 业务错误处理
      return handleBusinessError(data, options);
    }
  } else {
    // HTTP错误处理
    return handleHttpError(statusCode, options);
  }
};

/**
 * 处理业务错误
 * @param {Object} data 响应数据
 * @param {Object} options 请求配置
 */
const handleBusinessError = (data, options) => {
  const errorMsg = data.msg || "请求失败";

  // 特殊错误码处理
  switch (data.code) {
    case 401:
      // 未登录或token失效
      handleUnauthorized();
      break;
    case 403:
      // 无权限
      if (options.showError !== false) {
        uni.showToast({
          title: "无权限访问",
          icon: "none",
        });
      }
      break;
    default:
      // 通用错误提示
      if (options.showError !== false) {
        uni.showToast({
          title: errorMsg,
          icon: "none",
          duration: 5000,
        });
      }
  }

  return Promise.reject({ code: data.code, message: errorMsg });
};

/**
 * 处理HTTP错误
 * @param {Number} statusCode HTTP状态码
 * @param {Object} options 请求配置
 */
const handleHttpError = (statusCode, options) => {
  let errorMsg = "网络错误";

  switch (statusCode) {
    case 400:
      errorMsg = "请求参数错误";
      break;
    case 401:
      errorMsg = "未授权,请登录";
      handleUnauthorized();
      break;
    case 403:
      errorMsg = "禁止访问";
      break;
    case 404:
      errorMsg = "请求地址不存在";
      break;
    case 500:
      errorMsg = "服务器错误";
      break;
    case 502:
      errorMsg = "网关错误";
      break;
    case 503:
      errorMsg = "服务不可用";
      break;
    case 504:
      errorMsg = "网关超时";
      break;
    default:
      errorMsg = `网络错误 (${statusCode})`;
  }

  if (options.showError !== false) {
    uni.showToast({
      title: errorMsg,
      icon: "none",
    });
  }

  return Promise.reject({ code: statusCode, message: errorMsg });
};

/**
 * 处理未授权(401)
 * 清除token并跳转到登录页
 */
const handleUnauthorized = () => {
  // 如果已经在显示登录提示,直接返回,防止并发请求时多次弹窗
  if (isShowingAuthModal) {
    return;
  }

  // 设置标志,防止重复弹窗
  isShowingAuthModal = true;

  // 清除本地存储
  uni.removeStorageSync("userToken");
  uni.removeStorageSync("userInfo");
  uni.removeStorageSync("schedule_data_cache");

  uni.showModal({
    title: '登录提醒',
    content: '需要先登录才能继续操作哦～点击"确定"跳转登录页',
    confirmText: '确定登录',
    cancelText: '取消',
    success: (res) => {
      // 用户操作完成后重置标志
      resetAuthModalFlag();

      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/login/login',
          fail: () => uni.reLaunch({ url: '/pages/login/login' })
        });
      }
    },
    fail: () => {
      // 弹窗失败也要重置标志
      resetAuthModalFlag();
    }
  });
};

// 防止重复弹窗的标志
let isShowingAuthModal = false;

/**
 * 重置未授权弹窗标志
 * 用于处理401时防止多次弹窗
 */
const resetAuthModalFlag = () => {
  isShowingAuthModal = false;
};

/**
 * 核心请求方法
 * @param {Object} options 请求配置
 * @returns {Promise} 返回Promise对象
 */
const request = (options) => {
  // 合并默认配置
  options = {
    ...config,
    ...options,
    url: options.url.startsWith("http")
      ? options.url
      : config.baseURL + options.url,
    header: {
      ...config.header,
      ...options.header,
    },
  };

  // 请求拦截
  options = requestInterceptor(options);

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (response) => {
        // 响应拦截
        responseInterceptor(response, options).then(resolve).catch(reject);
      },
      fail: (error) => {
        // 隐藏加载提示
        if (options.loading !== false) {
          ;
        }

        // 网络错误处理
        const errorMsg = error.errMsg || "网络连接失败";

        if (options.showError !== false) {
          uni.showToast({
            title: errorMsg,
            icon: "none",
          });
        }

        if (process.env.NODE_ENV === "development") {
          console.error("[REQUEST ERROR]", error);
        }

        reject({ code: -1, message: errorMsg });
      },
    });
  });
};

/**
 * GET 请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 额外配置
 */
const get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: "GET",
    data: params,
    ...options,
  });
};

/**
 * POST 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 额外配置
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "POST",
    data,
    ...options,
  });
};

/**
 * PUT 请求
 * @param {String} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 额外配置
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: "PUT",
    data,
    ...options,
  });
};

/**
 * DELETE 请求
 * @param {String} url 请求地址
 * @param {Object} params 请求参数
 * @param {Object} options 额外配置
 */
const del = (url, params = {}, options = {}) => {
  return request({
    url,
    method: "DELETE",
    data: params,
    ...options,
  });
};

/**
 * 上传文件
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {Object} data 额外数据
 * @param {Object} options 额外配置
 */
const upload = (url, filePath, data = {}, options = {}) => {
  const token = uni.getStorageSync("userToken");

  return new Promise((resolve, reject) => {
    const uploadUrl = url.startsWith("http") ? url : config.baseURL + url;

    console.log("[上传] URL:", uploadUrl);
    console.log("[上传] 文件路径:", filePath);
    console.log("[上传] 额外数据:", data);

    // 检查文件路径是否有效
    if (!filePath) {
      console.error("[上传] 文件路径为空");
      reject({ errMsg: "文件路径为空" });
      return;
    }

    uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: options.name || "file",
      formData: data,
      header: {
        Authorization: `Bearer ${token}`,
        ...options.header,
      },
      success: (response) => {
        console.log("[上传] 响应状态码:", response.statusCode);
        console.log("[上传] 响应数据:", response.data);

        try {
          const data = JSON.parse(response.data);
          if (data.code === 200) {
            // 如果有 data.data，返回 data.data
            if (data.data !== undefined) {
              resolve(data.data);
            } else {
              // 否则返回除了 code 和 msg 之外的数据
              const { code, msg, message, ...rest } = data;

              // 如果 url 不是完整地址，拼接 baseURL
              if (rest.url && !rest.url.startsWith("http")) {
                rest.url = config.baseURL + rest.url;
              }

              resolve(rest);
            }
          } else {
            const errorMsg = data.msg || data.message || "上传失败";
            console.error("[上传] 业务错误:", errorMsg);
            uni.showToast({
              title: errorMsg,
              icon: "none",
            });
            reject(data);
          }
        } catch (error) {
          console.error("[上传] 解析响应失败:", error);
          reject(error);
        }
      },
      fail: (error) => {
        console.error("[上传] 上传失败:", error);
        uni.showToast({
          title: error.errMsg || "上传失败",
          icon: "none",
        });
        reject(error);
      },
    });
  });
};

/**
 * 下载文件
 * @param {String} url 下载地址
 * @param {Object} options 额外配置
 */
const download = (url, options = {}) => {
  const token = uni.getStorageSync("userToken");

  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url: url.startsWith("http") ? url : config.baseURL + url,
      header: {
        Authorization: `Bearer ${token}`,
        ...options.header,
      },
      success: (response) => {
        if (response.statusCode === 200) {
          resolve(response.tempFilePath);
        } else {

          reject(response);
        }
      },
      fail: (error) => {
        uni.showToast({
          title: "下载失败",
          icon: "none",
        });
        reject(error);
      },
    });
  });
};

// 导出
export default {
  request,
  get,
  post,
  put,
  delete: del,
  upload,
  download,
  config, // 暴露配置,方便动态修改
};

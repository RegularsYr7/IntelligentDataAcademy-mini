/**
 * 文件上传相关API
 */
import request from "@/utils/request";

/**
 * 上传单个图片
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<string>} 返回图片URL
 */
export const uploadImage = (filePath) => {
  return request.upload("/api/upload/image", filePath);
};

/**
 * 上传多个图片
 * @param {Array<string>} filePaths - 本地文件路径数组
 * @returns {Promise<Array<string>>} 返回图片URL数组
 */
export const uploadImages = async (filePaths) => {
  const uploadPromises = filePaths.map((filePath) => uploadImage(filePath));
  return Promise.all(uploadPromises);
};

/**
 * 选择并上传单个图片
 * @param {Object} options - 选择图片配置
 * @param {number} options.count - 可选择数量,默认1
 * @param {Array<string>} options.sizeType - 压缩类型,默认['compressed']
 * @param {Array<string>} options.sourceType - 来源,默认['album', 'camera']
 * @returns {Promise<string>} 返回图片URL
 */
export const chooseAndUploadImage = (options = {}) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ["compressed"],
      sourceType: options.sourceType || ["album", "camera"],
      success: async (res) => {
        try {
          const filePath = res.tempFilePaths[0];
          const url = await uploadImage(filePath);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * 选择并上传多个图片
 * @param {Object} options - 选择图片配置
 * @param {number} options.count - 可选择数量,默认9
 * @param {Array<string>} options.sizeType - 压缩类型,默认['compressed']
 * @param {Array<string>} options.sourceType - 来源,默认['album', 'camera']
 * @returns {Promise<Array<string>>} 返回图片URL数组
 */
export const chooseAndUploadImages = (options = {}) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: options.count || 9,
      sizeType: options.sizeType || ["compressed"],
      sourceType: options.sourceType || ["album", "camera"],
      success: async (res) => {
        try {
          const urls = await uploadImages(res.tempFilePaths);
          resolve(urls);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * 上传视频
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<string>} 返回视频URL
 */
export const uploadVideo = (filePath) => {
  return request.upload("/api/upload/video", filePath, {}, { name: "video" });
};

/**
 * 选择并上传视频
 * @param {Object} options - 选择视频配置
 * @param {Array<string>} options.sourceType - 来源,默认['album', 'camera']
 * @param {number} options.maxDuration - 最大时长(秒),默认60
 * @returns {Promise<string>} 返回视频URL
 */
export const chooseAndUploadVideo = (options = {}) => {
  return new Promise((resolve, reject) => {
    uni.chooseVideo({
      sourceType: options.sourceType || ["album", "camera"],
      maxDuration: options.maxDuration || 60,
      success: async (res) => {
        try {
          const url = await uploadVideo(res.tempFilePath);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * 上传文件
 * @param {string} filePath - 本地文件路径
 * @returns {Promise<string>} 返回文件URL
 */
export const uploadFile = (filePath) => {
  return request.upload("/api/upload/file", filePath, {}, { name: "file" });
};

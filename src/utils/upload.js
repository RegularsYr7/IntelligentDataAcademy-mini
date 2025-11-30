/**
 * 图片上传工具
 */
import request from "./request";

// 获取基础URL配置
const BASE_URL = "https://intelligentmini.rainyweb.cn";

// 上传服务器地址
const UPLOAD_URL = `${BASE_URL}/common/upload`;

/**
 * 选择并上传图片
 * @param {Object} options - 配置选项
 * @param {number} options.count - 最多可以选择的图片张数，默认1
 * @param {Array} options.sizeType - original 原图，compressed 压缩图，默认二者都有
 * @param {Array} options.sourceType - album 从相册选图，camera 使用相机，默认二者都有
 * @returns {Promise} 返回上传结果
 */
export const chooseAndUploadImage = (options = {}) => {
  const {
    count = 1,
    sizeType = ["original", "compressed"],
    sourceType = ["album", "camera"],
  } = options;

  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType,
      sourceType,
      success: async (res) => {
        console.log("chooseAndUploadImage 完整响应:", res);

        // 优先使用 tempFiles，如果不存在则使用 tempFilePaths
        let tempFilePath = "";

        if (res.tempFiles && res.tempFiles.length > 0) {
          const file = res.tempFiles[0];
          tempFilePath = file.path || file.tempFilePath || res.tempFilePaths[0];
        } else {
          tempFilePath = res.tempFilePaths[0];
        }

        console.log("准备上传的文件路径:", tempFilePath);

        if (!tempFilePath) {
          reject(new Error("未获取到文件路径"));
          return;
        }

        try {
          // 使用 request.upload 方法上传
          const result = await request.upload(UPLOAD_URL, tempFilePath);
          resolve(result);
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
 * 仅选择图片（不上传）
 * @param {Object} options - 配置选项
 * @param {number} options.count - 最多可以选择的图片张数，默认1
 * @param {Array} options.sizeType - original 原图，compressed 压缩图，默认二者都有
 * @param {Array} options.sourceType - album 从相册选图，camera 使用相机，默认二者都有
 * @returns {Promise<Array>} 返回图片临时文件路径数组
 */
export const chooseImage = (options = {}) => {
  const {
    count = 1,
    sizeType = ["original", "compressed"],
    sourceType = ["album", "camera"],
  } = options;

  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType,
      sourceType,
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
};

/**
 * 上传单个图片文件
 * @param {string} filePath - 要上传的文件路径
 * @param {Object} options - 配置选项
 * @param {string} options.url - 上传地址，默认使用配置的地址
 * @param {string} options.name - 文件对应的 key，默认为 'file'
 * @param {Object} options.formData - HTTP 请求中其他额外的 form data
 * @param {number} options.studentId - 学生ID，用于检查上传限制
 * @returns {Promise} 返回上传结果
 */
export const uploadImage = (filePath, options = {}) => {
  const { url = UPLOAD_URL, formData = {}, name = "file", studentId } = options;

  // 如果传入了studentId，添加到formData中
  const finalFormData = { ...formData };
  if (studentId) {
    finalFormData.studentId = studentId;
  }

  // 使用 request.upload 方法
  return request.upload(url, filePath, finalFormData, { name });
};

/**
 * 批量上传图片
 * @param {Array<string>} filePaths - 要上传的文件路径数组
 * @param {Object} options - 配置选项
 * @returns {Promise<Array>} 返回所有上传结果
 */
export const uploadMultipleImages = async (filePaths, options = {}) => {
  const results = [];

  uni.showLoading({
    title: `上传中 0/${filePaths.length}`,
    mask: true,
  });

  try {
    for (let i = 0; i < filePaths.length; i++) {
      uni.showLoading({
        title: `上传中 ${i + 1}/${filePaths.length}`,
        mask: true,
      });

      const result = await uploadImage(filePaths[i], {
        ...options,
        // 不显示单个加载提示，因为已经在批量上传中显示了
      });
      results.push(result);
    }

    uni.hideLoading();
    return results;
  } catch (error) {
    uni.hideLoading();
    throw error;
  }
};

/**
 * 拍照并上传
 * @returns {Promise} 返回上传结果
 */
export const takePhotoAndUpload = () => {
  return chooseAndUploadImage({
    count: 1,
    sourceType: ["camera"],
  });
};

/**
 * 从相册选择并上传
 * @param {number} count - 最多可以选择的图片张数，默认1
 * @returns {Promise} 返回上传结果或结果数组
 */
export const chooseFromAlbumAndUpload = (count = 1) => {
  return chooseAndUploadImage({
    count,
    sourceType: ["album"],
  });
};

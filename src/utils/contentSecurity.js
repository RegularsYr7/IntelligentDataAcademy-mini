/**
 * 微信内容安全审核工具
 * 基于微信官方 msgSecCheck 2.0 接口
 * 文档：https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/sec-center/sec-check/msgSecCheck.html
 */

/**
 * 场景枚举值
 */
export const SECURITY_SCENE = {
  PROFILE: 1, // 资料（个人资料、昵称等）
  COMMENT: 2, // 评论
  FORUM: 3, // 论坛（社区帖子）
  SOCIAL_LOG: 4, // 社交日志
};

/**
 * 审核结果建议枚举
 */
export const SECURITY_SUGGEST = {
  PASS: "pass", // 通过
  REVIEW: "review", // 需人工审核
  RISKY: "risky", // 违规
};

/**
 * 标签枚举值
 */
export const SECURITY_LABEL = {
  NORMAL: 100, // 正常
  AD: 10001, // 广告
  POLITICS: 20001, // 时政
  PORN: 20002, // 色情
  ABUSE: 20003, // 辱骂
  ILLEGAL: 20006, // 违法犯罪
  FRAUD: 20008, // 欺诈
  VULGAR: 20012, // 低俗
  COPYRIGHT: 20013, // 版权
  OTHER: 21000, // 其他
};

/**
 * 标签描述映射
 */
const LABEL_DESC_MAP = {
  [SECURITY_LABEL.NORMAL]: "正常",
  [SECURITY_LABEL.AD]: "广告",
  [SECURITY_LABEL.POLITICS]: "时政",
  [SECURITY_LABEL.PORN]: "色情",
  [SECURITY_LABEL.ABUSE]: "辱骂",
  [SECURITY_LABEL.ILLEGAL]: "违法犯罪",
  [SECURITY_LABEL.FRAUD]: "欺诈",
  [SECURITY_LABEL.VULGAR]: "低俗",
  [SECURITY_LABEL.COPYRIGHT]: "版权",
  [SECURITY_LABEL.OTHER]: "其他违规",
};

/**
 * 获取标签描述
 * @param {number} label - 标签枚举值
 * @returns {string} 标签描述
 */
export function getLabelDesc(label) {
  return LABEL_DESC_MAP[label] || "未知";
}

/**
 * 检查文本内容安全
 * @param {Object} params - 检查参数
 * @param {string} params.content - 需检测的文本内容（必填，最多2500字）
 * @param {number} params.scene - 场景枚举值（必填，1-4）
 * @param {string} params.title - 文本标题（可选）
 * @param {string} params.nickname - 用户昵称（可选）
 * @param {string} params.signature - 个性签名（可选，仅在scene=1时有效）
 * @returns {Promise<Object>} 审核结果
 * @example
 * const result = await checkTextSecurity({
 *   content: '这是一段测试文本',
 *   scene: SECURITY_SCENE.COMMENT,
 *   title: '测试标题'
 * })
 */
export async function checkTextSecurity(params) {
  const { content, scene, title, nickname, signature } = params;

  // 参数校验
  if (!content) {
    throw new Error("content 参数不能为空");
  }

  if (!scene || ![1, 2, 3, 4].includes(scene)) {
    throw new Error("scene 参数必须为 1-4 之间的数字");
  }

  if (content.length > 2500) {
    throw new Error("文本内容不能超过 2500 字");
  }

  try {
    // 调用后端接口进行内容安全检查
    const res = await uni.request({
      url: "/api/security/checkText", // 需要在后端实现此接口
      method: "POST",
      data: {
        content,
        scene,
        title,
        nickname,
        signature,
      },
    });

    // 后端返回的数据格式
    const { errcode, errmsg, result, detail, trace_id } = res.data;

    if (errcode !== 0) {
      throw new Error(errmsg || "内容安全检查失败");
    }

    return {
      success: true,
      suggest: result.suggest,
      label: result.label,
      labelDesc: getLabelDesc(result.label),
      detail,
      trace_id,
      // 是否通过审核（pass 为通过，review 和 risky 都不通过）
      isPassed: result.suggest === SECURITY_SUGGEST.PASS,
      // 是否需要人工审核
      needReview: result.suggest === SECURITY_SUGGEST.REVIEW,
      // 是否违规
      isRisky: result.suggest === SECURITY_SUGGEST.RISKY,
    };
  } catch (error) {
    console.error("内容安全检查异常:", error);
    return {
      success: false,
      error: error.message || "内容安全检查异常",
      // 发生异常时，默认不允许通过（安全优先）
      isPassed: false,
      needReview: true,
      isRisky: false,
    };
  }
}

/**
 * 检查失物招领内容安全
 * @param {Object} params - 失物招领参数
 * @param {string} params.title - 标题
 * @param {string} params.content - 内容描述
 * @param {string} params.contactInfo - 联系方式（可选）
 * @returns {Promise<Object>} 审核结果
 */
export async function checkLostFoundSecurity(params) {
  const { title, content, contactInfo } = params;

  // 合并需要检查的文本内容
  const fullContent = [title, content, contactInfo].filter(Boolean).join("\n");

  return await checkTextSecurity({
    content: fullContent,
    scene: SECURITY_SCENE.FORUM,
    title,
  });
}

/**
 * 检查社区帖子内容安全
 * @param {Object} params - 帖子参数
 * @param {string} params.title - 帖子标题
 * @param {string} params.content - 帖子内容
 * @returns {Promise<Object>} 审核结果
 */
export async function checkPostSecurity(params) {
  const { title, content } = params;

  // 合并标题和内容
  const fullContent = [title, content].filter(Boolean).join("\n");

  return await checkTextSecurity({
    content: fullContent,
    scene: SECURITY_SCENE.FORUM,
    title,
  });
}

/**
 * 检查评论内容安全
 * @param {Object} params - 评论参数
 * @param {string} params.content - 评论内容
 * @param {string} params.nickname - 用户昵称（可选）
 * @returns {Promise<Object>} 审核结果
 */
export async function checkCommentSecurity(params) {
  const { content, nickname } = params;

  return await checkTextSecurity({
    content,
    scene: SECURITY_SCENE.COMMENT,
    nickname,
  });
}

/**
 * 批量检查内容安全
 * @param {Array<Object>} items - 需要检查的内容列表
 * @param {Function} contentExtractor - 内容提取函数，接收item返回{content, scene, title}
 * @returns {Promise<Array<Object>>} 审核结果列表
 * @example
 * const results = await batchCheckSecurity(
 *   comments,
 *   (comment) => ({
 *     content: comment.text,
 *     scene: SECURITY_SCENE.COMMENT
 *   })
 * )
 */
export async function batchCheckSecurity(items, contentExtractor) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const promises = items.map((item) => {
    const params = contentExtractor(item);
    return checkTextSecurity(params);
  });

  return await Promise.all(promises);
}

/**
 * 显示审核结果提示
 * @param {Object} result - 审核结果
 * @param {Object} options - 配置选项
 * @param {string} options.passMessage - 通过时的提示消息
 * @param {string} options.reviewMessage - 需审核时的提示消息
 * @param {string} options.riskyMessage - 违规时的提示消息
 */
export function showSecurityResult(result, options = {}) {
  const {
    passMessage = "内容审核通过",
    reviewMessage = "内容需要人工审核，请耐心等待",
    riskyMessage = "内容包含违规信息，请修改后重试",
  } = options;

  if (!result.success) {
    uni.showToast({
      title: result.error || "审核异常",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  if (result.isPassed) {
    uni.showToast({
      title: passMessage,
      icon: "success",
      duration: 1500,
    });
  } else if (result.needReview) {
    uni.showModal({
      title: "提示",
      content: reviewMessage,
      showCancel: false,
    });
  } else if (result.isRisky) {
    uni.showModal({
      title: "内容违规",
      content: `${riskyMessage}\n违规类型：${result.labelDesc}`,
      showCancel: false,
    });
  }
}

/**
 * 默认导出
 */
export default {
  SECURITY_SCENE,
  SECURITY_SUGGEST,
  SECURITY_LABEL,
  getLabelDesc,
  checkTextSecurity,
  checkLostFoundSecurity,
  checkPostSecurity,
  checkCommentSecurity,
  batchCheckSecurity,
  showSecurityResult,
};

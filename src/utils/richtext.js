/**
 * 富文本处理工具
 * 用于处理小程序端的富文本内容，添加统一的样式
 */

/**
 * 格式化富文本内容
 * @param {String} content - 原始富文本HTML内容
 * @param {Object} options - 自定义样式配置
 * @returns {String} 格式化后的富文本内容
 */
export function formatRichText(content, options = {}) {
  if (!content) return "";

  // 默认样式配置
  const defaultStyles = {
    h2: "font-size: 32rpx; font-weight: bold; color: #333; margin: 30rpx 0 20rpx 0;",
    h3: "font-size: 30rpx; font-weight: bold; color: #333; margin: 25rpx 0 15rpx 0;",
    p: "margin-bottom: 20rpx; line-height: 1.8; color: #666; white-space: pre-wrap;",
    ul: "margin: 20rpx 0; padding-left: 40rpx;",
    li: "margin-bottom: 15rpx; line-height: 1.6; color: #666;",
    div: "line-height: 1.8; color: #666; white-space: pre-wrap;",
    img: "max-width: 100%; height: auto; display: block; margin: 20rpx 0;",
    strong: "font-weight: bold; color: #333;",
    em: "font-style: italic; color: #666;",
    blockquote:
      "border-left: 4rpx solid #e0e0e0; padding-left: 20rpx; margin: 20rpx 0; color: #999;",
  };

  // 合并自定义样式
  const styles = { ...defaultStyles, ...options };

  let formattedContent = content;

  // 为各种标签添加样式
  Object.keys(styles).forEach((tag) => {
    const regex = new RegExp(`<${tag}[^>]*>`, "g");
    formattedContent = formattedContent.replace(
      regex,
      `<${tag} style="${styles[tag]}">`
    );
  });

  return formattedContent;
}

/**
 * 清理富文本内容（移除所有样式）
 * @param {String} content - 原始富文本HTML内容
 * @returns {String} 清理后的纯文本内容
 */
export function cleanRichText(content) {
  if (!content) return "";

  return (
    content
      .replace(/<[^>]+>/g, "") // 移除所有HTML标签
      // .replace(/&nbsp;/g, " ") // 替换空格实体
      .replace(/&lt;/g, "<") // 替换小于号
      .replace(/&gt;/g, ">") // 替换大于号
      .replace(/&amp;/g, "&")
  ); // 替换与号
  // .trim();
}

/**
 * 截取富文本摘要
 * @param {String} content - 原始富文本HTML内容
 * @param {Number} length - 摘要长度，默认100
 * @returns {String} 富文本摘要
 */
export function getRichTextSummary(content, length = 100) {
  const plainText = cleanRichText(content);
  return plainText.length > length
    ? plainText.substring(0, length) + "..."
    : plainText;
}

/**
 * 为富文本图片添加预览功能
 * @param {String} content - 原始富文本HTML内容
 * @returns {String} 处理后的富文本内容
 */
export function addImagePreview(content) {
  if (!content) return "";

  // 提取所有图片URL
  const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
  const images = [];
  let match;

  while ((match = imgRegex.exec(content)) !== null) {
    images.push(match[1]);
  }

  // 为图片添加点击预览事件（需要配合页面中的图片点击处理）
  let index = 0;
  return content.replace(/<img[^>]+>/g, (img) => {
    const dataIndex = index++;
    return img.replace("<img", `<img data-index="${dataIndex}"`);
  });
}

export default {
  formatRichText,
  cleanRichText,
  getRichTextSummary,
  addImagePreview,
};

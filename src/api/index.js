/**
 * API统一导出文件
 * 便于统一管理和导入
 */

// 用户相关
export * as userApi from "./user";

// 竞赛相关
export * as competitionApi from "./competition";

// 商品相关
export * as goodsApi from "./goods";

// 订单相关
export * as orderApi from "./order";

// 地址相关
export * as addressApi from "./address";

// 社区问答相关
export * as qaApi from "./qa";

// 文件上传相关
export * as uploadApi from "./upload";

// 默认导出(可按需导入)
export { default as request } from "@/utils/request";

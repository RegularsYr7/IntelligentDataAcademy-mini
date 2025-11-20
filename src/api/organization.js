/**
 * 组织管理相关接口
 */
import request from "@/utils/request";

/**
 * 获取组织列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.organizationName - 组织名称(可选)
 * @param {string} params.level - 组织级别(可选)
 */
export const getOrganizationList = (params) => {
  return request.get("/edu/organization/miniprogram", params);
};

/**
 * 获取组织详情
 * @param {string} id - 组织ID
 */
export const getOrganizationDetail = (id) => {
  return request.get(`/edu/organization/detail/${id}`);
};

/**
 * 获取轮播组织
 * @param {Object} params - 查询参数
 */
export const getCarouselOrganizations = (params) => {
  return request.get("/edu/organization/carousel", params);
};

/**
 * 申请加入组织
 * @param {Object} data - 申请信息
 * @param {number} data.studentId - 学生ID
 * @param {number} data.organizationId - 组织ID
 * @param {string} data.applyReason - 申请理由(可选)
 */
export const applyOrganization = (data) => {
  return request.post("/edu/organization/apply", data);
};

/**
 * 审批申请
 * @param {Object} data - 审批信息
 * @param {string} data.applicationId - 申请ID
 * @param {string} data.status - 审批状态(approved/rejected)
 */
export const approveApplication = (data) => {
  return request.post("/edu/organization/approveApplication", data);
};

/**
 * 退出组织
 * @param {Object} data - 退出信息
 * @param {string} data.organizationId - 组织ID
 */
export const quitOrganization = (data) => {
  return request.post("/edu/organization/quit", data);
};

/**
 * 移除成员
 * @param {Object} data - 移除信息
 * @param {string} data.memberId - 成员ID
 */
export const removeMember = (data) => {
  return request.post("/edu/organization/removeMember", data);
};

/**
 * 设置管理员
 * @param {Object} data - 设置信息
 * @param {string} data.memberId - 成员ID
 */
export const setAdmin = (data) => {
  return request.post("/edu/organization/setAdmin", data);
};

/**
 * 移除管理员
 * @param {Object} data - 移除信息
 * @param {string} data.memberId - 成员ID
 */
export const removeAdmin = (data) => {
  return request.post("/edu/organization/removeAdmin", data);
};

/**
 * 转让会长
 * @param {Object} data - 转让信息
 * @param {string} data.organizationId - 组织ID
 * @param {string} data.newPresidentId - 新会长ID
 */
export const transferPresident = (data) => {
  return request.post("/edu/organization/transferPresident", data);
};

/**
 * 更新组织信息
 * @param {Object} data - 组织信息
 */
export const updateOrganizationInfo = (data) => {
  return request.post("/edu/organization/updateInfo", data);
};

/**
 * 获取组织成员列表
 * @param {string} organizationId - 组织ID
 * @param {Object} params - 查询参数
 */
export const getOrganizationMembers = (organizationId, params) => {
  return request.get(`/edu/organization/members/${organizationId}`, params);
};

/**
 * 获取组织申请列表
 * @param {string} organizationId - 组织ID
 * @param {Object} params - 查询参数
 */
export const getOrganizationApplications = (organizationId, params) => {
  return request.get(
    `/edu/organization/applications/${organizationId}`,
    params
  );
};

/**
 * 获取组织级别映射
 */
export const getOrganizationLevelsMap = () => {
  return request.get("/edu/organization/levels/map");
};

/**
 * 创建组织
 * @param {Object} data - 组织信息
 */
export const createOrganization = (data) => {
  return request.post("/edu/organization", data);
};

/**
 * 更新组织
 * @param {Object} data - 组织信息
 */
export const updateOrganization = (data) => {
  return request.put("/edu/organization", data);
};

/**
 * 删除组织
 * @param {string} organizationIds - 组织ID(多个用逗号分隔)
 */
export const deleteOrganization = (organizationIds) => {
  return request.delete(`/edu/organization/${organizationIds}`);
};

/**
 * 学校信息相关接口
 */
import request from "@/utils/request";

// ==================== 学校相关 ====================

/**
 * 获取学校信息
 */
export const getSchoolInfo = () => {
  return request.get("/edu/school/info");
};

/**
 * 获取学校列表
 * @param {Object} params - 查询参数
 */
export const getSchoolList = (params) => {
  return request.get("/edu/school/list", params);
};

/**
 * 获取学校详情
 * @param {string} schoolId - 学校ID
 */
export const getSchoolDetail = (schoolId) => {
  return request.get(`/edu/school/${schoolId}`);
};

/**
 * 创建学校
 * @param {Object} data - 学校信息
 */
export const createSchool = (data) => {
  return request.post("/edu/school", data);
};

/**
 * 更新学校
 * @param {Object} data - 学校信息
 */
export const updateSchool = (data) => {
  return request.put("/edu/school", data);
};

/**
 * 删除学校
 * @param {string} schoolIds - 学校ID(多个用逗号分隔)
 */
export const deleteSchool = (schoolIds) => {
  return request.delete(`/edu/school/${schoolIds}`);
};

// ==================== 学院相关 ====================

/**
 * 获取学院列表(小程序端)
 * @param {Object} params - 查询参数
 */
export const getCollegeList = (params) => {
  return request.get("/edu/college/miniprogram", params);
};

/**
 * 获取学院列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getCollegeListAdmin = (params) => {
  return request.get("/edu/college/list", params);
};

/**
 * 获取学院详情
 * @param {string} collegeId - 学院ID
 */
export const getCollegeDetail = (collegeId) => {
  return request.get(`/edu/college/${collegeId}`);
};

/**
 * 创建学院
 * @param {Object} data - 学院信息
 */
export const createCollege = (data) => {
  return request.post("/edu/college", data);
};

/**
 * 更新学院
 * @param {Object} data - 学院信息
 */
export const updateCollege = (data) => {
  return request.put("/edu/college", data);
};

/**
 * 删除学院
 * @param {string} collegeIds - 学院ID(多个用逗号分隔)
 */
export const deleteCollege = (collegeIds) => {
  return request.delete(`/edu/college/${collegeIds}`);
};

// ==================== 专业相关 ====================

/**
 * 获取专业列表(小程序端)
 * @param {Object} params - 查询参数
 */
export const getMajorList = (params) => {
  return request.get("/edu/major/miniprogram", params);
};

/**
 * 获取专业列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getMajorListAdmin = (params) => {
  return request.get("/edu/major/list", params);
};

/**
 * 获取专业详情
 * @param {string} majorId - 专业ID
 */
export const getMajorDetail = (majorId) => {
  return request.get(`/edu/major/${majorId}`);
};

/**
 * 创建专业
 * @param {Object} data - 专业信息
 */
export const createMajor = (data) => {
  return request.post("/edu/major", data);
};

/**
 * 更新专业
 * @param {Object} data - 专业信息
 */
export const updateMajor = (data) => {
  return request.put("/edu/major", data);
};

/**
 * 删除专业
 * @param {string} majorIds - 专业ID(多个用逗号分隔)
 */
export const deleteMajor = (majorIds) => {
  return request.delete(`/edu/major/${majorIds}`);
};

// ==================== 班级相关 ====================

/**
 * 获取班级列表(小程序端)
 * @param {Object} params - 查询参数
 */
export const getClassList = (params) => {
  return request.get("/edu/class/miniprogram", params);
};

/**
 * 获取班级列表(管理端)
 * @param {Object} params - 查询参数
 */
export const getClassListAdmin = (params) => {
  return request.get("/edu/class/list", params);
};

/**
 * 获取班级详情
 * @param {string} classId - 班级ID
 */
export const getClassDetail = (classId) => {
  return request.get(`/edu/class/${classId}`);
};

/**
 * 创建班级
 * @param {Object} data - 班级信息
 */
export const createClass = (data) => {
  return request.post("/edu/class", data);
};

/**
 * 更新班级
 * @param {Object} data - 班级信息
 */
export const updateClass = (data) => {
  return request.put("/edu/class", data);
};

/**
 * 删除班级
 * @param {string} classIds - 班级ID(多个用逗号分隔)
 */
export const deleteClass = (classIds) => {
  return request.delete(`/edu/class/${classIds}`);
};

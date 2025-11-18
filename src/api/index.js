/**
 * API统一导出入口
 * 使用方式:
 * import { login, getActivityList } from '@/api'
 * 或
 * import * as api from '@/api'
 */

// 学生管理
export * as studentApi from "./student";

// 活动管理
export * as activityApi from "./activity";

// 社区功能
export * as communityApi from "./community";

// 组织管理
export * as organizationApi from "./organization";

// 签到管理
export * as checkinApi from "./checkin";

// 竞赛信息
export * as competitionApi from "./competition";

// 风采展示
export * as showcaseApi from "./showcase";

// 意见反馈
export * as feedbackApi from "./feedback";

// 失物招领
export * as lostFoundApi from "./lostFound";

// 课程表
export * as scheduleApi from "./schedule";

// 学校信息
export * as schoolApi from "./school";

// 学期管理
export * as semesterApi from "./semester";

// 地图地标
export * as landmarkApi from "./landmark";

// 量化分记录
export * as quantitativeApi from "./quantitative";

// 导出所有API(按模块分组)
export { default as student } from "./student";
export { default as activity } from "./activity";
export { default as community } from "./community";
export { default as organization } from "./organization";
export { default as checkin } from "./checkin";
export { default as competition } from "./competition";
export { default as showcase } from "./showcase";
export { default as feedback } from "./feedback";
export { default as lostFound } from "./lostFound";
export { default as schedule } from "./schedule";
export { default as school } from "./school";
export { default as semester } from "./semester";
export { default as landmark } from "./landmark";
export { default as quantitative } from "./quantitative";

// 便捷导出常用接口
export {
  // 学生相关
  login,
  loginByWechat,
  updateProfile,
  updatePassword,
} from "./student";

export {
  // 活动相关
  getActivityList,
  getActivityDetail,
  enrollActivity,
  cancelEnroll,
  signInActivity,
} from "./activity";

export {
  // 社区相关
  getPostList,
  getPostDetail,
  submitPost,
  commentPost,
  likePost,
  collectPost,
  followUser,
} from "./community";

export {
  // 组织相关
  getOrganizationList,
  getOrganizationDetail,
  applyOrganization,
} from "./organization";

export {
  // 签到相关
  getCurrentTask,
  submitCheckin,
  getMyRecords,
} from "./checkin";

export {
  // 竞赛相关
  getCompetitionList,
  getCompetitionDetail,
} from "./competition";

export {
  // 展示相关
  getShowcaseList,
  getShowcaseDetail,
} from "./showcase";

export {
  // 反馈相关
  submitFeedback,
  getFeedbackList,
} from "./feedback";

export {
  // 失物招领相关
  getLostFoundList,
  getLostFoundDetail,
  submitLostFound,
} from "./lostFound";

export {
  // 课程表相关
  getSchedule,
  getCurrentWeek,
  getNextCourse,
} from "./schedule";

export {
  // 学校信息相关
  getSchoolInfo,
  getCollegeList,
  getMajorList,
  getClassList,
} from "./school";

export {
  // 学期相关
  getCurrentSemester,
  getSemesterList,
} from "./semester";

export {
  // 地标相关
  getLandmarkList,
} from "./landmark";

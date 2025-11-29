/**
 * 社区相关接口
 */
import request from "@/utils/request";

// ==================== 帖子相关 ====================

/**
 * 获取帖子列表(小程序端)
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.postType - 帖子类型(可选)
 */
export const getPostList = (params) => {
  return request.get("/edu/communityPost/miniprogram", params);
};

/**
 * 按创建时间获取帖子
 * @param {Object} params - 查询参数
 */
export const getPostsByCreateTime = (params) => {
  return request.get("/edu/communityPost/byCreateTime", params);
};

/**
 * 获取关注用户的帖子
 * @param {Object} params - 查询参数
 */
export const getPostsByFollowing = (params) => {
  return request.get("/edu/communityPost/byFollowing", params);
};

/**
 * 按浏览量获取帖子
 * @param {Object} params - 查询参数
 */
export const getPostsByViewCount = (params) => {
  return request.get("/edu/communityPost/byViewCount", params);
};

/**
 * 获取帖子详情
 * @param {string} idOrUrl - 帖子ID或完整URL（包含查询参数）
 */
export const getPostDetail = (idOrUrl) => {
  // 如果包含查询参数，直接使用
  if (idOrUrl.includes("?")) {
    return request.get(`/edu/communityPost/detail/${idOrUrl}`);
  }
  // 否则只使用ID
  return request.get(`/edu/communityPost/detail/${idOrUrl}`);
};

/**
 * 发布帖子
 * @param {Object} data - 帖子信息
 * @param {string} data.studentId - 学生ID
 * @param {string} data.postType - 帖子类型
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {Array} data.images - 图片数组(可选)
 * @param {string} data.studentName - 学生姓名
 * @param {string} data.studentAvatar - 学生头像
 */
export const submitPost = (data) => {
  return request.post("/edu/communityPost/submit", data);
};

/**
 * 编辑自己的帖子
 * @param {Object} data - 帖子信息
 * @param {string} data.postId - 帖子ID
 * @param {string} data.studentId - 学生ID
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {Array} data.images - 图片数组(可选)
 */
export const editOwnPost = (data) => {
  return request.put("/edu/communityPost/editOwn", data);
};

/**
 * 删除自己的帖子
 * @param {Object} data - 删除信息
 * @param {string} data.postId - 帖子ID
 * @param {string} data.studentId - 学生ID
 */
export const deleteOwnPost = (data) => {
  return request.delete(
    `/edu/communityPost/deleteOwn?postId=${data.postId}&studentId=${data.studentId}`
  );
};

/**
 * 获取我的帖子
 * @param {Object} params - 查询参数
 */
export const getMyPosts = (params) => {
  return request.get("/edu/communityPost/myPosts", params);
};

/**
 * 获取帖子类型映射
 */
export const getPostTypesMap = () => {
  return request.get("/edu/communityPost/types/map");
};

// ==================== 评论相关 ====================

/**
 * 评论帖子
 * @param {Object} data - 评论信息
 * @param {Long} data.studentId - 学生ID
 * @param {Long} data.postId - 帖子ID
 * @param {String} data.content - 评论内容
 * @param {String} data.studentName - 学生姓名
 * @param {String} data.studentAvatar - 学生头像（可选）
 */
export const commentPost = (data) => {
  return request.post("/edu/communityComment/commentPost", data);
};

/**
 * 回复评论
 * @param {Object} data - 回复信息
 * @param {Long} data.studentId - 学生ID
 * @param {Long} data.postId - 帖子ID
 * @param {Long} data.parentId - 父评论ID
 * @param {Long} data.replyToId - 回复对象ID
 * @param {String} data.replyToName - 被回复人姓名
 * @param {String} data.content - 回复内容
 * @param {String} data.studentName - 学生姓名
 * @param {String} data.studentAvatar - 学生头像（可选）
 */
export const replyComment = (data) => {
  return request.post("/edu/communityComment/replyComment", data);
};

/**
 * 删除自己的评论
 * @param {Object} data - 删除信息
 * @param {string} data.commentId - 评论ID
 * @param {string} data.studentId - 学生ID
 */
export const deleteOwnComment = (data) => {
  return request.delete(
    `/edu/communityComment/deleteOwn?commentId=${data.commentId}&studentId=${data.studentId}`
  );
};

/**
 * 获取评论列表
 * @param {Object} params - 查询参数
 */
export const getCommentList = (params) => {
  return request.get("/edu/communityComment/list", params);
};

// ==================== 点赞相关 ====================

/**
 * 点赞帖子
 * @param {Object} data - 点赞信息
 * @param {string} data.studentId - 学生ID
 * @param {string} data.postId - 帖子ID
 * @param {string} data.studentName - 学生姓名
 * @param {string} data.studentAvatar - 学生头像
 */
export const likePost = (data) => {
  return request.post("/edu/communityLike/likePost", data);
};

/**
 * 取消点赞
 * @param {Object} data - 取消点赞信息
 * @param {string} data.studentId - 学生ID
 * @param {string} data.postId - 帖子ID
 * @param {string} data.studentName - 学生姓名
 * @param {string} data.studentAvatar - 学生头像
 */
export const unlikePost = (data) => {
  return request.post("/edu/communityLike/unlikePost", data);
};

/**
 * 获取点赞列表
 * @param {Object} params - 查询参数
 */
export const getLikeList = (params) => {
  return request.get("/edu/communityLike/list", params);
};

// ==================== 收藏相关 ====================

/**
 * 收藏帖子
 * @param {Object} data - 收藏信息
 * @param {string} data.studentId - 学生ID
 * @param {string} data.postId - 帖子ID
 * @param {string} data.studentName - 学生姓名
 */
export const collectPost = (data) => {
  return request.post("/edu/communityCollect/collectPost", data);
};

/**
 * 取消收藏
 * @param {Object} data - 取消收藏信息
 * @param {string} data.studentId - 学生ID
 * @param {string} data.postId - 帖子ID
 * @param {string} data.studentName - 学生姓名
 */
export const uncollectPost = (data) => {
  return request.post("/edu/communityCollect/uncollectPost", data);
};

/**
 * 获取我的收藏
 * @param {Object} params - 查询参数
 */
export const getMyCollections = (params) => {
  return request.get("/edu/communityCollect/myCollections", params);
};

// ==================== 关注相关 ====================

/**
 * 关注用户
 * @param {Object} data - 关注信息
 * @param {string} data.followerId - 关注者ID (studentId)
 * @param {string} data.followeeId - 被关注者ID
 * @param {string} data.followerName - 关注者姓名
 * @param {string} data.followerAvatar - 关注者头像
 * @param {string} data.followeeName - 被关注者姓名
 * @param {string} data.followeeAvatar - 被关注者头像
 * @param {string} data.studentId - 学生ID
 */
export const followUser = (data) => {
  return request.post("/edu/communityFollow/follow", data);
};

/**
 * 取消关注
 * @param {Object} data - 取消关注信息
 * @param {string} data.followerId - 关注者ID (studentId)
 * @param {string} data.followeeId - 被关注者ID
 * @param {string} data.studentId - 学生ID
 */
export const unfollowUser = (data) => {
  return request.post("/edu/communityFollow/unfollow", data);
};

/**
 * 获取我的粉丝
 * @param {Object} params - 查询参数
 */
export const getMyFollowers = (params) => {
  return request.get("/edu/communityFollow/myFollowers", params);
};

/**
 * 获取我的关注
 * @param {Object} params - 查询参数
 */
export const getMyFollowing = (params) => {
  return request.get("/edu/communityFollow/myFollowing", params);
};

// ==================== 消息相关 ====================

/**
 * 获取未读消息数量
 * @param {Object} params - 查询参数
 */
export const getUnreadCount = (params) => {
  return request.get("/edu/communityMessage/unreadCount", params);
};

/**
 * 获取点赞消息
 * @param {Object} params - 查询参数
 */
export const getLikeMessages = (params) => {
  return request.get("/edu/communityMessage/likes", params);
};

/**
 * 获取评论回复消息
 * @param {Object} params - 查询参数
 */
export const getReplyMessages = (params) => {
  return request.get("/edu/communityMessage/replies", params);
};

/**
 * 获取关注消息
 * @param {Object} params - 查询参数
 */
export const getFollowMessages = (params) => {
  return request.get("/edu/communityMessage/follows", params);
};

/**
 * 获取系统消息
 * @param {Object} params - 查询参数
 */
export const getSystemMessages = (params) => {
  return request.get("/edu/communityMessage/system", params);
};

/**
 * 标记消息为已读
 * @param {Object} data - 消息信息
 * @param {string} data.messageIds - 消息ID (单个或多个用逗号分隔)
 */
export const markMessageRead = (data) => {
  const messageIds = data.messageIds || data.messageId;
  return request.post(`/edu/communityMessage/markRead?messageIds=${messageIds}`);
};

/**
 * 删除消息
 * @param {string} messageId - 消息ID
 */
export const deleteMessage = (messageId) => {
  return request.delete(`/edu/communityMessage/delete?messageId=${messageId}`);
};

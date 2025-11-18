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
 * @param {string} id - 帖子ID
 */
export const getPostDetail = (id) => {
  return request.get(`/edu/communityPost/detail/${id}`);
};

/**
 * 发布帖子
 * @param {Object} data - 帖子信息
 * @param {string} data.postType - 帖子类型
 * @param {string} data.title - 标题
 * @param {string} data.content - 内容
 * @param {Array} data.images - 图片数组(可选)
 */
export const submitPost = (data) => {
  return request.post("/edu/communityPost/submit", data);
};

/**
 * 编辑自己的帖子
 * @param {Object} data - 帖子信息
 */
export const editOwnPost = (data) => {
  return request.put("/edu/communityPost/editOwn", data);
};

/**
 * 删除自己的帖子
 * @param {string} postId - 帖子ID
 */
export const deleteOwnPost = (postId) => {
  return request.delete(`/edu/communityPost/deleteOwn?postId=${postId}`);
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
 * @param {string} data.postId - 帖子ID
 * @param {string} data.content - 评论内容
 */
export const commentPost = (data) => {
  return request.post("/edu/communityComment/commentPost", data);
};

/**
 * 回复评论
 * @param {Object} data - 回复信息
 * @param {string} data.commentId - 评论ID
 * @param {string} data.content - 回复内容
 */
export const replyComment = (data) => {
  return request.post("/edu/communityComment/replyComment", data);
};

/**
 * 删除自己的评论
 * @param {string} commentId - 评论ID
 */
export const deleteOwnComment = (commentId) => {
  return request.delete(
    `/edu/communityComment/deleteOwn?commentId=${commentId}`
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
 * @param {string} data.postId - 帖子ID
 */
export const likePost = (data) => {
  return request.post("/edu/communityLike/likePost", data);
};

/**
 * 取消点赞
 * @param {Object} data - 取消点赞信息
 * @param {string} data.postId - 帖子ID
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
 * @param {string} data.postId - 帖子ID
 */
export const collectPost = (data) => {
  return request.post("/edu/communityCollect/collectPost", data);
};

/**
 * 取消收藏
 * @param {Object} data - 取消收藏信息
 * @param {string} data.postId - 帖子ID
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
 * @param {string} data.followedId - 被关注用户ID
 */
export const followUser = (data) => {
  return request.post("/edu/communityFollow/follow", data);
};

/**
 * 取消关注
 * @param {Object} data - 取消关注信息
 * @param {string} data.followedId - 被关注用户ID
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
 */
export const getUnreadCount = () => {
  return request.get("/edu/communityMessage/unreadCount");
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
 * @param {string} data.messageId - 消息ID
 */
export const markMessageRead = (data) => {
  return request.post("/edu/communityMessage/markRead", data);
};

/**
 * 删除消息
 * @param {string} messageId - 消息ID
 */
export const deleteMessage = (messageId) => {
  return request.delete(`/edu/communityMessage/delete?messageId=${messageId}`);
};

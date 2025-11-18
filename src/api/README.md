# API 接口使用文档

本文档说明如何使用项目中封装的 API 接口。

## 📁 文件结构

```
src/api/
├── index.js              # API统一导出入口
├── student.js            # 学生管理相关接口
├── activity.js           # 活动管理相关接口
├── community.js          # 社区功能相关接口
├── organization.js       # 组织管理相关接口
├── checkin.js            # 签到管理相关接口
├── competition.js        # 竞赛信息相关接口
├── showcase.js           # 风采展示相关接口
├── feedback.js           # 意见反馈相关接口
├── lostFound.js          # 失物招领相关接口
├── schedule.js           # 课程表相关接口
├── school.js             # 学校信息相关接口
├── semester.js           # 学期管理相关接口
├── landmark.js           # 地图地标相关接口
└── quantitative.js       # 量化分记录相关接口
```

## 📝 使用方式

### 方式一: 导入单个接口

```javascript
import { login, getActivityList, submitPost } from "@/api";

// 使用
async function handleLogin() {
  try {
    const data = await login({
      studentNo: "2021001",
      password: "123456",
    });
    console.log("登录成功", data);
  } catch (error) {
    console.error("登录失败", error);
  }
}
```

### 方式二: 按模块导入

```javascript
import { studentApi, activityApi, communityApi } from "@/api";

// 使用
async function getData() {
  const user = await studentApi.login({
    studentNo: "2021001",
    password: "123456",
  });
  const activities = await activityApi.getActivityList({
    pageNum: 1,
    pageSize: 10,
  });
  const posts = await communityApi.getPostList({ pageNum: 1, pageSize: 20 });
}
```

### 方式三: 直接导入模块文件

```javascript
import { login, updateProfile } from "@/api/student";
import { getActivityList, enrollActivity } from "@/api/activity";

// 使用
const result = await login({ studentNo: "2021001", password: "123456" });
```

## 🔥 常用接口示例

### 1. 学生登录

```javascript
import { login, loginByWechat } from "@/api";

// 账号密码登录
const loginData = await login({
  studentNo: "2021001",
  password: "123456",
});

// 微信登录
const wechatData = await loginByWechat({
  code: "wx_auth_code",
});
```

### 2. 获取活动列表

```javascript
import { getActivityList, getActivityDetail } from "@/api";

// 获取活动列表
const activities = await getActivityList({
  pageNum: 1,
  pageSize: 10,
  activityType: "讲座", // 可选
  status: "ongoing", // 可选
});

// 获取活动详情
const detail = await getActivityDetail("activity_id");
```

### 3. 发布帖子

```javascript
import { submitPost, getPostList } from "@/api";

// 发布帖子
await submitPost({
  postType: "求助",
  title: "求助标题",
  content: "帖子内容",
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
});

// 获取帖子列表
const posts = await getPostList({
  pageNum: 1,
  pageSize: 20,
  postType: "求助", // 可选
});
```

### 4. 签到

```javascript
import { getCurrentTask, submitCheckin, validateLocation } from "@/api";

// 获取当前签到任务
const task = await getCurrentTask();

// 验证位置
const isValid = await validateLocation({
  taskId: task.id,
  latitude: 23.123456,
  longitude: 113.123456,
});

// 提交签到
if (isValid) {
  await submitCheckin({
    taskId: task.id,
    latitude: 23.123456,
    longitude: 113.123456,
  });
}
```

### 5. 课程表

```javascript
import { getSchedule, getCurrentWeek, getNextCourse } from "@/api";

// 获取课程表
const schedule = await getSchedule({
  semesterId: "semester_id", // 可选
  weekNum: 1, // 可选
});

// 获取当前周次
const currentWeek = await getCurrentWeek();

// 获取下一节课
const nextCourse = await getNextCourse();
```

### 6. 组织管理

```javascript
import {
  getOrganizationList,
  applyOrganization,
  quitOrganization,
} from "@/api";

// 获取组织列表
const organizations = await getOrganizationList({
  pageNum: 1,
  pageSize: 10,
  level: "校级", // 可选
});

// 申请加入组织
await applyOrganization({
  organizationId: "org_id",
  applyReason: "申请理由",
});

// 退出组织
await quitOrganization({
  organizationId: "org_id",
});
```

### 7. 失物招领

```javascript
import { getLostFoundList, submitLostFound, markResolved } from "@/api";

// 获取失物招领列表
const items = await getLostFoundList({
  pageNum: 1,
  pageSize: 10,
  itemType: "lost", // lost/found
  tag: "电子产品", // 可选
});

// 发布失物招领
await submitLostFound({
  itemType: "lost",
  itemName: "钱包",
  description: "黑色钱包",
  lostTime: "2024-01-01 10:00",
  location: "图书馆",
  images: ["https://example.com/image.jpg"],
  tag: "日用品",
  contactInfo: "13800138000",
});

// 标记为已解决
await markResolved({
  itemId: "item_id",
});
```

### 8. 意见反馈

```javascript
import { submitFeedback, getFeedbackList, appendFeedback } from "@/api";

// 提交反馈
await submitFeedback({
  feedbackType: "bug",
  content: "反馈内容",
  images: ["https://example.com/screenshot.jpg"],
  contactInfo: "13800138000",
});

// 获取反馈列表
const feedbacks = await getFeedbackList({
  pageNum: 1,
  pageSize: 10,
  status: "pending", // 可选
});

// 追加反馈
await appendFeedback({
  feedbackId: "feedback_id",
  content: "补充信息",
  images: [],
});
```

## ⚙️ 配置说明

所有接口都基于 `@/utils/request.js` 封装,支持以下配置:

```javascript
import { getActivityList } from "@/api";

// 关闭加载提示
const data = await getActivityList(
  { pageNum: 1, pageSize: 10 },
  { loading: false }
);

// 关闭错误提示
const data = await getActivityList(
  { pageNum: 1, pageSize: 10 },
  { showError: false }
);

// 自定义加载文本
const data = await getActivityList(
  { pageNum: 1, pageSize: 10 },
  { loadingText: "正在加载活动..." }
);
```

## 🔐 Token 管理

Token 会自动添加到请求头中,无需手动处理:

```javascript
// 登录后,token会自动存储
const data = await login({ studentNo: "2021001", password: "123456" });
// token已自动保存到 uni.getStorageSync('userToken')

// 后续所有请求会自动携带token
const activities = await getActivityList({ pageNum: 1, pageSize: 10 });
```

## 📊 响应数据格式

所有接口返回的数据格式统一为:

```javascript
// 成功时直接返回 data
const data = await getActivityList({ pageNum: 1, pageSize: 10 });
console.log(data); // 直接是数据内容

// 失败时抛出错误
try {
  const data = await login({ studentNo: "xxx", password: "xxx" });
} catch (error) {
  console.log(error.code); // 错误码
  console.log(error.message); // 错误信息
}
```

## 🛠️ 错误处理

接口已自动处理常见错误,包括:

- **401** - 未登录或 token 失效,自动跳转登录页
- **403** - 无权限访问
- **404** - 请求地址不存在
- **500** - 服务器错误
- **网络错误** - 连接失败等

如需自定义错误处理:

```javascript
try {
  const data = await getActivityList({ pageNum: 1, pageSize: 10 });
} catch (error) {
  if (error.code === 403) {
    uni.showToast({ title: "您没有访问权限", icon: "none" });
  } else if (error.code === 404) {
    uni.showToast({ title: "资源不存在", icon: "none" });
  } else {
    uni.showToast({ title: error.message, icon: "none" });
  }
}
```

## 📤 文件上传

使用 `request.upload` 方法:

```javascript
import request from "@/utils/request";

// 选择图片
uni.chooseImage({
  count: 1,
  success: async (res) => {
    const filePath = res.tempFilePaths[0];

    try {
      // 上传图片
      const imageUrl = await request.upload("/api/upload", filePath);
      console.log("图片地址:", imageUrl);
    } catch (error) {
      console.error("上传失败", error);
    }
  },
});
```

## 🔄 环境切换

在 `@/utils/request.js` 中配置:

```javascript
const config = {
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://api.yourdomain.com" // 生产环境
      : "http://localhost:3000", // 开发环境
};
```

## 💡 最佳实践

1. **使用 async/await 处理异步**

```javascript
async function loadData() {
  const activities = await getActivityList({ pageNum: 1, pageSize: 10 });
  this.list = activities;
}
```

2. **统一错误处理**

```javascript
async function loadData() {
  try {
    const activities = await getActivityList({ pageNum: 1, pageSize: 10 });
    this.list = activities;
  } catch (error) {
    // 错误已自动提示,这里可以做额外处理
    console.error("加载失败", error);
  }
}
```

3. **在页面中使用**

```vue
<script>
import { getActivityList, enrollActivity } from "@/api";

export default {
  data() {
    return {
      activities: [],
    };
  },

  async onLoad() {
    await this.loadActivities();
  },

  methods: {
    async loadActivities() {
      const data = await getActivityList({
        pageNum: 1,
        pageSize: 10,
      });
      this.activities = data.list;
    },

    async handleEnroll(activityId) {
      await enrollActivity({ activityId });
      uni.showToast({ title: "报名成功", icon: "success" });
      await this.loadActivities(); // 刷新列表
    },
  },
};
</script>
```

## 📞 技术支持

如有问题,请联系开发团队。

# 智慧数据学院 - 校园综合服务小程序

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.4.21-brightgreen.svg" alt="Vue">
  <img src="https://img.shields.io/badge/uni--app-3.0-blue.svg" alt="uni-app">
  <img src="https://img.shields.io/badge/uView--Plus-3.6.4-orange.svg" alt="uView-Plus">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>

## 📖 项目简介

智慧数据学院是一款基于 uni-app 开发的校园综合服务小程序，集成了活动管理、社区交流、课表查询、校园导航、失物招领等多种功能模块，为学生提供便捷的校园生活服务。

### ✨ 核心特性

- 🎯 **活动管理** - 活动报名、签到、评分一体化管理
- 💬 **社区交流** - 发帖、评论、点赞、关注等社交功能
- 📅 **课表查询** - 智能课表展示，支持校准和提醒
- 🗺️ **校园导航** - 高精度定位，一键步行导航
- 🔍 **失物招领** - 发布寻物/拾物信息，帮助找回失物
- 📢 **反馈系统** - 意见反馈与建议提交
- 🏆 **量化管理** - 学生综合素质量化评分
- 📝 **签到打卡** - 班级签到，位置验证

## 🛠️ 技术栈

### 前端框架

- **Vue 3.4.21** - 渐进式 JavaScript 框架
- **uni-app 3.0** - 跨平台应用开发框架
- **uView-Plus 3.6.4** - UI 组件库

### 构建工具

- **Vite 5.2.8** - 下一代前端构建工具
- **Sass 1.77.6** - CSS 预处理器

### 开发语言

- **JavaScript/ES6+**
- **SCSS/CSS3**
- **HTML5**

## 📱 功能模块

### 1. 主页模块（pages/index）

- 📍 校园导航快捷入口
- 🏆 竞赛章程展示
- 🎨 风采展示入口
- 📅 我的课表预览
- ✅ 班级签到
- 🔍 失物招领
- 📖 学生手册
- 💬 意见反馈

### 2. 活动模块（pages/activity）

- 📋 活动列表展示（进行中/已结束）
- 🎯 活动详情查看
- 📝 活动报名与签到
- ⭐ 活动评分与评价
- 👥 参与人员管理
- 📍 活动地点导航

### 3. 社区模块（pages/qa）

- 📰 帖子列表展示
- ✍️ 发布帖子（文字/图片/话题）
- 💬 评论与回复（多级评论）
- ❤️ 点赞与收藏
- 🔥 热门话题推荐
- 👤 个人主页访问
- 📬 消息中心

### 4. 个人中心（pages/user）

- 👤 个人信息展示
- 📊 量化分数统计
- 🎯 我的活动记录
- 🏢 加入的组织
- 📈 成长记录曲线
- 📋 基本信息管理

### 5. 校园导航（pages/campus-nav）

- 🗺️ 高精度地图展示
- 📍 用户实时定位
- 🏫 校园建筑标注（19 个地点）
- 🔍 地点搜索功能
- 🏷️ 分类筛选（教学楼/宿舍楼/生活服务/运动场所）
- 🧭 一键步行导航
- 📤 位置分享

### 6. 课表管理（pages/schedule）

- 📅 周课表展示
- ⏰ 当前课程高亮
- 🔄 学期校准
- 📝 课程详细信息
- 🔔 上课提醒

### 7. 班级签到（pages/sign-in）

- ✅ 一键签到
- 📸 拍照签到
- 📍 位置验证
- 📊 签到统计
- 📜 签到记录查询
- 📄 签到详情查看

### 8. 失物招领（pages/lost-found）

- 📢 发布寻物/拾物信息
- 🔍 失物搜索
- 📱 联系方式留存
- 🏷️ 分类筛选（证件/钥匙/电子产品等）
- 📝 详情查看

### 9. 反馈系统（pages/feedback）

- ✍️ 提交意见反馈
- 🏷️ 反馈类型分类（教学/环境/服务/其他）
- 📸 图片上传
- 📜 反馈记录查询
- 💬 管理员回复
- 📊 状态跟踪（待处理/处理中/已解决）

### 10. 竞赛管理（pages/competition）

- 🏆 竞赛章程展示
- 📋 竞赛详情查看
- 📝 报名参赛

### 11. 风采展示（pages/showcase）

- 🎨 学生风采展示
- 🖼️ 作品展示
- 📄 详情查看

### 12. 消息中心（pages/message）

- 📬 消息列表（全部/回复/点赞/关注/系统）
- 🔴 未读消息提醒
- 📝 消息详情查看
- ✅ 标记已读

## 📂 项目结构

```
IntelligentDataAcademy/
├── src/                          # 源代码目录
│   ├── components/               # 公共组件
│   │   ├── Banner/              # 轮播图组件
│   │   ├── GoodCard/            # 商品卡片组件
│   │   ├── ContactSellerPopup/  # 联系卖家弹窗
│   │   └── ReviewPopup/         # 评价弹窗
│   ├── pages/                    # 页面目录
│   │   ├── index/               # 主页
│   │   ├── activity/            # 活动列表
│   │   ├── activity-detail/     # 活动详情
│   │   ├── qa/                  # 社区
│   │   ├── post-detail/         # 帖子详情
│   │   ├── publish-post/        # 发布帖子
│   │   ├── user/                # 个人中心
│   │   ├── campus-nav/          # 校园导航
│   │   ├── schedule/            # 课表
│   │   ├── sign-in/             # 班级签到
│   │   ├── sign-in-records/     # 签到记录
│   │   ├── sign-in-detail/      # 签到详情
│   │   ├── lost-found/          # 失物招领
│   │   ├── lost-found-publish/  # 发布失物信息
│   │   ├── lost-found-detail/   # 失物详情
│   │   ├── feedback/            # 意见反馈
│   │   ├── feedback-records/    # 反馈记录
│   │   ├── feedback-detail/     # 反馈详情
│   │   ├── competition/         # 竞赛章程
│   │   ├── competition-detail/  # 竞赛详情
│   │   ├── showcase/            # 风采展示
│   │   ├── showcase-detail/     # 风采详情
│   │   ├── message/             # 消息中心
│   │   └── message-detail/      # 消息详情
│   ├── static/                   # 静态资源
│   │   ├── tabbar/              # 底部导航图标
│   │   └── tabbarSclect/        # 底部导航选中图标
│   ├── utils/                    # 工具函数
│   │   └── richtext.js          # 富文本处理工具
│   ├── App.vue                   # 应用入口组件
│   ├── main.js                   # 应用入口文件
│   ├── pages.json                # 页面路由配置
│   ├── manifest.json             # 应用配置文件
│   └── uni.scss                  # 全局样式变量
├── unpackage/                    # 编译输出目录
├── .gitignore                    # Git 忽略配置
├── index.html                    # HTML 入口
├── package.json                  # 项目依赖配置
├── vite.config.js                # Vite 配置文件
└── README.md                     # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0 或 **yarn** >= 1.22.0
- **HBuilderX** (推荐) 或其他支持 uni-app 的开发工具
- **微信开发者工具** (用于微信小程序开发)

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发调试

```bash
# H5 端开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin

# 支付宝小程序开发
npm run dev:mp-alipay

# 百度小程序开发
npm run dev:mp-baidu

# 字节跳动小程序开发
npm run dev:mp-toutiao
```

### 生产构建

```bash
# 构建 H5
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 构建支付宝小程序
npm run build:mp-alipay

# 构建百度小程序
npm run build:mp-baidu

# 构建字节跳动小程序
npm run build:mp-toutiao
```

### 微信小程序配置

1. 打开微信开发者工具
2. 导入项目，选择 `unpackage/dist/dev/mp-weixin` 目录
3. 配置 AppID（在 `src/manifest.json` 中修改）
4. 运行项目

## 🎨 UI 设计

### 主题色

- **主色调**: `#667eea` → `#764ba2` (紫色渐变)
- **辅助色**: `#ff6b6b` (红色)
- **背景色**: `#f5f5f5` (浅灰)
- **文字色**: `#333` (深灰) / `#666` (中灰) / `#999` (浅灰)

### 设计风格

- 现代简约风格
- 渐变色运用
- 圆角卡片设计
- 阴影效果增强层次感
- 图标化操作提示

## 🔐 权限配置

### 微信小程序权限

```json
{
  "scope.userLocation": {
    "desc": "你的位置信息将用于班级签到功能"
  }
}
```

### 必需的隐私信息

- `getLocation` - 获取用户位置（用于签到和校园导航）
- `chooseLocation` - 选择地理位置（用于活动地点选择）

## 📊 数据管理

### 用户信息

- 学号、姓名、班级
- 量化分数
- 职位标签
- 头像照片

### 活动数据

- 活动基本信息
- 报名人员列表
- 签到记录
- 活动评分

### 社区数据

- 帖子内容
- 评论回复
- 点赞收藏
- 话题标签

### 课表数据

- 课程信息
- 上课时间
- 教室地点
- 任课教师

## 🌟 特色功能

### 1. 高精度校园导航

- ✅ 基于成都文理学院真实坐标
- ✅ 19 个精确建筑物定位
- ✅ 高精度定位模式（isHighAccuracy）
- ✅ 用户位置实时显示
- ✅ 地点搜索与分类筛选
- ✅ 一键步行导航

### 2. 智能社区系统

- ✅ 多级评论回复
- ✅ 防抖机制（防止重复点击）
- ✅ 富文本内容支持
- ✅ 图片上传与预览
- ✅ 热门话题推荐
- ✅ 消息中心通知

### 3. 量化评分系统

- ✅ 综合素质评分
- ✅ 成长记录曲线
- ✅ 活动积分统计
- ✅ 月度增长分析

### 4. 班级签到功能

- ✅ 位置验证签到
- ✅ 拍照签到
- ✅ 签到记录管理
- ✅ 统计分析

## 🔧 开发规范

### 代码规范

- 使用 ES6+ 语法
- 组件采用 Composition API
- 遵循 Vue 3 最佳实践
- 统一使用 SCSS 预处理器

### 命名规范

- 页面目录：kebab-case（例：`post-detail`）
- 组件名称：PascalCase（例：`ReviewPopup`）
- 变量命名：camelCase（例：`currentTab`）
- 常量命名：UPPER_CASE（例：`MAX_COUNT`）

### 样式规范

- 使用 rpx 响应式单位
- 遵循 BEM 命名方式
- 避免使用深层嵌套选择器
- 使用 SCSS 变量管理颜色

## 📝 更新日志

### v1.0.0 (2025-10-28)

- ✨ 初始版本发布
- ✅ 完成主页、活动、社区、个人中心四大模块
- ✅ 集成校园导航功能（19 个精确建筑定位）
- ✅ 实现课表管理系统
- ✅ 添加班级签到功能
- ✅ 完善失物招领模块
- ✅ 实现反馈系统
- ✅ 添加消息中心
- ✅ 集成 uView-Plus UI 组件库
- ✅ 配置高精度定位
- ✅ 实现社区防抖机制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交流程

1. Fork 本仓库
2. 创建新分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 👥 开发团队

- **项目负责人**: 智慧数据学院开发组
- **技术支持**: uni-app 官方社区
- **UI 设计**: uView-Plus 组件库

## 📮 联系方式

- **项目地址**: [GitHub Repository]
- **问题反馈**: [Issues]
- **技术交流**: 欢迎加入技术交流群

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/)
- [uni-app](https://uniapp.dcloud.io/)
- [uView-Plus](https://uviewui.com/)
- [Vite](https://vitejs.dev/)

---

<div align="center">
  <p>Made with ❤️ by Intelligent Data Academy Team</p>
  <p>© 2025 Intelligent Data Academy. All rights reserved.</p>
</div>

# 内容安全审核集成指南

## 概述

本项目已集成微信官方内容安全审核功能，用于检测失物招领、社区帖子、评论等用户生成内容（UGC）是否包含违规信息。

## 文件说明

### 1. `src/utils/contentSecurity.js`

前端工具模块，封装了内容安全审核的核心功能。

### 2. `src/api/security.js`

API 接口文件，用于调用后端的内容安全检查接口。

## 使用示例

### 1. 失物招领发布前审核

在 `src/pages/lost-found-publish/lost-found-publish.vue` 中：

```vue
<script>
import {
  checkLostFoundSecurity,
  showSecurityResult,
} from "@/utils/contentSecurity";

export default {
  data() {
    return {
      formData: {
        title: "",
        content: "",
        contactInfo: "",
      },
    };
  },
  methods: {
    async handleSubmit() {
      // 1. 先进行内容安全审核
      const securityResult = await checkLostFoundSecurity({
        title: this.formData.title,
        content: this.formData.content,
        contactInfo: this.formData.contactInfo,
      });

      // 2. 显示审核结果
      showSecurityResult(securityResult, {
        passMessage: "发布成功",
        reviewMessage: "您的内容需要人工审核，审核通过后将自动发布",
        riskyMessage: "内容包含违规信息，请修改后重试",
      });

      // 3. 根据审核结果决定后续操作
      if (securityResult.isPassed) {
        // 审核通过，直接发布
        await this.publishLostFound({ ...this.formData, status: "published" });
      } else if (securityResult.needReview) {
        // 需要人工审核，保存为待审核状态
        await this.publishLostFound({ ...this.formData, status: "pending" });
      } else if (securityResult.isRisky) {
        // 违规，不允许发布
        return;
      }
    },

    async publishLostFound(data) {
      // 调用发布接口
      // ...
    },
  },
};
</script>
```

### 2. 社区帖子发布前审核

在 `src/pages/publish-post/publish-post.vue` 中：

```vue
<script>
import {
  checkPostSecurity,
  showSecurityResult,
  SECURITY_SUGGEST,
} from "@/utils/contentSecurity";

export default {
  data() {
    return {
      postData: {
        title: "",
        content: "",
      },
    };
  },
  methods: {
    async handlePublish() {
      // 显示加载中
      uni.showLoading({ title: "正在审核..." });

      try {
        // 进行内容安全审核
        const result = await checkPostSecurity({
          title: this.postData.title,
          content: this.postData.content,
        });

        uni.hideLoading();

        // 审核未通过
        if (!result.isPassed) {
          showSecurityResult(result);
          return;
        }

        // 审核通过，继续发布流程
        await this.submitPost();

        uni.showToast({
          title: "发布成功",
          icon: "success",
        });

        // 跳转回上一页
        uni.navigateBack();
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: "发布失败",
          icon: "none",
        });
      }
    },

    async submitPost() {
      // 调用发布帖子的接口
      // ...
    },
  },
};
</script>
```

### 3. 评论发布前审核

在 `src/pages/post-detail/post-detail.vue` 或评论组件中：

```vue
<script>
import {
  checkCommentSecurity,
  showSecurityResult,
} from "@/utils/contentSecurity";

export default {
  data() {
    return {
      commentContent: "",
      userInfo: {},
    };
  },
  methods: {
    async handleSubmitComment() {
      if (!this.commentContent.trim()) {
        uni.showToast({
          title: "请输入评论内容",
          icon: "none",
        });
        return;
      }

      uni.showLoading({ title: "发送中..." });

      try {
        // 进行评论内容审核
        const result = await checkCommentSecurity({
          content: this.commentContent,
          nickname: this.userInfo.nickname,
        });

        uni.hideLoading();

        if (!result.isPassed) {
          showSecurityResult(result, {
            reviewMessage: "您的评论需要审核，审核通过后将显示",
            riskyMessage: "评论包含违规内容，请修改后重试",
          });

          // 如果需要审核，可以先保存，等待后台审核通过
          if (result.needReview) {
            await this.submitComment({
              content: this.commentContent,
              status: "pending",
            });
            this.commentContent = "";
          }
          return;
        }

        // 审核通过，直接发布
        await this.submitComment({
          content: this.commentContent,
          status: "published",
        });

        this.commentContent = "";
        uni.showToast({
          title: "评论成功",
          icon: "success",
        });
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: "评论失败",
          icon: "none",
        });
      }
    },

    async submitComment(data) {
      // 调用评论接口
      // ...
    },
  },
};
</script>
```

### 4. 批量审核示例

```javascript
import { batchCheckSecurity, SECURITY_SCENE } from "@/utils/contentSecurity";

// 批量审核评论列表
async function checkComments(comments) {
  const results = await batchCheckSecurity(comments, (comment) => ({
    content: comment.text,
    scene: SECURITY_SCENE.COMMENT,
    nickname: comment.userName,
  }));

  return results;
}
```

## 后端实现要求

后端需要实现以下接口来调用微信官方的内容安全接口：

### 1. `/api/security/checkText` (POST)

**请求参数：**

```json
{
  "content": "需检测的文本内容",
  "scene": 2,
  "title": "标题（可选）",
  "nickname": "用户昵称（可选）",
  "signature": "个性签名（可选）"
}
```

**返回格式：**

```json
{
  "errcode": 0,
  "errmsg": "ok",
  "result": {
    "suggest": "pass",
    "label": 100
  },
  "detail": [],
  "trace_id": "xxxxx"
}
```

### 后端实现参考（Node.js）

```javascript
// 需要先获取 access_token
const getAccessToken = async () => {
  // 从缓存或微信服务器获取 access_token
  // ...
};

// 内容安全检查
app.post("/api/security/checkText", async (req, res) => {
  const { content, scene, title, nickname, signature } = req.body;
  const { openid } = req.user; // 从登录态获取用户openid

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`,
      {
        openid,
        scene,
        version: 2,
        content,
        title,
        nickname,
        signature,
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      errcode: -1,
      errmsg: error.message,
    });
  }
});
```

### 后端实现参考（Java Spring Boot）

```java
@RestController
@RequestMapping("/api/security")
public class SecurityController {

    @Autowired
    private WxMaService wxMaService; // 微信小程序服务

    @PostMapping("/checkText")
    public Map<String, Object> checkText(@RequestBody TextCheckRequest request) {
        try {
            String openid = getCurrentUserOpenid(); // 获取当前用户openid

            // 构建请求参数
            Map<String, Object> params = new HashMap<>();
            params.put("openid", openid);
            params.put("scene", request.getScene());
            params.put("version", 2);
            params.put("content", request.getContent());

            if (request.getTitle() != null) {
                params.put("title", request.getTitle());
            }
            if (request.getNickname() != null) {
                params.put("nickname", request.getNickname());
            }
            if (request.getSignature() != null) {
                params.put("signature", request.getSignature());
            }

            // 调用微信接口
            String result = wxMaService.post(
                "https://api.weixin.qq.com/wxa/msg_sec_check",
                new Gson().toJson(params)
            );

            return new Gson().fromJson(result, Map.class);

        } catch (Exception e) {
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("errcode", -1);
            errorResult.put("errmsg", e.getMessage());
            return errorResult;
        }
    }
}
```

## 注意事项

### 1. 接口限制

- 单个 appId 调用上限：**4000 次/分钟**，**2,000,000 次/天**
- 需合理控制调用频率，可考虑在前端做防抖处理

### 2. 用户 openid 要求

- 用户需在**近两小时内访问过小程序**
- 确保传递的 openid 是有效的

### 3. 内容长度限制

- 文本内容最多 **2500 字**
- 超过限制需要分段检查或截断

### 4. 审核策略建议

**通过（pass）：** 直接发布

**需审核（review）：**

- 保存为待审核状态
- 后台人工审核后再发布
- 通知用户等待审核

**违规（risky）：**

- 拒绝发布
- 提示用户修改内容
- 记录违规日志

### 5. 错误处理

建议在审核接口异常时，采用**安全优先**策略：

- 默认标记为需要人工审核
- 不直接发布可能存在风险的内容

## API 文档参考

微信官方文档：
https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/sec-center/sec-check/msgSecCheck.html

## 常见问题

### Q1: 如何获取用户的 openid？

A: 在用户登录时，通过 `wx.login()` 和后端接口获取并保存。

### Q2: 审核失败率很高怎么办？

A: 检查是否误传了敏感词，可以在前端做一些基础的敏感词过滤。

### Q3: 是否需要审核图片？

A: 如果内容包含图片，建议同时调用 `imgSecCheck` 接口审核图片。

### Q4: 审核通过后还需要人工复审吗？

A: 建议对重要内容增加人工抽查机制，提高内容质量。

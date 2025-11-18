# 登录功能调试说明

## 问题分析

错误信息：`{"msg":"Required request parameter 'code' for method parameter type String is not present","code":500}`

这表示后端接口期望接收 `code` 参数，但请求中没有包含或参数名不匹配。

## 已实现的功能

### 1. 账号密码登录

- **接口**: `/edu/student/login`
- **方法**: POST
- **参数**:
  ```javascript
  {
    studentNo: '学号',
    password: '密码'
  }
  ```
- **调用位置**: `accountLogin` 方法

### 2. 微信手机号一键登录

- **接口**: `/edu/student/loginByWechat`
- **方法**: POST
- **参数**:
  ```javascript
  {
    code: 'wx.login获取的code',
    encryptedData: '加密的手机号数据',
    iv: '加密向量'
  }
  ```
- **调用位置**: `getPhoneNumber` 方法

### 3. 绑定手机号

- **接口**: `/edu/student/bindPhone`
- **方法**: POST
- **参数**:
  ```javascript
  {
    code: 'wx.login获取的code',
    encryptedData: '加密的手机号数据',
    iv: '加密向量'
  }
  ```
- **调用位置**: `handlePhoneNumberForBind` 方法

## 调试步骤

### 1. 检查控制台日志

代码中已添加详细的日志输出，请查看：

```javascript
console.log("调用微信登录接口，参数:", { code, encryptedData, iv, phoneCode });
```

### 2. 确认参数传递

打开微信开发者工具的网络面板，查看实际发送的请求：

- 检查请求的 URL 是否正确
- 检查请求的 Method 是否为 POST
- 检查请求体中是否包含 `code` 参数
- 检查 `code` 参数的值是否为空

### 3. 后端接口要求确认

根据错误信息，需要确认后端接口的具体要求：

**可能的情况 1**: 后端只需要 `code` 参数

```javascript
// 修改 loginByWechat 调用
const data = await loginByWechat({
  code: code,
});
```

**可能的情况 2**: 参数名不匹配
后端可能期望的参数名是 `jsCode` 或 `loginCode` 而不是 `code`

**可能的情况 3**: 需要额外参数
后端可能还需要其他参数，如 `appId`, `sessionKey` 等

## 常见问题排查

### Q1: code 为空或 undefined

**原因**: `wx.login()` 调用失败或异步问题
**解决**:

```javascript
uni.login({
  success: async (loginRes) => {
    console.log("wx.login结果:", loginRes);
    if (!loginRes.code) {
      console.error("获取code失败");
      return;
    }
    const code = loginRes.code;
    // 继续后续操作
  },
});
```

### Q2: getPhoneNumber 获取不到数据

**原因**:

- 小程序未配置手机号权限
- 用户拒绝授权
- 开发环境无法获取真实数据

**解决**:

- 检查小程序后台是否开通了手机号权限
- 使用"模拟登录"按钮进行开发测试
- 确保在真机上测试

### Q3: 跨域或网络错误

**原因**: 小程序未配置服务器域名
**解决**:

- 在微信公众平台配置服务器域名
- 开发时可以在开发者工具中勾选"不校验合法域名"

## 代码修改建议

### 方案一: 简化参数（推荐先尝试）

如果后端只需要 `code`，修改 `src/api/student.js`:

```javascript
export const loginByWechat = (data) => {
  return request.post("/edu/student/loginByWechat", {
    code: data.code,
  });
};
```

### 方案二: 确认参数名

如果参数名不是 `code`，修改为正确的参数名：

```javascript
export const loginByWechat = (data) => {
  return request.post("/edu/student/loginByWechat", {
    jsCode: data.code, // 或其他参数名
    encryptedData: data.encryptedData,
    iv: data.iv,
  });
};
```

### 方案三: 添加默认值

为参数添加默认值防止为空：

```javascript
const data = await loginByWechat({
  code: code || "",
  encryptedData: encryptedData || "",
  iv: iv || "",
});
```

## 测试流程

1. **账号密码登录测试**

   - 输入学号和密码
   - 点击登录按钮
   - 查看控制台是否有错误
   - 检查是否成功跳转

2. **微信登录测试**

   - 点击"获取微信手机号"按钮
   - 授权后查看控制台日志
   - 确认 `code` 参数是否正确获取
   - 检查接口调用是否成功

3. **模拟登录测试**（开发环境）
   - 点击"模拟登录"按钮
   - 确认能否正常登录和跳转

## 联系后端

如果问题持续存在，请联系后端开发人员确认：

1. `/edu/student/loginByWechat` 接口的完整参数要求
2. 参数的具体格式和类型
3. 是否需要特殊的请求头
4. 接口文档或 Swagger 地址

## 当前代码状态

✅ 已集成 API 接口调用  
✅ 已添加详细的错误日志  
✅ 已处理异步调用顺序  
✅ 已添加参数容错处理

等待确认后端接口的具体参数要求。

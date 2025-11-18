# 图片上传工具使用文档

## 功能说明

封装了 uni-app 的图片选择和上传功能,提供多种便捷的使用方式。

## API 说明

### 1. chooseAndUploadImage(options)

选择图片并自动上传到服务器。

**参数:**

```javascript
{
  count: 1,              // 最多可以选择的图片张数，默认1
  sizeType: ['original', 'compressed'],  // 原图/压缩图，默认都有
  sourceType: ['album', 'camera']        // 相册/相机，默认都有
}
```

**返回:** Promise<Object>

**响应格式:**

```javascript
{
  url: "http://域名/profile/upload/2025/11/18/xxx.jpg",
  fileName: "/profile/upload/2025/11/18/xxx.jpg",
  newFileName: "xxx.jpg",
  originalFilename: "原始文件名.jpg"
}
```

**使用示例:**

```javascript
import { chooseAndUploadImage } from "@/utils/upload";

// 基础用法
try {
  const result = await chooseAndUploadImage();
  console.log("图片URL:", result.url);
} catch (error) {
  console.error("上传失败:", error);
}

// 自定义选项
const result = await chooseAndUploadImage({
  count: 3,
  sourceType: ["album"], // 只从相册选择
});
```

---

### 2. chooseImage(options)

仅选择图片,不上传。

**参数:** 同 `chooseAndUploadImage`

**返回:** Promise<Array<string>> - 图片临时路径数组

**使用示例:**

```javascript
import { chooseImage } from "@/utils/upload";

const tempPaths = await chooseImage({ count: 3 });
console.log("选择的图片:", tempPaths);
// ['wxfile://temp/xxx.jpg', 'wxfile://temp/yyy.jpg']
```

---

### 3. uploadImage(filePath, options)

上传单个图片文件。

**参数:**

- `filePath` (string): 要上传的文件路径
- `options` (Object):
  ```javascript
  {
    url: 'http://...',  // 上传地址，默认使用配置的地址
    name: 'file',       // 文件对应的 key，默认为 'file'
    formData: {}        // HTTP 请求中其他额外的 form data
  }
  ```

**返回:** Promise<Object>

**使用示例:**

```javascript
import { uploadImage } from "@/utils/upload";

// 基础用法
const result = await uploadImage("wxfile://temp/xxx.jpg");

// 自定义参数
const result = await uploadImage("wxfile://temp/xxx.jpg", {
  formData: {
    userId: "123",
    type: "avatar",
  },
});
```

---

### 4. uploadMultipleImages(filePaths, options)

批量上传多个图片。

**参数:**

- `filePaths` (Array<string>): 文件路径数组
- `options` (Object): 同 `uploadImage`

**返回:** Promise<Array<Object>> - 所有上传结果数组

**使用示例:**

```javascript
import { uploadMultipleImages } from "@/utils/upload";

const filePaths = ["wxfile://temp/1.jpg", "wxfile://temp/2.jpg"];
const results = await uploadMultipleImages(filePaths);
console.log("上传结果:", results);
// [{ url: '...', fileName: '...' }, { url: '...', fileName: '...' }]
```

---

### 5. takePhotoAndUpload()

拍照并上传(快捷方法)。

**返回:** Promise<Object>

**使用示例:**

```javascript
import { takePhotoAndUpload } from "@/utils/upload";

const result = await takePhotoAndUpload();
console.log("照片URL:", result.url);
```

---

### 6. chooseFromAlbumAndUpload(count)

从相册选择并上传(快捷方法)。

**参数:**

- `count` (number): 最多可以选择的图片张数，默认 1

**返回:** Promise<Object>

**使用示例:**

```javascript
import { chooseFromAlbumAndUpload } from "@/utils/upload";

const result = await chooseFromAlbumAndUpload(3);
console.log("图片URL:", result.url);
```

---

## 完整使用示例

### 示例 1: 头像上传

```vue
<template>
  <view>
    <image :src="avatar" @tap="uploadAvatar" />
  </view>
</template>

<script setup>
import { ref } from "vue";
import { chooseAndUploadImage } from "@/utils/upload";

const avatar = ref("");

const uploadAvatar = async () => {
  try {
    const result = await chooseAndUploadImage({
      count: 1,
      sizeType: ["compressed"],
    });
    avatar.value = result.url;
  } catch (error) {
    uni.showToast({
      title: "上传失败",
      icon: "none",
    });
  }
};
</script>
```

### 示例 2: 多图上传

```vue
<template>
  <view>
    <view v-for="(img, index) in images" :key="index">
      <image :src="img" />
    </view>
    <button @tap="uploadImages">选择图片</button>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { chooseImage, uploadMultipleImages } from "@/utils/upload";

const images = ref([]);

const uploadImages = async () => {
  try {
    // 1. 先选择图片
    const tempPaths = await chooseImage({ count: 9 });

    // 2. 批量上传
    const results = await uploadMultipleImages(tempPaths);

    // 3. 保存URL
    images.value = results.map((r) => r.url);
  } catch (error) {
    uni.showToast({
      title: "上传失败",
      icon: "none",
    });
  }
};
</script>
```

### 示例 3: 签到拍照上传

```vue
<template>
  <view>
    <image v-if="photoUrl" :src="photoUrl" />
    <button @tap="takePhoto">拍照签到</button>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { takePhotoAndUpload } from "@/utils/upload";
import { submitCheckin } from "@/api/checkin";

const photoUrl = ref("");

const takePhoto = async () => {
  try {
    // 拍照并上传
    const result = await takePhotoAndUpload();
    photoUrl.value = result.url;

    // 提交签到
    await submitCheckin({
      taskId: "123",
      photoUrl: result.url,
    });

    uni.showToast({ title: "签到成功", icon: "success" });
  } catch (error) {
    uni.showToast({ title: "操作失败", icon: "none" });
  }
};
</script>
```

### 示例 4: 自定义上传地址

```javascript
import { uploadImage } from "@/utils/upload";

const result = await uploadImage("wxfile://temp/xxx.jpg", {
  url: "https://api.example.com/upload",
  name: "image",
  formData: {
    folder: "avatars",
    compress: true,
  },
});
```

---

## 配置说明

默认上传地址配置在 `src/utils/upload.js` 中:

```javascript
const UPLOAD_URL = "http://192.168.137.1:8081/common/upload";
```

如需修改,请编辑该文件中的 `UPLOAD_URL` 常量。

---

## 错误处理

所有方法都返回 Promise,建议使用 try-catch 进行错误处理:

```javascript
try {
  const result = await chooseAndUploadImage();
  // 处理成功结果
} catch (error) {
  console.error("错误信息:", error.message);
  uni.showToast({
    title: error.message || "操作失败",
    icon: "none",
  });
}
```

---

## 注意事项

1. **权限问题**: 使用相机功能需要用户授权相机权限
2. **文件大小**: 注意图片大小限制,建议使用压缩图
3. **网络环境**: 上传需要网络连接,注意处理网络错误
4. **加载提示**: 工具已内置加载提示,无需额外处理
5. **多图上传**: 批量上传会显示进度提示(如: 上传中 1/3)

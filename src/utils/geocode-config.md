# 地理编码服务配置说明

## 📍 功能说明

`src/utils/geocode.js` 提供了经纬度与地址互转的功能,支持:

- ✅ 逆地理编码(坐标 → 地址)
- ✅ 距离计算
- ✅ 支持腾讯地图和高德地图两种服务

## 🔑 API 密钥配置

### 方式一: 使用腾讯地图(推荐)

1. **注册账号**: https://lbs.qq.com/
2. **创建应用**: 控制台 → 应用管理 → 创建应用
3. **添加 Key**: 选择应用 → 添加 Key → 选择 WebServiceAPI
4. **配置密钥**: 在 `src/utils/geocode.js` 中修改:
   ```javascript
   const TENCENT_MAP_KEY = "你的腾讯地图Key";
   ```

### 方式二: 使用高德地图

1. **注册账号**: https://lbs.amap.com/
2. **创建应用**: 控制台 → 应用管理 → 创建新应用
3. **添加 Key**: 选择应用 → 添加 Key → 服务平台选择 Web 服务
4. **配置密钥**: 在 `src/utils/geocode.js` 中修改:
   ```javascript
   const AMAP_KEY = "你的高德地图Key";
   ```
5. **切换服务商**: 在调用时指定 `provider: 'amap'`

## 📝 使用示例

### 1. 基础用法 - 获取地址

```javascript
import { getAddress } from "@/utils/geocode";

// 在 sign-in.vue 中使用
const getLocation = async () => {
  uni.getLocation({
    type: "gcj02",
    success: async (res) => {
      try {
        const address = await getAddress(res.latitude, res.longitude);
        console.log("当前地址:", address);
        // 例: "北京市海淀区中关村大街1号"
      } catch (error) {
        console.error("地址解析失败", error);
      }
    },
  });
};
```

### 2. 完整信息 - 获取详细地址组件

```javascript
import { reverseGeocode } from "@/utils/geocode";

const result = await reverseGeocode(39.908823, 116.39747);
console.log(result);
// {
//   address: "北京市东城区...",
//   formattedAddress: "北京市东城区正义路2号",
//   province: "北京市",
//   city: "北京市",
//   district: "东城区",
//   street: "正义路",
//   streetNumber: "2号",
//   adcode: "110101"
// }
```

### 3. 切换地图服务商

```javascript
import { reverseGeocode } from "@/utils/geocode";

// 使用腾讯地图(默认)
const result1 = await reverseGeocode(lat, lng, "tencent");

// 使用高德地图
const result2 = await reverseGeocode(lat, lng, "amap");
```

### 4. 计算距离

```javascript
import { getDistance, formatDistance } from "@/utils/geocode";

const distance = getDistance(39.908823, 116.39747, 39.910925, 116.413384);
console.log("距离:", distance); // 1234.56 (米)

const formatted = formatDistance(distance);
console.log("格式化:", formatted); // "1.2公里"
```

## ⚙️ 在 sign-in.vue 中的应用

已经集成到签到页面中:

```javascript
// 获取位置信息
const getLocation = () => {
  locationStatus.value = "正在获取位置信息...";

  uni.getLocation({
    type: "gcj02",
    success: async (res) => {
      location.value = {
        latitude: res.latitude,
        longitude: res.longitude,
        address: "",
      };
      locationStatus.value = "位置获取成功，正在解析地址...";

      // 获取真实地址
      try {
        const address = await getAddress(res.latitude, res.longitude);
        location.value.address = address;
        locationStatus.value = "地址解析成功";
      } catch (error) {
        console.error("地址解析失败", error);
        location.value.address = "地址解析失败，但位置已获取";
      }
    },
    fail: (err) => {
      console.error("获取位置失败", err);
      locationStatus.value = "位置获取失败";
    },
  });
};
```

## 🚨 注意事项

### 1. API 密钥安全

⚠️ **不要将真实的 API 密钥直接写在代码中提交到 Git!**

建议使用环境变量:

```javascript
// .env.development
VITE_TENCENT_MAP_KEY = your_dev_key;

// .env.production
VITE_TENCENT_MAP_KEY = your_prod_key;

// geocode.js
const TENCENT_MAP_KEY = import.meta.env.VITE_TENCENT_MAP_KEY;
```

### 2. 请求频率限制

- 腾讯地图: 免费版每日 10 万次
- 高德地图: 免费版每日 30 万次

### 3. 坐标系统

- `gcj02`: 国测局坐标(火星坐标),适用于国内地图
- `wgs84`: GPS 坐标,国际标准
- 本项目使用 `gcj02` 与地图 API 保持一致

### 4. 网络请求

地址解析需要网络请求,建议:

- 添加超时处理
- 提供降级方案(仅显示经纬度)
- 缓存常用地址

### 5. 权限配置

确保 `manifest.json` 中配置了定位权限:

```json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "你的位置信息将用于签到验证"
      }
    }
  }
}
```

## 🔄 降级方案

如果暂时无法配置 API 密钥,可以使用简化版本:

```javascript
// sign-in.vue 中的临时方案
const getLocation = () => {
  uni.getLocation({
    type: "gcj02",
    success: (res) => {
      location.value = {
        latitude: res.latitude,
        longitude: res.longitude,
        address: `经度: ${res.longitude.toFixed(
          6
        )}, 纬度: ${res.latitude.toFixed(6)}`,
      };
    },
  });
};
```

## 📚 API 文档

- [腾讯地图逆地理编码](https://lbs.qq.com/service/webService/webServiceGuide/webServiceGcoder)
- [高德地图逆地理编码](https://lbs.amap.com/api/webservice/guide/api/georegeo)

## ❓ 常见问题

**Q: 报错 "KEY 鉴权失败"**  
A: 检查密钥是否正确,是否选择了正确的服务类型(WebServiceAPI)

**Q: 地址解析很慢**  
A: 网络问题,可以添加超时处理或使用 CDN 加速

**Q: 地址不准确**  
A: 检查坐标系是否正确,GPS 坐标需要转换为 GCJ02

**Q: 小程序中无法使用**  
A: 需要在小程序后台配置服务器域名白名单:

- 腾讯地图: `https://apis.map.qq.com`
- 高德地图: `https://restapi.amap.com`

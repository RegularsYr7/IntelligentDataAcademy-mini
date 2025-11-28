

// 腾讯地图WebService API Key
const TENCENT_MAP_KEY = "2H7BZ-W3DK4-QX6U4-K6UCB-DQDUQ-64BOD"; 
/**
 * 逆地理编码 - 将经纬度转换为地址
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Promise<Object>} 地址信息
 */
export const reverseGeocode = (latitude, longitude) => {
  if (!latitude || !longitude) {
    throw new Error("经纬度参数不能为空");
  }

  return reverseTencentGeocode(latitude, longitude);
};

/**
 * 腾讯地图逆地理编码
 */
const reverseTencentGeocode = (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: "https://apis.map.qq.com/ws/geocoder/v1/",
      data: {
        location: `${latitude},${longitude}`, // 格式: 纬度,经度
        key: TENCENT_MAP_KEY,
        get_poi: 0, // 不返回周边POI列表
      },
      method: "GET",
      success: (res) => {
        console.log("腾讯地图API响应:", res);

        if (res.statusCode === 200) {
          if (res.data.status === 0) {
            // 请求成功
            const result = res.data.result;
            const adInfo = result.ad_info || {};
            const addressComponent = result.address_component || {};

            resolve({
              address: result.address,
              formattedAddress:
                result.formatted_addresses?.recommend || result.address,
              province: adInfo.province || "",
              city: adInfo.city || "",
              district: adInfo.district || "",
              street: addressComponent.street || "",
              streetNumber: addressComponent.street_number || "",
              adcode: adInfo.adcode || "",
            });
          } else {
            // API返回错误
            console.error("腾讯地图API错误:", res.data);
            reject(
              new Error(res.data.message || `地址解析失败: ${res.data.status}`)
            );
          }
        } else {
          reject(new Error(`HTTP请求失败，状态码：${res.statusCode}`));
        }
      },
      fail: (error) => {
        console.error("请求失败:", error);
        reject(new Error("网络请求失败，请检查网络连接"));
      },
    });
  });
};

/**
 * 简化版逆地理编码 - 仅返回格式化地址字符串
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @returns {Promise<string>} 地址字符串
 */
export const getAddress = async (latitude, longitude) => {
  try {
    const result = await reverseGeocode(latitude, longitude);
    return result.formattedAddress || result.address;
  } catch (error) {
    console.error("获取地址失败:", error);
    throw error;
  }
};

/**
 * 计算两点之间的距离(米)
 * @param {number} lat1 - 点1纬度
 * @param {number} lng1 - 点1经度
 * @param {number} lat2 - 点2纬度
 * @param {number} lng2 - 点2经度
 * @returns {number} 距离(米)
 */
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const rad = (d) => (d * Math.PI) / 180.0;
  const radLat1 = rad(lat1);
  const radLat2 = rad(lat2);
  const a = radLat1 - radLat2;
  const b = rad(lng1) - rad(lng2);

  let s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );

  s = s * 6378137; // 地球半径(米)
  s = Math.round(s * 10000) / 10000;

  return s;
};

/**
 * 格式化距离显示
 * @param {number} distance - 距离(米)
 * @returns {string} 格式化后的距离
 */
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}米`;
  } else {
    return `${(distance / 1000).toFixed(1)}公里`;
  }
};

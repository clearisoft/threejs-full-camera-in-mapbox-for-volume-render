# Mapbox Three.js 完整相机同步实现

## 项目背景

Mapbox 官方提供的 Three.js 图层参考代码未提供完整的相机同步功能，其 `worldMatrix`、`position` 和 `rotation` 属性均未被赋值。如果你的 Three.js 代码依赖这些属性（如使用体渲染算法），会导致渲染错误。

本项目实现了一个与 Mapbox 相机完全同步的完整 Three.js 相机，确保任何 Three.js 代码都能在 Mapbox 项目中正常运行。项目使用墨卡托投影（Mercator Projection）进行地理坐标转换。

![项目演示](demo.gif)
*（示例：动态展示 Mapbox 与 Three.js 同步渲染效果）*

---

## 项目运行步骤

1. **安装依赖**
   npm install

2. **运行项目**
   npm run serve

3. **观看效果**
   http://localhost:8080/demo/mapbox


### 关键代码

在/demo/mapbox/CameraHelper.js中，调用方式
1. 创建camera：const camera = new THREE.PerspectiveCamera();
2. 创建helper：const cameraHelper = new CameraHelper(camera, map);
3. 更新helper：在render: function (gl, matrix) {...} 中调用cameraHelper.update(matrix);

### 附言
如果你对项目中的雷达和风场的显示效果感兴趣，可以联系我，邮箱:clearisoft@aliyun.com
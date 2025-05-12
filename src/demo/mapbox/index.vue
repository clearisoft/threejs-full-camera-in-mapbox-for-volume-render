<template>
  <div class="fillup">
    <div id="map" style="width: 100%; height: 100%"></div>
    <div class="button-container">
      <button v-if="!inSelection" @click="select(1)">框选</button>
      <button v-if="!inSelection" @click="select(2)">直剖</button>
      <button v-if="!inSelection" @click="select(3)">平剖</button>
      <button v-if="inSelection" @click="exit()">退出</button>
    </div>
  </div>
</template>

<script>

  /* eslint-disable */
  import axios from 'axios'
  import * as THREE from 'three'
  import { CameraHelper } from "./CameraHelper.js"
  import { Vapor, Map2D } from "../../vapor.min.js"
  import mapboxgl from 'mapbox-gl';

  export default {
    name: 'MapboxDemo',
    data() {
      return {
        inSelection: false,
      };
    },
    mounted() {
      mapboxgl.accessToken = 'pk.eyJ1IjoibGlseS1zdW1tZXIiLCJhIjoiY2x1dDd4Z3lmMHVvZzJrbzlxbW5yZTU5MCJ9.B5k0xkDtnQVJp44Svzeaqg';
      const map = new mapboxgl.Map({
        container: 'map',
        style: "mapbox://styles/mapbox/dark-v10",
        center: [116.2, 32.5],
        zoom: 8,
        antialias: true
      });

      // 将变量放在this下会占用系统资源
      const camera = new THREE.PerspectiveCamera();
      const cameraHelper = new CameraHelper(camera, map);
      let scene = null;
      let renderer = null;

      const customLayer = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
          scene = new THREE.Scene();
          window.vapor = createVapor(document.getElementById('map'), camera);
          // 将插件的根物体添加到场景中
          scene.add(window.vapor.getScene());

          // 可适当抬高插件，避免和其他物体发生z-flight
          window.vapor.getScene().position.y = 100;

          renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
            alpha: true,
            logarithmicDepthBuffer: true,
            preserveDrawingBuffer:true,
          });

          renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
          renderer.autoClear = false;
        },
        render: function (gl, matrix) {
          // 同步相机
          cameraHelper.update(matrix);

          renderer.resetState();
          window.vapor.animate();
          renderer.render(scene, camera);

          map.triggerRepaint();
        }
      };

      map.on('style.load', () => {
        map.addLayer(customLayer, 'poi-label');
      });

      function createVapor(domElement, camera) {
        // 配置插件
        const config = {
          // 数据源地址
          dataUrl: 'http://61.155.3.234:10000/prod-api',
          // 相机初始位置
          homePosition: {
            latitude: 32.8,
            longitude: 118.697,
            altitude: 650 * 1000,
          },
          // 是否显示雷达
          showRadar: true,
          // 是否显示风场
          showWind: true,
          // 是否显示温度
          showHumidity: false,
          // 是否显示湿度
          showTemperature: true,
          // 是否显示地面数据
          showGround: false,
          // 使用系统相机，禁用插件控制器
          disableControls: true,
        }

        // 创建插件
        const vapor = new Vapor(domElement, config, camera);
        // 获取全部色例
        axios.get('http://61.155.3.234:10000/prod-api/system/colorCoding/list', {}).then(response => {
          const rep = response.data || [];
          for (const i of rep.data) {
            if (i.type == 'radar-zh' ||
              i.type == 'wind' ||
              i.type == 'humidity' ||
              i.type == 'temperature') {
              vapor.updateColor(i);
            }
          }
        })

        // 启动插件, 此处设置时间,帧数，帧与帧之间的时间差（单位秒）
        vapor.run('202407040800', -1, 360);

        return vapor;
      }

      this.select = (n) => {
        const x1y1 = Map2D.latLongToXY(-35.2, 116.2 );
        const x2y2 = Map2D.latLongToXY(-34.5, 116.9 );
        vapor.enterSelection(n, {x: x1y1.x, z: x1y1.y}, {x: x2y2.x, z: x2y2.y})
        this.inSelection = true
      }

      this.exit = () => {
        vapor.exitSelection();
        this.inSelection = false
      }
    },
    methods: {
    },
  }

</script>

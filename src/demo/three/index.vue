<template>
  <div class="fillup">
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
  import { Vapor, Map2D } from "../../vapor.min.js"

  export default {
    name: 'ThreeDemo',
    data() {
      return {
        inSelection: false
      };
    },
    mounted() {
      function createVapor(domElement) {
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
        }

        // 创建插件
        const vapor = new Vapor(domElement, config);
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

      // 初始化renderer
      // 为了提高精度，使用对数深度
      const renderer = new THREE.WebGLRenderer({alpha: false, antialias: true, logarithmicDepthBuffer: true, preserveDrawingBuffer:true});
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.shadowMap.enabled = true;
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.querySelector('.fillup').appendChild( renderer.domElement );

      // 初始化场景，黑色背景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color( 0x1f1f1f );

      // 创建一个平面，作为地面
      const xy = Map2D.latLongToXY(-34.85, 118.7);
      const planeGeometry = new THREE.PlaneGeometry(1000000, 1000000);
      const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(xy.x, 0, xy.y);
      scene.add(plane);

      // 创建一个球体，作为参照物
      const sphereGeometry = new THREE.SphereGeometry(50000, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(sphereGeometry, material);
      cube.position.set(xy.x, 0, xy.y);
      scene.add(cube);

      // 创建插件
      const vapor = createVapor(renderer.domElement);
      // 将插件的根物体添加到场景中
      scene.add(vapor.getScene());
      // 可适当抬高插件，避免和其他物体发生z-flight
      vapor.getScene().position.y = 100;

      // 启动渲染
      function animate() {
        requestAnimationFrame( animate );

        // 调用插件渲染函数
        vapor.animate();

        // 启动插件后，建议使用插件相机
        // 建议先将系统相机的位置和角度复制给插件相机后再切换，避免镜头跳变
        renderer.render( scene, vapor.getInternalCamera());
      }

      animate();

      // 监听窗口变化
      window.addEventListener( 'resize',  () => {
        renderer.setSize( window.innerWidth, window.innerHeight );
      });

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

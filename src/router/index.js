import VueRouter from 'vue-router'
import ThreeDemo from '../demo/three'
import MapboxDemo from '../demo/mapbox'

export default new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/demo/three',
      name: 'ThreeDemo',
      component: ThreeDemo
    },
    {
      path: '/demo/mapbox',
      name: 'MapboxDemo',
      component: MapboxDemo
    },
  ]
})

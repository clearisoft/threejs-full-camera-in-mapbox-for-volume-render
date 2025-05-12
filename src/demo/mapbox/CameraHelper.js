import * as THREE from 'three'
import mapboxgl from 'mapbox-gl';

class CameraHelper {
  constructor(camera, map) {
    this.camera = camera
    this.map = map

    const worldOriginMercator = mapboxgl.MercatorCoordinate.fromLngLat([0,0]);
    const worldScale = worldOriginMercator.meterInMercatorCoordinateUnits();
    const worldRotate = [-Math.PI / 2, 0, 0];

    this.worldMatrix = new THREE.Matrix4();
    this.worldMatrix.compose(
      new THREE.Vector3(
        worldOriginMercator.x,
        worldOriginMercator.y,
        worldOriginMercator.z
      ),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(worldRotate[0], worldRotate[1], worldRotate[2])
      ),
      new THREE.Vector3(worldScale, -worldScale, worldScale)
    );
  }

  update(matrix) {
    const mapMatrix = new THREE.Matrix4().fromArray(matrix);
    const mvpMatrix = new THREE.Matrix4().multiplyMatrices(mapMatrix, this.worldMatrix);

    this.camera.fov = this.map.transform.fov;
    this.camera.aspect = this.map.transform.aspect;
    this.camera.near = this.map.transform._nearZ;
    this.camera.far = this.map.transform._farZ;
    this.camera.updateProjectionMatrix();
    const projectionMatrixInverse = this.camera.projectionMatrixInverse;

    const viewMatrix = new THREE.Matrix4().multiplyMatrices(projectionMatrixInverse, mvpMatrix);
    const viewMatrixInvert = viewMatrix.clone().invert();
    this.camera.matrixWorld.copy(viewMatrixInvert);
    this.camera.matrixWorldInverse.copy(viewMatrix);
    this.camera.matrixAutoUpdate = false;
    this.camera.matrixWorldAutoUpdate = false;

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    this.camera.matrixWorld.decompose(position, quaternion, scale);
    this.camera.position.set(position.x, position.y, position.z)
    const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');
    this.camera.rotation.set(euler.x, euler.y, euler.z);
  }
}

export { CameraHelper }
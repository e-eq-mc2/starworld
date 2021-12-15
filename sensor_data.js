const THREE = require('three')
const Common = require("./lib/common.js")

export class SensorData {
  constructor(scene) {
    this.heightmap     = []
    this.heightmapMesh = []
    //for (let i = 0; i < width; ++i) {
    //  const h = Common.randomReal(0, 10)
    //  this.heightmap.push(h)
    //}

    this.scene = scene
    this.offsetX = 0
    this.offsetY = 0
    this.offsetZ = 0
    this.pixelSizeX = 1
    this.pixelSizeY = 1
  }

  update(data) {
    this.heightmap = data.heightmap

    //this.updateMesh()
  }

  initMesh() {
    this.removeMeshes()
    for (let i = 0; i < this.heightmap.length; ++i) {
      const j = this.heightmap[i]
      const x = i * this.pixelSizeX
      const y = j * this.pixelSizeY
      const gx = this.offsetX + x +  this.pixelSizeX / 2
      const gy = this.offsetX + y +        y / 2
      const gz = this.offsetZ

      const geometry = new THREE.PlaneGeometry(1, 1)
      //const material = new THREE.MeshBasicMaterial( {color: 0xffffff * Common.randomReal(), opacity: 1.0, transparent: true, depthTest: true, side: THREE.DoubleSide} );
      const material = new THREE.MeshBasicMaterial( {color: 0x000000, opacity: 1.0, transparent: true, depthTest: true, side: THREE.DoubleSide} );
      const mesh = new THREE.Mesh( geometry, material )
      mesh.scale.set(this.pixelSizeX, y, 1)
      mesh.position.set(x + this.pixelSizeX * 0.5, y * 0.5, 0)

      this.heightmapMesh.push(mesh)
      this.scene.add(mesh)
    }
  }

  removeMeshes() {
   for (let i = 0; i < this.heightmapMesh.length; ++i) {
      const m = this.heightmapMesh[i]
      this.scene.remove(m)
      m.material.dispose()
      m.geometry.dispose()
    }
    this.heightmapMesh = []
  }

  updateMesh() {
    if ( this.heightmap.length !=  this.heightmapMesh.length) this.initMesh()

    for (let i = 0; i < this.heightmap.length; ++i) {
      const j = this.heightmap[i]
      const x = i * this.pixelSizeX
      const y = j * this.pixelSizeY
      const gx = this.offsetX + x +  this.pixelSizeX / 2
      const gy = this.offsetX + y +  y / 2
      const gz = this.offsetZ

      const mesh = this.heightmapMesh[i]
      mesh.scale.set(this.pixelSizeX, y, 1)
      mesh.position.set(x + this.pixelSizeX * 0.5, y * 0.5, 0)
    }
  }
}

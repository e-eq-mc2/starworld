const THREE = require('three')
const MeshLine         = require('three.meshline').MeshLine;
const MeshLineMaterial = require('three.meshline').MeshLineMaterial;
const Common     = require("./lib/common.js")

export class Star {
  constructor() {
    this.position = new THREE.Vector3(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.wind     = new THREE.Vector3(0, 0, 0)
    this.gravity  = -9.8 // m/s^2
    this.fr       = 0.01
    this.t        = 0
    this.collisionCount = 0
    this.maxCollisions  = 100
  }

  initLine(resolution) {
    this.line = new Star.Line(this.position, resolution)
    return this.line.mesh
  }

  update(dt = 0.03) {
    //console.log(this.velocity)
    this.t += dt
    this.position.x += this.velocity.x * dt
    this.position.y += this.velocity.y * dt
    this.position.z += this.velocity.z * dt

    const l  = this.velocity.length()
    const dragMagnitude = this.fr * l

    this.velocity.x += (- dragMagnitude * (this.velocity.x - this.wind.x)               ) * dt
    this.velocity.y += (- dragMagnitude * (this.velocity.y - this.wind.y) + this.gravity) * dt
    this.velocity.z += (- dragMagnitude * (this.velocity.z - this.wind.z)               ) * dt

    this.checkCollision()

    this.line.update(this.position)
  }

  isColliding() {
    if ( this.isExceededColision() ) return false

    const c = this.position.y < 0
    return c
  }

  isExceededColision() {
    return this.collisionCount > this.maxCollisions
  }

  checkCollision(){
    if ( ! this.isColliding() ) return
    ++this.collisionCount

    this.position.y = 0
    this.velocity.y = - this.velocity.y

    const rr = this.russianRoulette() 
    //console.log(rr)

    //this.velocity.x = this.velocity.x * rr.x
    //this.velocity.y = this.velocity.y * rr.y
    //this.velocity.z = this.velocity.z * rr.z
    this.velocity.x = rr.x * 20
    this.velocity.y = rr.y * 20
    this.velocity.z = rr.z * 20
  }

  russianRoulette() {
    const e = 20
    const r0 = Common.randomReal()
    const r1 = Common.randomReal()
    const cosPhi = Math.cos(2 * Math.PI * r0)
    const sinPhi = Math.sin(2 * Math.PI * r0)

    const cosTheta = Math.pow(1.0 - r1, 1.0 / (e + 1.0))
    const sinTheta = Math.sqrt(1.0 - cosTheta * cosTheta)

    const x = sinTheta * cosPhi
    const y = sinTheta * sinPhi
    const z = cosTheta

    const v = new THREE.Vector3(x, z, y)
    return v
  }

}

// https://zenn.dev/mebiusbox/books/8d9c42883df9f6/viewer/66a2a2

Star.Line = class {
  constructor(pos, resolution) {
    const lineLength = 20
    const points = []
    for (let i=0; i<lineLength; ++i) {
      points.push(pos)
    }

    // Create the line mesh
    this.meshLine = new MeshLine()
    this.meshLine.setPoints(points, p => { return p } ) // makes width taper (p is a decimal percentage of the number of points)

    this.initMesh(resolution)
  }

  initMesh(resolution) {
    const material = this.createMaterial(resolution)

    this.mesh = new THREE.Mesh(this.meshLine.geometry, material)
    this.mesh.frustumCulled = false

    return this.mesh
  }

  updateResolution(r) {
    this.mesh.material.uniforms.resolution.value.copy( r );
  }

  createMaterial(resolution) {
    //const color = new THREE.Color( 0xffffff * Common.randomReal() )
    const color = new THREE.Color( 0xffffff )

    // Create the line material
    const material = new MeshLineMaterial({
      color: color,
      opacity: 1,
      resolution: resolution,
      sizeAttenuation: 2,
      lineWidth: 1,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      transparent: false,
      side: THREE.DoubleSide
    })

    return material
  }

  update(pos) {
    // Advance the trail by one position
    this.meshLine.advance(pos)
  }
}

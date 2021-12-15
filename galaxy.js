const THREE    = require('three')
const Common   = require("./lib/common.js")
import { Star       }  from  './star.js'
import { SensorData }  from  './sensor_data.js'

export class Galaxy {
  constructor(num, scene) {
    this.size = new THREE.Vector3(320, 170, 100)

    this.sensorData = new SensorData(scene)

    const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
    this.stars = []
    for ( var i = 0; i < num; i ++ ) {
      const x = Common.randomReal(0, this.size.x)
      const y = Common.randomReal(this.size.y, this.size.y)
      const z = 0.0

      const s = new Star(x, y, z)
      const mesh = s.initLine(resolution)
      scene.add(mesh)
      this.stars[ i ] = s
    }
  }

  update(dt) {
    for (let i = 0; i < this.stars.length; i++ ) {
      const s = this.stars[ i ]
      s.sensorData = this.sensorData
      s.update()
      this.checkBoundary(s)
    }
  }

  checkBoundary(star) {
    const min_y = -5
    if ( star.position.y > min_y && !star.isExceededColision() ) return

    const x = Common.randomReal(0, this.size.x)
    const y = Common.randomReal(this.size.y, this.size.y)

    const to = new THREE.Vector3(x, y, 0)
    star.reset(to)
  }

  updateResolution(w, h) {
    const r = new THREE.Vector2(w, h)

    this.stars.forEach( function ( s ) {
      s.line.updateResolution(r)
    } )
  }

  updateSensorData(sd) {
    this.sensorData = sd
  }
}
 

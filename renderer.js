import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import { Galaxy }  from  './galaxy.js'
const Common = require("./lib/common.js")

let scene,
  camera,
  renderer,
  control,
  stats,
  composer

let galaxy
let lastUpdate = performance.now()

const bloomParams = {
  exposure: 1,
  bloomStrength: 1.5,
  bloomThreshold: 0,
  bloomRadius: 0
}

const sensorParams = {
  minDistance: 0.1,
  maxDistance: 2.0
}

init()
animate()

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color( 0x000000 )

  //camera = new THREE.PerspectiveCamera(
  //  60,
  //  window.innerWidth / window.innerHeight,
  //  0.1,
  //  500
  //)
  //camera.lookAt( scene.position )      

  const width  =  320
  const height =  170
  //camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
  camera = new THREE.OrthographicCamera( 0, width, height, 0, 1, 1000 );
  camera.position.set(0, 0, 10)

  scene.add( camera );

  scene.add( new THREE.AmbientLight( 0x404040 ) );

  const pointLight = new THREE.PointLight( 0xffffff, 1 );
  camera.add( pointLight )

  renderer = new THREE.WebGLRenderer( { antialias: false} )
  //renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, powerPreference: "high-performance"} )
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setPixelRatio( 1 )
  renderer.setSize( window.innerWidth, window.innerHeight )
  renderer.toneMapping = THREE.ReinhardToneMapping
  document.body.appendChild( renderer.domElement )

  // カメラコントローラーを作成
  const controls = new OrbitControls(camera, renderer.domElement)
  //controls.zoomSpeed = 0.2

  const renderPass = new RenderPass( scene, camera )

  const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
  bloomPass.threshold = bloomParams.bloomThreshold;
  bloomPass.strength = bloomParams.bloomStrength;

  composer = new EffectComposer( renderer )
  composer.addPass( renderPass )
  composer.addPass( bloomPass )

  stats = new Stats()
  document.body.appendChild( stats.dom )

  // 座標軸を表示
  var axes = new THREE.AxisHelper(25);
  //scene.add(axes);

  const size = 50
  const divisions = 50
  const gridHelper = new THREE.GridHelper( size, divisions )
  //scene.add( gridHelper )

  galaxy = new Galaxy(600, scene)

  window.addEventListener( 'resize', onWindowResize )

  const gui = new GUI();
  GUI.TEXT_CLOSED = ''
  //GUI.TEXT_OPEN   = ''
  gui.add( bloomParams, 'exposure', 0.1, 4 ).onChange( function ( value ) {

    renderer.toneMappingExposure = Math.pow( value, 4.0 );

  } );

  gui.add( bloomParams, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    bloomPass.threshold = Number( value );

  } );

  gui.add( bloomParams, 'bloomStrength', 0.0, 8.0 ).onChange( function ( value ) {

    bloomPass.strength = Number( value );

  } );

  gui.add( bloomParams, 'bloomRadius', 0.0, 4.0 ).step( 0.01 ).onChange( function ( value ) {

    bloomPass.radius = Number( value );

  } );

  gui.add(sensorParams, 'minDistance', 0.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    sensorParams.minDistance = Number( value )

    window.api.send([sensorParams.minDistance, sensorParams.maxDistance], 'sensor::set_distance_range')
  } );

  gui.add(sensorParams, 'maxDistance', 0.0, 10.0 ).step( 0.1 ).onChange( function ( value ) {

    sensorParams.maxDistance = Number( value )
    window.api.send([sensorParams.minDistance, sensorParams.maxDistance], 'sensor::set_distance_range')

  } );

}

function onWindowResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()

  renderer.setSize(w, h)
  composer.setSize(w, h)

  galaxy.updateResolution(w, h)
}

function animate() {
  const now = performance.now()
  const dt = (now - lastUpdate) / 1000

  requestAnimationFrame( animate )
  render()

  galaxy.update()

  lastUpdate = now
}

function render() {
  //renderer.render( scene, camera )
  composer.render()
  stats.update()

  renderer.info.reset()
}

//looks for key presses and logs them
document.body.addEventListener("keydown", function(e) {
  console.log(`key: ${e.key}`)

  switch(true) {
    case e.key == 'p':
      //console.log(`window.devicePixelRatio: ${window.devicePixelRatio}`)
      console.log(`Scene polycount     : ${renderer.info.render.triangles}`)
      console.log(`Active Drawcalls    : ${renderer.info.render.calls}`)
      console.log(`Textures in Memory  : ${renderer.info.memory.textures}`)
      console.log(`Geometries in Memory: ${renderer.info.memory.geometries}`)
      break

    case e.key == 's':
      window.api.send([0.0, 16.0], 'sensor::start')
      break

    default:
      break
  }
})

window.api.on((rcv) => {
  //console.log(`sensor: ${rcv}`)
  galaxy.sensorData.update(rcv)
}, 'sensor::data')

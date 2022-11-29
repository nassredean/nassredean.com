import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Background from './Background'
import { Transparent } from './Transparents'

export class MainScene {
  sceneName: string
  container: HTMLElement
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  background: Background | undefined
  cubeRenderTarget: THREE.WebGLCubeRenderTarget | undefined
  sphere: Transparent | undefined
  controls: OrbitControls | undefined
  cubeCamera: THREE.CubeCamera | undefined
  // time: number;
  // commonUniforms: Uniforms;

  constructor (sceneName: string, container: HTMLElement) {
    this.sceneName = sceneName
    this.container = container
    this.clock = new THREE.Clock()
    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.container.appendChild(this.renderer.domElement)
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera()

    this.initRenderer()
    this.initScene()
    this.setupResizeListener()
    this.tick()
  }

  private initRenderer (): void {
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
    this.renderer.setClearColor(0x000000, 1)
    this.renderer.physicallyCorrectLights = true
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.outputEncoding = THREE.sRGBEncoding

    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024, {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipMapLinearFilter,
      encoding: THREE.sRGBEncoding
    })
    this.cubeCamera = new THREE.CubeCamera(0.1, 1000, this.cubeRenderTarget)
  }

  private initScene (): void {
    this.camera = new THREE.PerspectiveCamera()
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
    this.camera.updateProjectionMatrix()
    this.camera.position.set(-2.414321553721531, -0.7123287292714132, 3.389950978023759)
    this.camera.setRotationFromEuler(new THREE.Euler(-0.025376552251296477, -0.006851764752668625, -0.00017391013657926146, 'XYZ'))
    this.scene.add(this.camera)

    // if (this.controls == null) {
    //   this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    //   // this.camera.position.set(0, 0, 17.5)
    //   this.controls.update()
    // }

    const backgroundGeo = new THREE.SphereGeometry(100, 32, 32)
    const backgroundMesh = new THREE.Mesh(backgroundGeo)
    const side = THREE.BackSide

    this.background = new Background(backgroundMesh, side)
    this.scene.add(this.background)

    const sphereGeo = new THREE.SphereGeometry(2, 32, 32)
    const sphereMesh = new THREE.Mesh(sphereGeo)
    this.sphere = new Transparent(sphereMesh, this.cubeRenderTarget.texture)
    this.scene.add(this.sphere)
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', this.onResize.bind(this))
  }

  public update(deltaTime: number): void {
    if (this.background != null) {
      this.background.update(deltaTime)
    }

    if (this.controls != null) {
      this.controls.update()
    }

    if (this.sphere != null && this.cubeCamera != null && this.cubeRenderTarget != null) {
      this.sphere.visible = false
      this.cubeCamera.update(this.renderer, this.scene)
      this.sphere.visible = true
      this.sphere.update(deltaTime, this.cubeRenderTarget.texture)
    } else if (this.cubeCamera != null) {
      this.cubeCamera.update(this.renderer, this.scene)
    }
  }

  private onResize(): void {
    const canvasWidth = this.container.offsetWidth
    const canvasHeight = this.container.offsetHeight

    console.log('resizing')

    this.renderer.setSize(canvasWidth, canvasHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.camera.aspect = canvasWidth / canvasHeight
    this.camera.updateProjectionMatrix()
  }

  private tick(): void {
    requestAnimationFrame(this.tick.bind(this))

    const deltaTime = this.clock.getDelta()

    this.update(deltaTime)

    this.renderer.render(this.scene, this.camera)
  }
}

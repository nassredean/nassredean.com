import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Background from './Background'
import MainSceneGLB from '../../assets/scenes/MainScene.glb'

export class MainScene {
  sceneName: string
  container: HTMLElement
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  background: Background | undefined
  cubeRenderTarget: THREE.WebGLCubeRenderTarget
  sphere: THREE.Mesh | undefined
  controls: OrbitControls | undefined
  cubeCamera: THREE.CubeCamera
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

    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256)
    this.cubeRenderTarget.texture.type = THREE.HalfFloatType
    this.cubeCamera = new THREE.CubeCamera(1, 1000, this.cubeRenderTarget)

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
  }

  private initScene (): void {
    const gltfLoader = new GLTFLoader()
    gltfLoader.load(MainSceneGLB, (gltf: GLTF) => {
      this.camera = gltf.scene.getObjectByName('MainCamera_1') as THREE.PerspectiveCamera
      this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight
      this.camera.updateProjectionMatrix()
      this.camera.position.z = 20
      this.scene.add(this.camera)

      if (this.controls == null) {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.camera.position.set(0, 0, 17.5)
        this.controls.update()
      }

      const backgroundGeo = new THREE.SphereGeometry(100, 32, 32)
      const backgroundMesh = new THREE.Mesh(backgroundGeo)
      const side = THREE.BackSide

      this.background = new Background(backgroundMesh, side)
      this.scene.add(this.background)

      const sphereGeo = new THREE.SphereGeometry(2)
      const sphereMaterial = new THREE.MeshStandardMaterial({
        envMap: this.cubeRenderTarget.texture,
        color: 0xffffff,
        metalness: 0,
        roughness: 0
      })
      this.sphere = new THREE.Mesh(sphereGeo, sphereMaterial)
      this.scene.add(this.sphere)
    })
  }

  private setupResizeListener (): void {
    window.addEventListener('resize', this.onResize.bind(this))
  }

  public update (deltaTime: number): void {
    if (this.background != null) {
      this.background.update(deltaTime)
    }

    if (this.controls != null) {
      this.controls.update()
    }

    this.cubeCamera.update(this.renderer, this.scene)
  }

  private onResize (): void {
    const canvasWidth = this.container.offsetWidth
    const canvasHeight = this.container.offsetHeight

    this.renderer.setSize(canvasWidth, canvasHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)

    this.camera.aspect = canvasWidth / canvasHeight
    this.camera.updateProjectionMatrix()
  }

  private tick (): void {
    requestAnimationFrame(this.tick.bind(this))

    const deltaTime = this.clock.getDelta()

    this.update(deltaTime)

    this.renderer.render(this.scene, this.camera)
  }
}

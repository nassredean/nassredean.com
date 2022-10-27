import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Background from './Background';
import MainSceneGLB from '../../assets/scenes/MainScene.glb';

export class MainScene {
	sceneName: string;
	container: HTMLElement;
	renderer: THREE.WebGLRenderer;
	clock: THREE.Clock;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	background: Background;
	sphere: THREE.Mesh;
	// time: number;
	// commonUniforms: Uniforms;

	constructor(sceneName: string, container: HTMLElement) {
		this.sceneName = sceneName;
		this.container = container;
		this.clock = new THREE.Clock();
		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.container.appendChild(this.renderer.domElement);
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera();

		this.initRenderer();
		this.initScene();
		this.setupResizeListener();
		this.tick();
	}

	private initRenderer() {
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
	}


	private initScene() {
		let gltfLoader = new GLTFLoader();
		gltfLoader.load(MainSceneGLB, (gltf: GLTF) => {
			this.camera = gltf.scene.getObjectByName('MainCamera_1') as THREE.PerspectiveCamera;
			this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
			this.camera.updateProjectionMatrix();
			this.scene.add(this.camera);

			let backgroundGeo = new THREE.PlaneGeometry(20, 20);
			let backgroundMesh = new THREE.Mesh(backgroundGeo);
			backgroundMesh.rotateZ(-90 * Math.PI / 180)
			this.background = new Background(backgroundMesh, THREE.FrontSide);
			this.scene.add(this.background);

		});
	}

	private setupResizeListener() {
		window.addEventListener("resize", this.onResize.bind(this));
	}

	public update(deltaTime: number) {
		if (this.background) {
			this.background.update(deltaTime);
		}
	}

	private onResize() {
		let canvasWidth = this.container.offsetWidth;
		let canvasHeight = this.container.offsetHeight;

		this.renderer.setSize(canvasWidth, canvasHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.camera.aspect = canvasWidth / canvasHeight;
		this.camera.updateProjectionMatrix();
	}

	private tick() {
		requestAnimationFrame(this.tick.bind(this));

		const deltaTime = this.clock.getDelta();

		this.update(deltaTime)

		this.renderer.render(this.scene, this.camera);
	}
}

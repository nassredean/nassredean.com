import * as THREE from 'three';

import bgVert from './shaders/background.vs';
import bgFrag from './shaders/background.fs';

export interface Uniforms{ [ key: string ] : THREE.IUniform }

export default class Background extends THREE.Object3D {

    uniforms: Uniforms;

	constructor( mesh: THREE.Mesh, side: THREE.Side ) {
        super();

		this.uniforms = {
            time: {
                value: 0
            }
        };

		let mat = new THREE.ShaderMaterial( {
			vertexShader: bgVert,
			fragmentShader: bgFrag,
			uniforms: this.uniforms,
			side: side,
		} );

        mesh.material = mat;

        this.add(mesh);
	}

	public update(deltaTime: number) {
		this.uniforms.time.value += deltaTime;
	}

}
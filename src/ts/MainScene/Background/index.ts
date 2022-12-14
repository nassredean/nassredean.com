import * as THREE from 'three'
import { Uniforms } from './global/types.ts'
import bgVert from './shaders/background.vs'
import bgFrag from './shaders/background.fs'

export default class Background extends THREE.Object3D {
  uniforms: Uniforms

  constructor (mesh: THREE.Mesh, side: THREE.Side) {
    super()

    this.uniforms = {
      time: {
        value: 0
      }
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader: bgVert,
      fragmentShader: bgFrag,
      uniforms: this.uniforms,
      side
    })

    mesh.material = mat

    this.add(mesh)
  }

  public update (deltaTime: number): void {
    (this.uniforms.time.value as number) += deltaTime
  }
}

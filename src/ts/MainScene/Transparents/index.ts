import * as THREE from 'three'
import vert from './shaders/transparents.vs'
import frag from './shaders/transparents.fs'
import { Uniforms } from './global/types.ts'

export class Transparent extends THREE.Object3D {
  uniforms: Uniforms

  constructor (mesh: THREE.Mesh, tCube: THREE.Texture) {
    super()

    this.uniforms = {
      time: { value: 0 },
      tCube: { value: tCube },
      mRefractionRatio: { value: 1.02 },
      mFresnelBias: { value: 0.1 },
      mFresnelPower: { value: 2.0 },
      mFresnelScale: { value: 1.0 }
    }

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      extensions: {
        derivatives: true
      },
      uniforms: this.uniforms,
      side: THREE.DoubleSide
    })

    mesh.material = mat

    this.add(mesh)
  }

  public update (deltaTime: number, sceneTex: THREE.CubeTexture): void {
    (this.uniforms.time.value as number) += deltaTime
    this.uniforms.tCube.value = sceneTex
  }
}

import * as THREE from 'three'
import { GLTFLoader, OrbitControls, RGBELoader } from 'three-stdlib'

export interface ThreeSceneOptions {
  container: HTMLElement
  modelUrl?: string
  hdrUrl?: string
  onProgress?: (progress: number) => void
}

export class ThreeSceneEngine {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private controls: OrbitControls
  private animationFrameId: number | null = null
  private isDestroyed = false

  constructor(options: ThreeSceneOptions) {
    this.container = options.container
    const width = this.container.clientWidth || window.innerWidth
    const height = this.container.clientHeight || 400

    // 1. Scene
    this.scene = new THREE.Scene()

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.025,
      100,
    )
    this.camera.position.set(0, 0.8, 3.5)

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.container.appendChild(this.renderer.domElement)

    // 4. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1
    this.controls.minDistance = 0.5
    this.controls.maxDistance = 15

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5)
    dirLight.position.set(5, 10, 5)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    this.scene.add(dirLight)

    // 6. Ground Grid
    const gridHelper = new THREE.GridHelper(
      20,
      40,
      0x38BDF8,
      0x334155,
    )
    gridHelper.position.y = -0.5
    this.scene.add(gridHelper)

    // 7. Load Environment HDR & GLTF Model
    this.initAssets(options)

    // 8. Resize Listener
    window.addEventListener('resize', this.onResize)

    // 9. Animation Loop
    this.animate()
  }

  private initAssets(options: ThreeSceneOptions) {
    const hdrUrl = options.hdrUrl || '/hdr/sky.hdr'
    const modelUrl = options.modelUrl || '/models/surf_ski_3_x.glb'

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer)
    pmremGenerator.compileEquirectangularShader()

    new RGBELoader().load(
      hdrUrl,
      (texture) => {
        if (this.isDestroyed)
          return
        const envMap = pmremGenerator.fromEquirectangular(texture).texture
        this.scene.environment = envMap
        texture.dispose()
        pmremGenerator.dispose()
      },
      undefined,
      (err) => {
        console.warn('[ThreeScene] HDR load error:', err)
      },
    )

    const gltfLoader = new GLTFLoader()
    gltfLoader.load(
      modelUrl,
      (gltf) => {
        if (this.isDestroyed)
          return
        const model = gltf.scene
        model.position.set(0, -0.5, 0)
        model.scale.set(1, 1, 1)

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        // Center model bounding box
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.x += model.position.x - center.x
        model.position.z += model.position.z - center.z

        this.scene.add(model)
        options.onProgress?.(100)
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100)
          options.onProgress?.(percent)
        }
      },
      (err) => {
        console.warn('[ThreeScene] GLTF load error:', err)
        options.onProgress?.(100)
      },
    )
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed)
      return
    const width = this.container.clientWidth || window.innerWidth
    const height = this.container.clientHeight || 400

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  private animate = () => {
    if (this.isDestroyed)
      return
    this.animationFrameId = requestAnimationFrame(this.animate)
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  public rotate(angleDelta: number) {
    this.camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleDelta)
    this.camera.lookAt(this.controls.target)
  }

  public resetCamera() {
    this.camera.position.set(0, 0.8, 3.5)
    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  public destroy() {
    this.isDestroyed = true
    window.removeEventListener('resize', this.onResize)
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.controls.dispose()
    this.renderer.dispose()
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }
}

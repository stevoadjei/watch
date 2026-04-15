const container = document.getElementById('watch-container');
let scene, camera, renderer, controls, watchGroup;

function initThree() {
  if (!container) {
    console.error('No watch container found');
    return;
  }

  // Scene
  scene = new THREE.Scene();
  scene.background = null;

  // Camera
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.4, 3.0);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.physicallyCorrectLights = true;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lights
  setupLights();

  // Subtle environment reflection (fake studio)
  setupEnvironment();

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.8;
  controls.maxDistance = 4.5;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.rotateSpeed = 0.9;
  controls.target.set(0, 0, 0);
  controls.update();

  // Load dial texture (from your watch image) if available
  const loader = new THREE.TextureLoader();
  const textureCandidates = ['/watch-image.png', 'watch-image.png'];

  tryLoadTexture(loader, textureCandidates, (texture) => {
    createWatchModel(texture);
    animate();
  });

  window.addEventListener('resize', onWindowResize);
}

function setupLights() {
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
  keyLight.position.set(4, 6, 6);
  keyLight.castShadow = false;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 1.4);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const fillLight = new THREE.HemisphereLight(0xffffff, 0x0b1b33, 0.6);
  scene.add(fillLight);
}

function setupEnvironment() {
  // Simple gradient-like environment using a cube texture
  const size = 4;
  const data = new Uint8Array(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    const stride = i * 3;
    data[stride] = 10;   // R
    data[stride + 1] = 16; // G
    data[stride + 2] = 32; // B
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
  texture.needsUpdate = true;

  const envRT = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    encoding: THREE.sRGBEncoding
  });

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envMap = pmremGenerator.fromCubemap(envRT.texture).texture;
  scene.environment = envMap;
  pmremGenerator.dispose();
}

function tryLoadTexture(loader, urls, onDone) {
  let index = 0;

  function attempt() {
    if (index >= urls.length) {
      onDone(null);
      return;
    }
    const url = urls[index];
    loader.load(
      url,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        // Adjust crop if needed (you can tweak these to match your watch image)
        texture.center.set(0.5, 0.5);
        texture.rotation = 0;
        texture.offset.set(0.25, 0.16);
        texture.repeat.set(0.5, 0.5);

        onDone(texture);
      },
      undefined,
      () => {
        index++;
        attempt();
      }
    );
  }

  attempt();
}

function createWatchModel(dialTexture) {
  watchGroup = new THREE.Group();

  const radius = 1.0;
  const depth = 0.18;
  const segments = 96;

  // Materials
  const caseMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b2233,
    roughness: 0.18,
    metalness: 0.9
  });

  const bezelMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4b265,
    roughness: 0.15,
    metalness: 1.0
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0x0b0d16,
    roughness: 0.6,
    metalness: 0.2
  });

  const dialMaterial = new THREE.MeshStandardMaterial({
    map: dialTexture || null,
    color: dialTexture ? 0xffffff : 0x1f4f9f,
    roughness: 0.25,
    metalness: 0.4,
    side: THREE.DoubleSide
  });

  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4b265,
    roughness: 0.2,
    metalness: 1.0
  });

  const lugMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b2233,
    roughness: 0.25,
    metalness: 0.9
  });

  const strapMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b,
    roughness: 0.75,
    metalness: 0.1
  });

  // Case side (solid cylinder)
  const caseBody = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false),
    caseMaterial
  );
  caseBody.rotation.x = Math.PI / 2;
  watchGroup.add(caseBody);

  // Dial (front)
  const dial = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.94, segments),
    dialMaterial
  );
  dial.rotation.x = -Math.PI / 2;
  dial.position.z = depth / 2 + 0.002;
  watchGroup.add(dial);

  // Back plate
  const backPlate = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.9, segments),
    backMaterial
  );
  backPlate.rotation.x = Math.PI / 2;
  backPlate.position.z = -depth / 2 - 0.002;
  watchGroup.add(backPlate);

  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.03, 0.05, 18, 120),
    bezelMaterial
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.z = depth / 2 + 0.01;
  watchGroup.add(bezel);

  // Crown
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24),
    crownMaterial
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set(radius + 0.12, 0, 0);
  watchGroup.add(crown);

  // Lugs
  const lugWidth = 0.32;
  const lugHeight = 0.16;
  const lugDepth = 0.18;

  const lugTop = new THREE.Mesh(
    new THREE.BoxGeometry(lugWidth, lugHeight, lugDepth),
    lugMaterial
  );
  lugTop.position.set(0, radius + lugHeight / 2, 0);
  watchGroup.add(lugTop);

  const lugBottom = lugTop.clone();
  lugBottom.position.set(0, -radius - lugHeight / 2, 0);
  watchGroup.add(lugBottom);

  // Strap (simple two-part)
  const strapLength = 2.8;
  const strapThickness = 0.12;
  const strapWidth = 0.7;

  const strapTop = new THREE.Mesh(
    new THREE.BoxGeometry(strapWidth, strapLength, strapThickness),
    strapMaterial
  );
  strapTop.position.set(0, radius + strapLength / 2 + 0.05, -0.02);
  watchGroup.add(strapTop);

  const strapBottom = strapTop.clone();
  strapBottom.position.set(0, -radius - strapLength / 2 - 0.05, -0.02);
  watchGroup.add(strapBottom);

  // Slight tilt for a more dynamic default view
  watchGroup.rotation.x = -0.18;
  watchGroup.rotation.y = 0.35;

  scene.add(watchGroup);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  if (!camera || !renderer) return;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Boot
if (typeof THREE === 'undefined') {
  console.error('THREE.js is not loaded.');
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
}

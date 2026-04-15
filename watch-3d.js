const container = document.getElementById('watch-container');
let scene, camera, renderer, controls, watchMesh;

function initThree() {
  if (!container) {
    console.error('No watch container found');
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  camera.position.set(0, 0.5, 2.5);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputEncoding = THREE.sRGBEncoding;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(5, 5, 5);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(-5, -5, -5);
  scene.add(light2);

  const fillLight = new THREE.HemisphereLight(0xffffff, 0x0b1b33, 0.25);
  scene.add(fillLight);

  const loader = new THREE.TextureLoader();
  const textureUrls = ['/watch-image.png', 'watch-image.png'];

  function tryLoad(index) {
    if (index >= textureUrls.length) {
      createWatchModel(null);
      animate();
      return;
    }

    const url = textureUrls[index];
    loader.load(
      url,
      (texture) => {
        if (texture) {
          texture.center.set(0.5, 0.5);
          texture.rotation = 0;
          texture.offset.set(0.25, 0.16);
          texture.repeat.set(0.5, 0.5);
          texture.encoding = THREE.sRGBEncoding;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearMipMapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
        }
        createWatchModel(texture);
        animate();
      },
      undefined,
      () => tryLoad(index + 1)
    );
  }

  tryLoad(0);

  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 4.5;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.rotateSpeed = 0.9;
    controls.target.set(0, 0, 0);
    controls.update();
  }

  window.addEventListener('resize', onWindowResize);
}

function createWatchModel(texture) {
  const radius = 1;
  const depth = 0.08;
  const segments = 96;
  const model = new THREE.Group();

  const caseMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2436,
    roughness: 0.18,
    metalness: 0.85,
  });

  const caseBody = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, segments, 1, true),
    caseMaterial
  );
  model.add(caseBody);

  const faceMaterial = new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? 0xffffff : 0xdddddd,
    roughness: 0.28,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });

  const topFace = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.95, segments),
    faceMaterial
  );
  topFace.rotation.x = -Math.PI / 2;
  topFace.position.y = depth / 2 + 0.001;
  model.add(topFace);

  const backFace = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.95, segments),
    new THREE.MeshStandardMaterial({ color: 0x0f1220, roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide })
  );
  backFace.rotation.x = Math.PI / 2;
  backFace.position.y = -depth / 2 - 0.001;
  model.add(backFace);

  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.03, 0.04, 18, 120),
    new THREE.MeshStandardMaterial({ color: 0xd4b265, roughness: 0.15, metalness: 0.95 })
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = depth / 2 + 0.005;
  model.add(bezel);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0xd4b265, roughness: 0.18, metalness: 0.95 })
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set(radius + 0.08, 0, 0);
  model.add(crown);

  const lugMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2436,
    roughness: 0.25,
    metalness: 0.9,
  });

  const strapTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.12, 0.12),
    lugMaterial
  );
  strapTop.position.set(0, radius + 0.08, -0.02);
  model.add(strapTop);

  const strapBottom = strapTop.clone();
  strapBottom.position.set(0, -radius - 0.08, -0.02);
  model.add(strapBottom);

  watchMesh = model;
  watchMesh.rotation.x = -0.08;
  watchMesh.rotation.y = 0.2;
  scene.add(watchMesh);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

if (typeof THREE === 'undefined') {
  console.error('THREE.js is not loaded.');
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
}


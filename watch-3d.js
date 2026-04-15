// 3D Watch Viewer - Render the watch image as a textured 3D object
console.log('1️⃣ watch-3d.js LOADED');
console.log('   THREE available?', typeof THREE !== 'undefined');
console.log('   OrbitControls available?', typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined');

const container = document.getElementById('watch-container');
const statusText = document.getElementById('debug-status');
let scene, camera, renderer, controls, watchMesh;

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function initThree() {
  console.log('Container size:', container?.clientWidth, container?.clientHeight);
  setStatus('Initializing 3D watch viewer...');
  if (!container) {
    console.error('❌ No watch container found');
    return;
  }

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1020);

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 3.2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(width, height);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 3, 4);
  scene.add(directionalLight);

  const fillLight = new THREE.PointLight(0x99caff, 0.4, 10);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  const loader = new THREE.TextureLoader();
  const textureUrls = ['/watch-image.png', 'watch-image.png'];
  setStatus('Loading watch texture...');

  function tryLoad(index) {
    if (index >= textureUrls.length) {
      console.warn('⚠️ All texture URLs failed. Using fallback model.');
      setStatus('Watch texture failed to load. Showing fallback model.');
      createWatchModel();
      animate();
      return;
    }

    const url = textureUrls[index];
    console.log('⏳ Trying texture URL:', url);

    loader.load(
      url,
      (texture) => {
        if (texture && texture.image) {
          console.log('✅ Texture loaded:', texture.image.src, texture.image.width, 'x', texture.image.height);
          setStatus('Watch texture loaded successfully. Rotate to inspect.');
        }
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        createWatchModel(texture);
        animate();
      },
      undefined,
      (err) => {
        console.warn('⚠️ Texture load failed for', url, err);
        tryLoad(index + 1);
      }
    );
  }

  tryLoad(0);

  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 8;
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.rotateSpeed = 1.2;
    controls.target.set(0, 0, 0);
    controls.update();
  } else {
    console.warn('⚠️ OrbitControls is not available');
  }

  window.addEventListener('resize', onWindowResize);
}

function createWatchModel(texture) {
  const radius = 1.04;
  const depth = 0.18;
  const segments = 96;
  const model = new THREE.Group();

  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x293048,
    roughness: 0.2,
    metalness: 0.95,
  });

  const watchCase = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, segments, 1, true),
    sideMaterial
  );
  model.add(watchCase);

  const faceMaterial = new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? 0xffffff : 0xff0000,
    roughness: 0.28,
    metalness: 0.12,
    side: THREE.DoubleSide,
  });

  const topFace = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.96, segments),
    faceMaterial
  );
  topFace.rotation.x = -Math.PI / 2;
  topFace.position.y = depth / 2 + 0.001;
  model.add(topFace);

  const backMaterial = new THREE.MeshStandardMaterial({
    color: 0x11141c,
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const backFace = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.96, segments),
    backMaterial
  );
  backFace.rotation.x = Math.PI / 2;
  backFace.position.y = -depth / 2 - 0.001;
  model.add(backFace);

  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.04, 0.05, 24, 160),
    new THREE.MeshStandardMaterial({ color: 0xdbb23f, roughness: 0.18, metalness: 0.95 })
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = depth / 2 + 0.007;
  model.add(bezel);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.12, 32),
    new THREE.MeshStandardMaterial({ color: 0xdbb23f, roughness: 0.15, metalness: 0.95 })
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set(radius + 0.095, 0, 0);
  model.add(crown);

  const lugMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b2030,
    roughness: 0.3,
    metalness: 0.9,
  });

  const strapTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.12, 0.16),
    lugMaterial
  );
  strapTop.position.set(0, radius + 0.08, -0.02);
  model.add(strapTop);

  const strapBottom = strapTop.clone();
  strapBottom.position.set(0, -radius - 0.08, -0.02);
  model.add(strapBottom);

  watchMesh = model;
  watchMesh.rotation.x = -0.08;
  watchMesh.rotation.y = 0.28;
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
  console.error('❌ THREE.js is not loaded.');
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThree);
  } else {
    initThree();
  }
}

console.log('🎯 3D watch viewer initialized');


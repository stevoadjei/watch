// 3D Watch Viewer - Render the watch image as a textured 3D object
console.log('1️⃣ watch-3d.js LOADED');
console.log('   THREE available?', typeof THREE !== 'undefined');
console.log('   OrbitControls available?', typeof THREE !== 'undefined' && typeof THREE.OrbitControls !== 'undefined');

const container = document.getElementById('watch-container');
let scene, camera, renderer, controls, watchMesh;

function initThree() {
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

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x080c16, roughness: 0.9, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  scene.add(ground);

  const loader = new THREE.TextureLoader();
  const textureUrl = 'watch-image.png?cb=' + Date.now();
  console.log('⏳ Loading texture from', textureUrl);
  loader.load(
    textureUrl,
    (texture) => {
      if (texture && texture.image) {
        console.log('✅ Texture loaded:', texture.image.src, texture.image.width, 'x', texture.image.height);
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
      console.warn('⚠️ watch-image.png load failed:', err);
      createWatchModel();
      animate();
    }
  );

  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.6;
    controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI * 0.45;
    controls.target.set(0, 0, 0);
    controls.update();
  } else {
    console.warn('⚠️ OrbitControls is not available');
  }

  window.addEventListener('resize', onWindowResize);
}

function createWatchModel(texture) {
  const width = 1.75;
  const height = 2.0;
  const depth = 0.14;

  const geometry = new THREE.BoxGeometry(width, height, depth, 32, 32, 2);
  const faceMaterial = new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? 0xffffff : 0xdddddd,
    roughness: 0.35,
    metalness: 0.15,
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x181c26,
    roughness: 0.28,
    metalness: 0.85,
  });

  const materials = [
    bodyMaterial,
    bodyMaterial,
    bodyMaterial,
    bodyMaterial,
    faceMaterial,
    faceMaterial,
  ];

  watchMesh = new THREE.Mesh(geometry, materials);
  watchMesh.rotation.x = -0.08;
  watchMesh.rotation.y = 0.28;
  scene.add(watchMesh);

  const edge = new THREE.EdgesGeometry(geometry);
  const edgeLines = new THREE.LineSegments(
    edge,
    new THREE.LineBasicMaterial({ color: 0x77b7ff, transparent: true, opacity: 0.25 })
  );
  watchMesh.add(edgeLines);

  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.05, 24, 120),
    new THREE.MeshStandardMaterial({ color: 0x4c5e84, roughness: 0.15, metalness: 0.9 })
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.z = depth / 2 + 0.015;
  watchMesh.add(bezel);
}

function animate() {
  requestAnimationFrame(animate);
  if (watchMesh) {
    watchMesh.rotation.y += 0.0018;
  }
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


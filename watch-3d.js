console.log('3D Watch Viewer Loaded');

const container = document.getElementById('watch-container');
let scene, camera, renderer, controls, watchMesh;

function initThree() {
  if (!container) return;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0.6, 2.5);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting (clean + premium look)
  const light1 = new THREE.DirectionalLight(0xffffff, 1);
  light1.position.set(5, 5, 5);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
  light2.position.set(-5, -5, -5);
  scene.add(light2);

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // Load texture
  const loader = new THREE.TextureLoader();
  loader.load(
    '/watch-image.png',
    (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.center.set(0.5, 0.5);
      texture.rotation = 0;

      createWatchModel(texture);
      animate();
    },
    undefined,
    () => {
      // fallback if image fails
      createWatchModel(null);
      animate();
    }
  );

  // Controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 1.8;
  controls.maxDistance = 4;
  controls.target.set(0, 0, 0);

  window.addEventListener('resize', onResize);
}

function createWatchModel(texture) {
  const radius = 1;
  const depth = 0.08;
  const segments = 100;

  const model = new THREE.Group();

  // Watch case
  const caseMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.2
  });

  const caseMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, depth, segments, 1, true),
    caseMat
  );
  model.add(caseMesh);

  // Face
  const faceMat = new THREE.MeshStandardMaterial({
    map: texture || null,
    color: texture ? 0xffffff : 0x444444,
    metalness: 0.2,
    roughness: 0.3
  });

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.95, segments),
    faceMat
  );
  face.rotation.x = -Math.PI / 2;
  face.position.y = depth / 2 + 0.001;
  model.add(face);

  // Back
  const back = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.95, segments),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  back.rotation.x = Math.PI / 2;
  back.position.y = -depth / 2;
  model.add(back);

  // Bezel (gold ring)
  const bezel = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.03, 0.04, 20, 100),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 1,
      roughness: 0.2
    })
  );
  bezel.rotation.x = Math.PI / 2;
  bezel.position.y = depth / 2 + 0.005;
  model.add(bezel);

  // Crown
  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32),
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 1,
      roughness: 0.2
    })
  );
  crown.rotation.z = Math.PI / 2;
  crown.position.set(radius + 0.08, 0, 0);
  model.add(crown);

  // Slight tilt for realism
  model.rotation.x = -0.1;
  model.rotation.y = 0.3;

  watchMesh = model;
  scene.add(watchMesh);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThree);
} else {
  initThree();
}

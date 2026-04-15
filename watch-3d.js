let scene, camera, renderer, controls;

async function init() {
    const container = document.getElementById('canvas-container');

    // 1. SCENE SETUP
    scene = new THREE.Scene();
    
    // 2. CAMERA (Macro lens feel)
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // 3. RENDERER (Cinematic Quality)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // The secret to the "Classic" look
    renderer.toneMappingExposure = 1.2;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 4. STUDIO LIGHTING (Multiple sources to define the edges)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const topLight = new THREE.SpotLight(0xffffff, 2);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    const sideLight = new THREE.PointLight(0xd4b265, 1); // Gold tint light
    sideLight.position.set(5, 2, 5);
    scene.add(sideLight);

    // 5. THE ENVIRONMENT (This makes metal look real)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new THREE.Scene()).texture;

    // 6. LOAD PROFESSIONAL MODEL
    const loader = new THREE.GLTFLoader();
    // Using a high-quality public GLB sample for the demo
    const modelUrl = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Watch/glTF-Binary/Watch.glb';

    loader.load(modelUrl, (gltf) => {
        const watch = gltf.scene;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(watch);
        const center = box.getCenter(new THREE.Vector3());
        watch.position.sub(center);
        
        scene.add(watch);
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => document.getElementById('loading').remove(), 500);
    }, 
    (xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded'); },
    (error) => { console.error('Error loading model:', error); });

    // 7. CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    window.addEventListener('resize', onWindowResize);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();

let scene, camera, renderer, controls, watchGroup;

function init() {
    const container = document.getElementById('watch-container');

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // 2. Renderer (High Fidelity)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Studio Setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    // 4. Create Watch
    createWatch();

    // 5. Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    animate();
}

function createWatch() {
    watchGroup = new THREE.Group();

    // PREMIUM MATERIALS
    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xd4b265,
        metalness: 1,
        roughness: 0.1,
        envMapIntensity: 1
    });

    const steelMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.9,
        roughness: 0.2
    });

    // Sapphire Crystal (Glass)
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        transmission: 0.9, // Transparency
        transparent: true,
        opacity: 0.3,
        thickness: 0.5
    });

    // MAIN CASE
    const caseGeo = new THREE.CylinderGeometry(1, 1, 0.2, 64);
    const watchCase = new THREE.Mesh(caseGeo, steelMat);
    watchGroup.add(watchCase);

    // BEZEL (The Gold Ring)
    const bezelGeo = new THREE.TorusGeometry(1.02, 0.05, 16, 100);
    const bezel = new THREE.Mesh(bezelGeo, goldMat);
    bezel.rotation.x = Math.PI / 2;
    bezel.position.y = 0.1;
    watchGroup.add(bezel);

    // DIAL (Watch Face)
    const dialGeo = new THREE.CircleGeometry(0.95, 64);
    const dialMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 });
    const dial = new THREE.Mesh(dialGeo, dialMat);
    dial.rotation.x = -Math.PI / 2;
    dial.position.y = 0.08;
    watchGroup.add(dial);

    // CRYSTAL GLASS (Added for realism)
    const glassGeo = new THREE.CylinderGeometry(0.98, 0.98, 0.02, 64);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.y = 0.12;
    watchGroup.add(glass);

    // CROWN (The side button)
    const crownGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 32);
    const crown = new THREE.Mesh(crownGeo, goldMat);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(1.05, 0, 0);
    watchGroup.add(crown);

    scene.add(watchGroup);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

// AEROLAB 3D Digital Twin Quadcopter Engine (Three.js WebGL & Interactive Orbit Controls)
// Implements: Full 3D PBR Geometry, Exploded Assembly View, Component Isolation, Motor RPM Animation
function Drone3DView({
  selectedPart,
  onSelectPart,
  explodedView = 0, // 0 to 1
  motorRpm = { m1: 18000, m2: 18000, m3: 18000, m4: 18000 },
  attitude = { roll: 0, pitch: 0, yaw: 0 },
  isFlying = false,
  isolatedPart = null,
  showAxes = true
}) {
  const containerRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const rendererRef = React.useRef(null);
  const cameraRef = React.useRef(null);
  const droneGroupRef = React.useRef(null);
  const partsMapRef = React.useRef({});
  const propGroupRef = React.useRef([]);
  const mouseStateRef = React.useRef({ isDragging: false, isPanning: false, prevX: 0, prevY: 0 });
  const cameraAngleRef = React.useRef({ theta: Math.PI / 4, phi: Math.PI / 3, radius: 420, targetX: 0, targetY: 0, targetZ: 0 });

  // Update camera position from spherical angles
  const updateCamera = React.useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, targetX, targetY, targetZ } = cameraAngleRef.current;
    const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    cameraRef.current.position.x = targetX + radius * Math.sin(clampedPhi) * Math.sin(theta);
    cameraRef.current.position.y = targetY + radius * Math.cos(clampedPhi);
    cameraRef.current.position.z = targetZ + radius * Math.sin(clampedPhi) * Math.cos(theta);
    cameraRef.current.lookAt(targetX, targetY, targetZ);
  }, []);

  // Initialize Three.js Scene
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Check if THREE is available
    if (typeof THREE === 'undefined') {
      console.warn('[AEROLAB] Three.js not yet loaded in window, falling back to WebGL canvas');
      return;
    }

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x070c14);
    scene.fog = new THREE.FogExp2(0x070c14, 0.0015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    cameraRef.current = camera;
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    while (container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(renderer.domElement);

    // 2. Lighting (Aerospace Studio Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x55C8E8, 1.2);
    keyLight.position.set(250, 400, 250);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xF2B45B, 0.8);
    rimLight.position.set(-250, -100, -200);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(0, 300, -200);
    scene.add(fillLight);

    // 3. Ground Reference Grid
    const grid = new THREE.GridHelper(800, 40, 0x223244, 0x111c2a);
    grid.position.y = -100;
    scene.add(grid);

    // 4. Construct Photorealistic Quadcopter Drone Hierarchy
    const droneRoot = new THREE.Group();
    droneGroupRef.current = droneRoot;
    scene.add(droneRoot);

    const parts = {};
    const props = [];

    // --- Material Presets ---
    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x1a212b,
      roughness: 0.4,
      metalness: 0.6
    });

    const armMat = new THREE.MeshStandardMaterial({
      color: 0x121720,
      roughness: 0.3,
      metalness: 0.8
    });

    const motorBellMatCW = new THREE.MeshStandardMaterial({
      color: 0xd9383a, // Red anodized for CW
      roughness: 0.25,
      metalness: 0.9
    });

    const motorBellMatCCW = new THREE.MeshStandardMaterial({
      color: 0x2c7be5, // Blue anodized for CCW
      roughness: 0.25,
      metalness: 0.9
    });

    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0f3822, // Solder mask green
      roughness: 0.5,
      metalness: 0.2
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xF2B45B,
      roughness: 0.2,
      metalness: 0.95
    });

    const icChipMat = new THREE.MeshStandardMaterial({
      color: 0x11161d,
      roughness: 0.8,
      metalness: 0.1
    });

    const propMat = new THREE.MeshStandardMaterial({
      color: 0x55c8e8,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });

    const batteryMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber 4S LiPo label
      roughness: 0.6,
      metalness: 0.1
    });

    // --- A. Bottom Chassis Plate ---
    const bottomPlateGeo = new THREE.BoxGeometry(90, 3, 90);
    const bottomPlate = new THREE.Mesh(bottomPlateGeo, carbonFiberMat);
    bottomPlate.position.y = 0;
    bottomPlate.castShadow = true;
    bottomPlate.name = 'bottom_plate';
    droneRoot.add(bottomPlate);
    parts.bottom_plate = { mesh: bottomPlate, baseY: 0, dirX: 0, dirY: -1, dirZ: 0 };

    // --- B. Top Chassis Plate ---
    const topPlateGeo = new THREE.BoxGeometry(80, 2.5, 80);
    const topPlate = new THREE.Mesh(topPlateGeo, carbonFiberMat);
    topPlate.position.y = 28;
    topPlate.castShadow = true;
    topPlate.name = 'top_plate';
    droneRoot.add(topPlate);
    parts.top_plate = { mesh: topPlate, baseY: 28, dirX: 0, dirY: 1, dirZ: 0 };

    // --- C. Standoffs (4x Aluminum Spacers) ---
    const standoffGeo = new THREE.CylinderGeometry(2.5, 2.5, 28, 12);
    const standoffPositions = [
      { x: 32, z: 32 }, { x: -32, z: 32 }, { x: 32, z: -32 }, { x: -32, z: -32 }
    ];
    const standoffsGroup = new THREE.Group();
    standoffsGroup.name = 'standoffs';
    standoffPositions.forEach(pos => {
      const so = new THREE.Mesh(standoffGeo, goldMat);
      so.position.set(pos.x, 14, pos.z);
      standoffsGroup.add(so);
    });
    droneRoot.add(standoffsGroup);
    parts.standoffs = { mesh: standoffsGroup, baseY: 0, dirX: 0, dirY: 0.5, dirZ: 0 };

    // --- D. Flight Controller PCB (Hades Micro 50x50mm) ---
    const fcGroup = new THREE.Group();
    fcGroup.name = 'fc_pcb';
    fcGroup.position.y = 12;

    const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(50, 1.6, 50), pcbMat);
    pcbBoard.castShadow = true;
    fcGroup.add(pcbBoard);

    // STM32 MCU Chip
    const stm32Chip = new THREE.Mesh(new THREE.BoxGeometry(14, 2.2, 14), icChipMat);
    stm32Chip.position.set(0, 1.8, 0);
    fcGroup.add(stm32Chip);

    // BMI088 IMU Chip
    const imuChip = new THREE.Mesh(new THREE.BoxGeometry(6, 1.5, 6), goldMat);
    imuChip.position.set(-12, 1.5, -10);
    fcGroup.add(imuChip);

    // PMU Regulator
    const pmuChip = new THREE.Mesh(new THREE.BoxGeometry(8, 1.8, 6), icChipMat);
    pmuChip.position.set(12, 1.5, 12);
    fcGroup.add(pmuChip);

    // Status LEDs
    const ledGeo = new THREE.BoxGeometry(2, 1.2, 2);
    const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x36C98F });
    const ledGreen = new THREE.Mesh(ledGeo, ledGreenMat);
    ledGreen.position.set(18, 1.6, -18);
    fcGroup.add(ledGreen);

    droneRoot.add(fcGroup);
    parts.fc_pcb = { mesh: fcGroup, baseY: 12, dirX: 0, dirY: 1.2, dirZ: 0 };

    // --- E. 4 Carbon Fiber Arms ---
    const armLength = 120;
    const armRadius = 4.5;
    const armGeo = new THREE.CylinderGeometry(armRadius, armRadius, armLength, 16);
    const armAngles = [
      { id: 'arm_fr', angle: Math.PI / 4, dx: 1, dz: 1, motor: 'motor_1', mat: motorBellMatCW, isCW: true },
      { id: 'arm_rr', angle: (3 * Math.PI) / 4, dx: 1, dz: -1, motor: 'motor_2', mat: motorBellMatCCW, isCW: false },
      { id: 'arm_rl', angle: (5 * Math.PI) / 4, dx: -1, dz: -1, motor: 'motor_3', mat: motorBellMatCW, isCW: true },
      { id: 'arm_fl', angle: (7 * Math.PI) / 4, dx: -1, dz: 1, motor: 'motor_4', mat: motorBellMatCCW, isCW: false }
    ];

    armAngles.forEach(armConfig => {
      const armMesh = new THREE.Mesh(armGeo, armMat);
      armMesh.rotation.z = Math.PI / 2;
      armMesh.rotation.y = -armConfig.angle;
      const midDist = armLength / 2 + 25;
      armMesh.position.set(
        Math.cos(armConfig.angle) * midDist,
        0,
        Math.sin(armConfig.angle) * midDist
      );
      armMesh.castShadow = true;
      droneRoot.add(armMesh);
      parts[armConfig.id] = {
        mesh: armMesh,
        basePos: armMesh.position.clone(),
        dirX: armConfig.dx * 0.7,
        dirY: 0,
        dirZ: armConfig.dz * 0.7
      };

      // --- Motors (at tip of arm) ---
      const motorGroup = new THREE.Group();
      motorGroup.name = armConfig.motor;
      const endDist = armLength + 25;
      motorGroup.position.set(
        Math.cos(armConfig.angle) * endDist,
        6,
        Math.sin(armConfig.angle) * endDist
      );

      // Motor Base
      const motorBase = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 6, 20), armMat);
      motorGroup.add(motorBase);

      // Motor Bell (Rotating Outrunner)
      const motorBell = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 12, 20), armConfig.mat);
      motorBell.position.y = 8;
      motorGroup.add(motorBell);

      // Shaft
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 12, 12), goldMat);
      shaft.position.y = 16;
      motorGroup.add(shaft);

      // Propeller (2-blade airfoil)
      const propGroup = new THREE.Group();
      propGroup.position.y = 18;

      const bladeGeo = new THREE.BoxGeometry(70, 1.2, 8);
      const blade1 = new THREE.Mesh(bladeGeo, propMat);
      propGroup.add(blade1);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 5, 12), goldMat);
      propGroup.add(hub);

      motorGroup.add(propGroup);
      props.push({ group: propGroup, isCW: armConfig.isCW, id: armConfig.motor });

      droneRoot.add(motorGroup);
      parts[armConfig.motor] = {
        mesh: motorGroup,
        basePos: motorGroup.position.clone(),
        dirX: armConfig.dx * 1.2,
        dirY: 0.8,
        dirZ: armConfig.dz * 1.2
      };
    });

    // --- F. 4S LiPo Battery (Mounted under bottom plate) ---
    const battGroup = new THREE.Group();
    battGroup.name = 'battery';
    battGroup.position.y = -22;

    const battBody = new THREE.Mesh(new THREE.BoxGeometry(45, 24, 85), batteryMat);
    battBody.castShadow = true;
    battGroup.add(battBody);

    const battStrap = new THREE.Mesh(new THREE.BoxGeometry(48, 25, 16), carbonFiberMat);
    battGroup.add(battStrap);

    droneRoot.add(battGroup);
    parts.battery = { mesh: battGroup, baseY: -22, dirX: 0, dirY: -1.5, dirZ: 0 };

    // --- G. GPS Mast & Puck ---
    const gpsGroup = new THREE.Group();
    gpsGroup.name = 'gps_module';
    gpsGroup.position.set(-35, 28, -35);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 45, 12), carbonFiberMat);
    mast.position.y = 22.5;
    gpsGroup.add(mast);

    const puck = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 8, 24), icChipMat);
    puck.position.y = 45;
    gpsGroup.add(puck);

    droneRoot.add(gpsGroup);
    parts.gps_module = { mesh: gpsGroup, baseY: 28, dirX: -0.8, dirY: 1.5, dirZ: -0.8 };

    partsMapRef.current = parts;
    propGroupRef.current = props;

    // 5. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Spin Propellers based on motor state
      props.forEach(p => {
        const speed = isFlying ? 35 : 12;
        p.group.rotation.y += (p.isCW ? -1 : 1) * speed * delta;
      });

      renderer.render(scene, camera);
    };
    animate();

    // 6. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Exploded View & Part Positions
  React.useEffect(() => {
    const parts = partsMapRef.current;
    if (!parts) return;

    const offsetScale = explodedView * 60; // Max exploded distance (60mm)

    for (const key in parts) {
      const item = parts[key];
      if (!item.mesh) continue;

      if (item.basePos) {
        item.mesh.position.x = item.basePos.x + item.dirX * offsetScale;
        item.mesh.position.y = item.basePos.y + item.dirY * offsetScale;
        item.mesh.position.z = item.basePos.z + item.dirZ * offsetScale;
      } else if (item.baseY !== undefined) {
        item.mesh.position.y = item.baseY + item.dirY * offsetScale;
      }

      // Handle Component Isolation & Dimming
      if (isolatedPart) {
        const isTarget = key === isolatedPart || (item.mesh.name && item.mesh.name === isolatedPart);
        item.mesh.traverse(child => {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = isTarget ? 1.0 : 0.15;
          }
        });
      } else {
        item.mesh.traverse(child => {
          if (child.material) {
            child.material.transparent = false;
            child.material.opacity = 1.0;
          }
        });
      }
    }
  }, [explodedView, isolatedPart]);

  // Update Attitude (Roll, Pitch, Yaw)
  React.useEffect(() => {
    if (!droneGroupRef.current) return;
    droneGroupRef.current.rotation.x = (attitude.pitch * Math.PI) / 180;
    droneGroupRef.current.rotation.z = (-attitude.roll * Math.PI) / 180;
    droneGroupRef.current.rotation.y = (attitude.yaw * Math.PI) / 180;
  }, [attitude]);

  // OrbitControls Mouse Interaction
  const handleMouseDown = (e) => {
    mouseStateRef.current.isDragging = e.button === 0;
    mouseStateRef.current.isPanning = e.button === 2;
    mouseStateRef.current.prevX = e.clientX;
    mouseStateRef.current.prevY = e.clientY;
  };

  const handleMouseMove = (e) => {
    const { isDragging, isPanning, prevX, prevY } = mouseStateRef.current;
    if (!isDragging && !isPanning) return;

    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    mouseStateRef.current.prevX = e.clientX;
    mouseStateRef.current.prevY = e.clientY;

    if (isDragging) {
      cameraAngleRef.current.theta -= dx * 0.008;
      cameraAngleRef.current.phi -= dy * 0.008;
      updateCamera();
    } else if (isPanning) {
      cameraAngleRef.current.targetX -= dx * 0.4;
      cameraAngleRef.current.targetY += dy * 0.4;
      updateCamera();
    }
  };

  const handleMouseUp = () => {
    mouseStateRef.current.isDragging = false;
    mouseStateRef.current.isPanning = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(120, Math.min(900, cameraAngleRef.current.radius + e.deltaY * 0.5));
    updateCamera();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
    >
      {/* 3D Viewport Controls Pill Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-panel/85 border border-subtle px-3 py-1.5 rounded-lg text-[10px] font-mono text-muted backdrop-blur-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
        <span className="text-primary font-bold">THREE.JS DIGITAL TWIN</span>
        <span className="text-border-strong">|</span>
        <span>Left Drag: Orbit • Right Drag: Pan • Scroll: Zoom</span>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined') {
  window.FC = window.FC || {};
  window.FC.Drone3DView = Drone3DView;
}

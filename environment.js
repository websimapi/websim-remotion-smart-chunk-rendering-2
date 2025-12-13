import * as THREE from "three";

export const setupLighting = (scene) => {
  // 1. Hemisphere Light - Atmosphere
  // Cool sky, warm ground bounce
  const hemiLight = new THREE.HemisphereLight(0xeef0ff, 0x443322, 0.6);
  scene.add(hemiLight);

  // 2. Sunlight - Key Light
  // Strong, directional, casting hard shadows through the window
  const sunLight = new THREE.DirectionalLight(0xfffaed, 4.0);
  // Position: High and to the side, coming from "outside" (negative Z)
  sunLight.position.set(6, 6, -8); 
  // Target: Center of the kitchen floor area
  sunLight.target.position.set(-1, 0, 2);
  sunLight.castShadow = true;

  // High quality shadow properties
  sunLight.shadow.mapSize.width = 2048; // Balanced for performance
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.bias = -0.0005; // Fix acne
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.radius = 2; // Slight softness
  
  // Tight frustum for sharper shadows in the kitchen area
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 40;
  sunLight.shadow.camera.left = -8;
  sunLight.shadow.camera.right = 8;
  sunLight.shadow.camera.top = 8;
  sunLight.shadow.camera.bottom = -8;
  
  scene.add(sunLight);
  scene.add(sunLight.target);

  // 3. Window Area Light (Simulated Bounce)
  // Instead of a spotlight, we use a wide RectAreaLight-like effect via a soft point light
  // This fills the room with the "sky" color near the window
  const skyFill = new THREE.PointLight(0xddeeff, 1.5, 15);
  skyFill.position.set(0, 2, -1);
  skyFill.decay = 2;
  scene.add(skyFill);

  // 4. Interior Ceiling Light
  // Warm, overhead light for specular highlights and mixed color temps
  const ceilingLight = new THREE.SpotLight(0xffeeb1, 10.0);
  ceilingLight.position.set(0, 3.4, 4); // Centered in the walkable area
  ceilingLight.target.position.set(0, 0, 4);
  ceilingLight.angle = Math.PI / 3;
  ceilingLight.penumbra = 0.5;
  ceilingLight.decay = 2.0;
  ceilingLight.distance = 15;
  
  ceilingLight.castShadow = true;
  ceilingLight.shadow.bias = -0.0001;
  ceilingLight.shadow.mapSize.width = 1024;
  ceilingLight.shadow.mapSize.height = 1024;
  
  scene.add(ceilingLight);
  scene.add(ceilingLight.target);
};

export const createEnvironment = (scene, materials) => {
  const { frameMat, glassMat, outdoorMat, wood, wallMat, ceilingMat, floorMat } = materials;

  const windowWidth = 4;
  const windowHeight = 2.5;
  const frameThickness = 0.1;
  const frameDepth = 0.15;
  const windowZ = -2;

  // Window Frame
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
    frameMat,
  );
  topFrame.position.set(0, 2.8, windowZ);
  topFrame.castShadow = true;
  scene.add(topFrame);

  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + frameThickness * 2, frameThickness, frameDepth),
    frameMat,
  );
  bottomFrame.position.set(0, 0.2, windowZ);
  bottomFrame.castShadow = true;
  bottomFrame.receiveShadow = true;
  scene.add(bottomFrame);

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, windowHeight + 0.1, frameDepth),
    frameMat,
  );
  leftFrame.position.set(-windowWidth / 2 - frameThickness / 2, 1.5, windowZ);
  leftFrame.castShadow = true;
  scene.add(leftFrame);

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, windowHeight + 0.1, frameDepth),
    frameMat,
  );
  rightFrame.position.set(windowWidth / 2 + frameThickness / 2, 1.5, windowZ);
  rightFrame.castShadow = true;
  scene.add(rightFrame);

  // Glass
  const glassGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.02);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 1.5, windowZ);
  scene.add(glass);

  // Outdoor View
  const outdoorGeo = new THREE.PlaneGeometry(12, 8);
  const outdoorView = new THREE.Mesh(outdoorGeo, outdoorMat);
  outdoorView.position.set(0, 2, -5); 
  outdoorView.rotation.y = Math.PI; 
  scene.add(outdoorView);

  // Window Sill
  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.08, 0.6),
    new THREE.MeshStandardMaterial({
      map: wood,
      roughness: 0.4,
    }),
  );
  sill.position.set(0, 0.1, -1.7);
  sill.castShadow = true;
  sill.receiveShadow = true;
  scene.add(sill);

  // Walls
  const wallGroup = new THREE.Group();
  wallGroup.position.z = -2.0; // Front wall plane
  
  const roomWidth = 20;
  const floorY = -3.5;
  const ceilingY = 3.5;
  const fullHeight = 7.0; 
  
  // Window bounds
  const winBoundLeft = -2.08;
  const winBoundRight = 2.08;
  const winBoundTop = 2.82;
  const winBoundBottom = 0.18;

  // 1. Front Left Panel
  const leftW = (roomWidth / 2) + winBoundLeft; 
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(leftW, fullHeight, 0.2),
    wallMat
  );
  leftWall.position.set(-10 + leftW/2, 0, 0);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  wallGroup.add(leftWall);

  // 2. Front Right Panel
  const rightW = (roomWidth / 2) - winBoundRight;
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(rightW, fullHeight, 0.2),
    wallMat
  );
  rightWall.position.set(10 - rightW/2, 0, 0);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  wallGroup.add(rightWall);

  // 3. Front Top Panel
  const midW = winBoundRight - winBoundLeft;
  const topH = ceilingY - winBoundTop;
  if (topH > 0) {
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(midW, topH, 0.2),
      wallMat
    );
    topWall.position.set(0, winBoundTop + topH/2, 0);
    topWall.castShadow = true;
    topWall.receiveShadow = true;
    wallGroup.add(topWall);
  }

  // 4. Front Bottom Panel
  const botH = winBoundBottom - floorY; 
  if (botH > 0) {
    const botWall = new THREE.Mesh(
      new THREE.BoxGeometry(midW, botH, 0.2),
      wallMat
    );
    botWall.position.set(0, floorY + botH/2, 0);
    botWall.castShadow = true;
    botWall.receiveShadow = true;
    wallGroup.add(botWall);
  }

  scene.add(wallGroup);

  // Side & Back Walls
  const roomDepth = 20;
  const sideGeo = new THREE.BoxGeometry(0.2, fullHeight, roomDepth);
  
  // Left Wall
  const sideLeft = new THREE.Mesh(sideGeo, wallMat);
  sideLeft.position.set(-roomWidth/2, 0, -2 + roomDepth/2 - 0.1); 
  sideLeft.receiveShadow = true;
  scene.add(sideLeft);
  
  // Right Wall
  const sideRight = new THREE.Mesh(sideGeo, wallMat);
  sideRight.position.set(roomWidth/2, 0, -2 + roomDepth/2 - 0.1);
  sideRight.receiveShadow = true;
  scene.add(sideRight);
  
  // Back Wall
  const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, fullHeight, 0.2),
      wallMat
  );
  backWall.position.set(0, 0, -2 + roomDepth - 0.2); 
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth + 2),
    ceilingMat
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ceilingY, -2 + roomDepth/2);
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // Ceiling Light Fixture
  const fixtureGroup = new THREE.Group();
  fixtureGroup.position.set(0, ceilingY - 0.05, 4); // Match light position from setupLighting
  
  const fixtureBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.5 })
  );
  fixtureGroup.add(fixtureBase);
  
  const fixtureBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 32, 16),
    new THREE.MeshStandardMaterial({ 
        color: 0xffffee, 
        emissive: 0xffaa77, 
        emissiveIntensity: 2.0,
        toneMapped: false 
    })
  );
  fixtureBulb.position.y = -0.1;
  fixtureGroup.add(fixtureBulb);
  
  scene.add(fixtureGroup);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth + 2),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, floorY, -2 + roomDepth/2); 
  floor.receiveShadow = true;
  scene.add(floor);

  return { glass, outdoorView };
};


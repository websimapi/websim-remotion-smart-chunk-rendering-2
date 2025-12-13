import * as THREE from "three";

export const setupLighting = (scene) => {
  // 1. Hemisphere Light - Natural Ambient Gradient
  // Replaces flat ambient light to fix "weird" shadows and provide base illumination
  const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x2a2a35, 1.0);
  scene.add(hemiLight);

  // 2. Sunlight - Main Directional Source
  // Positioned to stream through the window from outside
  const sunLight = new THREE.DirectionalLight(0xfffaf0, 5.0); 
  sunLight.position.set(4, 10, -10); 
  sunLight.target.position.set(0, 0, 2); 
  sunLight.castShadow = true;
  
  // RTX Quality Shadow Map settings
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.bias = -0.0001;
  sunLight.shadow.normalBias = 0.05; 
  sunLight.shadow.radius = 2.5; // Soft natural edges
  
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 50;
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // 3. Window Fill - Simulates Skylight Diffusion
  // Broad, soft spotlight from the window frame
  const windowFill = new THREE.SpotLight(0xcceeff, 10.0);
  windowFill.position.set(0, 4, -2.5); 
  windowFill.target.position.set(0, 1, 4); 
  windowFill.angle = Math.PI / 1.5; // Very wide throw
  windowFill.penumbra = 1.0; // Maximum softness
  windowFill.decay = 2.0;
  windowFill.distance = 25;
  
  windowFill.castShadow = true;
  windowFill.shadow.mapSize.width = 1024;
  windowFill.shadow.mapSize.height = 1024;
  windowFill.shadow.bias = -0.0001;
  windowFill.shadow.radius = 8; // Extremely soft shadows for diffuse light
  scene.add(windowFill);
  scene.add(windowFill.target);

  // 4. Interior Ceiling Light - "Smaller lighting effect"
  // Localized warm glow, not overpowering the day light
  const ceilingLight = new THREE.PointLight(0xffaa77, 3.0); 
  ceilingLight.position.set(0, 3.2, 2);
  ceilingLight.distance = 6; // Reduced range for localized effect
  ceilingLight.decay = 2.5;
  ceilingLight.castShadow = true;
  ceilingLight.shadow.mapSize.width = 512;
  ceilingLight.shadow.mapSize.height = 512;
  ceilingLight.shadow.bias = -0.0001;
  scene.add(ceilingLight);
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


import * as THREE from "three";

export const setupLighting = (scene) => {
  // 1. Hemisphere Light - "Room Fill"
  // Simulates indirect lighting: Light bouncing off the floor (warm) and sky (cool)
  // This solves the "pitch black shadows" issue by filling the room with ambient light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d7c6a, 0.6);
  scene.add(hemiLight);

  // 2. Sunlight - Key Light
  // Directional sunlight entering through the window
  const sunLight = new THREE.DirectionalLight(0xfff4e5, 5.0); // Slightly warmer, balanced intensity
  sunLight.position.set(6, 6, -10); // Lower angle to cast longer rays into the room
  sunLight.target.position.set(0, -1, 2); // Aim deeper into the kitchen
  sunLight.castShadow = true;

  // High quality shadow settings
  sunLight.shadow.mapSize.width = 4096; 
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.bias = -0.0001; 
  sunLight.shadow.normalBias = 0.02;
  sunLight.shadow.radius = 2.0; // Softens the shadow edges
  
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 100;
  sunLight.shadow.camera.left = -20;
  sunLight.shadow.camera.right = 20;
  sunLight.shadow.camera.top = 20;
  sunLight.shadow.camera.bottom = -20;
  
  scene.add(sunLight);
  scene.add(sunLight.target);

  // 3. Window Fill (Sky Portal)
  // Simulates diffuse skylight entering through the window frame
  // This adds a soft, cool wash of light from the window direction, distinct from the sun beam
  const windowFill = new THREE.SpotLight(0xddeeff, 12.0);
  windowFill.position.set(0, 2.5, -2.0); // At the window
  windowFill.target.position.set(0, 0, 5); // Pointing into the room
  windowFill.angle = Math.PI / 1.5; // Very wide cone
  windowFill.penumbra = 1.0; // Maximum softness
  windowFill.decay = 1.5; // Physical falloff
  windowFill.distance = 20;
  windowFill.castShadow = false; // Purely for fill, saves performance
  
  scene.add(windowFill);
  scene.add(windowFill.target);
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
  // castShadow must be false for light to pass through the mesh physically
  // while keeping transmission enabled for visual distortion/reflection
  const glassGeo = new THREE.BoxGeometry(windowWidth, windowHeight, 0.02);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 1.5, windowZ);
  glass.castShadow = false;
  glass.receiveShadow = true;
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
  sideLeft.castShadow = true;
  scene.add(sideLeft);
  
  // Right Wall
  const sideRight = new THREE.Mesh(sideGeo, wallMat);
  sideRight.position.set(roomWidth/2, 0, -2 + roomDepth/2 - 0.1);
  sideRight.receiveShadow = true;
  sideRight.castShadow = true;
  scene.add(sideRight);
  
  // Back Wall
  const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomWidth, fullHeight, 0.2),
      wallMat
  );
  backWall.position.set(0, 0, -2 + roomDepth - 0.2); 
  backWall.receiveShadow = true;
  backWall.castShadow = true;
  scene.add(backWall);

  // Ceiling
  // Using BoxGeometry to ensure it blocks light from above effectively (casts shadows)
  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.2, roomDepth + 2),
    ceilingMat
  );
  // ceiling.rotation.x = Math.PI / 2; // Not needed for Box, just position it
  ceiling.position.set(0, ceilingY + 0.1, -2 + roomDepth/2);
  ceiling.receiveShadow = true;
  ceiling.castShadow = true;
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


import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, delayRender, continueRender } from "remotion";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { loadMaterials } from "./materials.js";
import { setupLighting, createEnvironment } from "./environment.js";
import { createCounterAndSink } from "./sink.js";
import { createFaucet } from "./faucet.js";
import { createDishes } from "./dishes.js";
import { createWaterSystem } from "./water.js";
const createKitchenScene = (width, height, cubeRenderTarget) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#050505");
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(1, 0.5, 1);
  const materials = loadMaterials();
  setupLighting(scene);
  const { glass, outdoorView } = createEnvironment(scene, materials);
  if (cubeRenderTarget) {
    glass.material.envMap = cubeRenderTarget.texture;
    glass.material.envMapIntensity = 2.5;
  }
  createCounterAndSink(scene, materials);
  const { tipMesh } = createFaucet(scene, materials);
  createDishes(scene, materials);
  const waterSystem = createWaterSystem(scene);
  return { scene, camera, waterSystem, faucetTip: tipMesh, glassMesh: glass, outdoorMesh: outdoorView, materials };
};
const KitchenSceneCanvas = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeCameraRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Loading HDR Environment"));
  const frame = useCurrentFrame();
  const { durationInFrames, width, height, fps } = useVideoConfig();
  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;
    const canvas = document.createElement("canvas");
    containerRef.current.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    RectAreaLightUniformsLib.init();
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      colorSpace: THREE.SRGBColorSpace
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    cubeCamera.position.set(0, 1.5, -2);
    const { scene, camera, waterSystem, faucetTip, glassMesh, outdoorMesh, materials } = createKitchenScene(width, height, cubeRenderTarget);
    scene.add(cubeCamera);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new THREE.TextureLoader().load("kitchen_hdr.png", (texture) => {
      if (!rendererRef.current) {
        pmremGenerator.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      try {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = texture;
        if (outdoorMesh.material) {
          outdoorMesh.material.map = texture;
          outdoorMesh.material.needsUpdate = true;
        }
        glassMesh.visible = false;
        cubeCamera.update(renderer, scene);
        glassMesh.visible = true;
      } catch (e) {
        console.warn("PMREM generation failed", e);
      } finally {
        pmremGenerator.dispose();
        continueRender(handle);
      }
    });
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    scene.userData = { waterSystem, faucetTip, glassMesh, outdoorMesh };
    setReady(true);
    return () => {
      renderer.dispose();
      cubeRenderTarget.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [width, height]);
  useEffect(() => {
    if (!ready || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
      return;
    }
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const t = durationInFrames > 0 ? frame / durationInFrames : 0;
    const smoothT = interpolate(t, [0, 1], [0, 1], {
      easing: Easing.bezier(0.45, 0, 0.55, 1)
    });
    const x = interpolate(smoothT, [0, 0.4, 1], [3, 1.5, -1.8]);
    const y = interpolate(smoothT, [0, 0.2, 1], [1.5, 3.5, 3]);
    const z = interpolate(smoothT, [0, 0.3, 1], [5.5, 7, 9]);
    const lookX = 0;
    const lookY = interpolate(smoothT, [0, 1], [-0.35, -0.05]);
    const lookZ = 0;
    const shake = Math.sin(frame * 0.05) * 2e-3;
    camera.position.set(x, y + shake, z);
    camera.lookAt(lookX, lookY, lookZ);
    const { waterSystem, faucetTip, glassMesh } = scene.userData;
    if (waterSystem && faucetTip) {
      waterSystem.update(frame, fps, faucetTip);
    }
    renderer.render(scene, camera);
  }, [frame, durationInFrames, ready]);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: containerRef,
      style: {
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 208,
      columnNumber: 5
    }
  );
};
const KitchenSceneInteractive = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const requestRef = useRef(null);
  const keys = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false });
  const cameraRotation = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  useEffect(() => {
    if (!containerRef.current) return;
    const canvas = document.createElement("canvas");
    containerRef.current.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });
    RectAreaLightUniformsLib.init();
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(w, h, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      colorSpace: THREE.SRGBColorSpace
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
    cubeCamera.position.set(0, 1.5, -2);
    const { scene, camera, waterSystem, faucetTip, glassMesh, outdoorMesh } = createKitchenScene(w, h, cubeRenderTarget);
    scene.add(cubeCamera);
    camera.position.set(3, 2, 6);
    camera.lookAt(0, 0, 0);
    cameraRotation.current.setFromQuaternion(camera.quaternion);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new THREE.TextureLoader().load("kitchen_hdr.png", (texture) => {
      if (!rendererRef.current) {
        pmremGenerator.dispose();
        return;
      }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      try {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = texture;
        if (outdoorMesh.material) {
          outdoorMesh.material.map = texture;
          outdoorMesh.material.needsUpdate = true;
        }
        glassMesh.visible = false;
        cubeCamera.update(renderer, scene);
        glassMesh.visible = true;
      } catch (e) {
        console.warn("PMREM generation failed", e);
      } finally {
        pmremGenerator.dispose();
      }
    });
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    const onKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = true;
          break;
        case "KeyA":
          keys.current.a = true;
          break;
        case "KeyS":
          keys.current.s = true;
          break;
        case "KeyD":
          keys.current.d = true;
          break;
        case "Space":
          keys.current.space = true;
          break;
        case "ShiftLeft":
          keys.current.shift = true;
          break;
      }
    };
    const onKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
          keys.current.w = false;
          break;
        case "KeyA":
          keys.current.a = false;
          break;
        case "KeyS":
          keys.current.s = false;
          break;
        case "KeyD":
          keys.current.d = false;
          break;
        case "Space":
          keys.current.space = false;
          break;
        case "ShiftLeft":
          keys.current.shift = false;
          break;
      }
    };
    const onMouseMove = (e) => {
      if (document.pointerLockElement === canvas) {
        const sensitivity = 2e-3;
        cameraRotation.current.y -= e.movementX * sensitivity;
        cameraRotation.current.x -= e.movementY * sensitivity;
        cameraRotation.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, cameraRotation.current.x));
        camera.quaternion.setFromEuler(cameraRotation.current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    const onClick = () => canvas.requestPointerLock();
    canvas.addEventListener("click", onClick);
    const onResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      rendererRef.current.setSize(width, height, false);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);
    let lastTime = performance.now();
    let virtualFrame = 0;
    const simFps = 30;
    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1e3, 0.1);
      lastTime = now;
      virtualFrame += delta * simFps;
      if (document.pointerLockElement === canvas) {
        const moveSpeed = 5 * delta;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        right.y = 0;
        right.normalize();
        if (keys.current.w) camera.position.addScaledVector(forward, moveSpeed);
        if (keys.current.s) camera.position.addScaledVector(forward, -moveSpeed);
        if (keys.current.d) camera.position.addScaledVector(right, moveSpeed);
        if (keys.current.a) camera.position.addScaledVector(right, -moveSpeed);
        if (keys.current.space) camera.position.y += moveSpeed;
        if (keys.current.shift) camera.position.y -= moveSpeed;
      }
      if (waterSystem && faucetTip) {
        waterSystem.update(virtualFrame, simFps, faucetTip);
      }
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClick);
      cancelAnimationFrame(requestRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
      if (cubeRenderTarget) cubeRenderTarget.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    };
  }, []);
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      ref: containerRef,
      style: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "relative"
      },
      title: "Click to capture controls"
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 425,
      columnNumber: 5
    }
  );
};
export {
  KitchenSceneCanvas,
  KitchenSceneInteractive
};

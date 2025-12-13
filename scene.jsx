import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, useRef, useState } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import * as THREE from "three";
import { loadMaterials } from "./materials.js";
import { setupLighting, createEnvironment } from "./environment.js";
import { createCounterAndSink } from "./sink.js";
import { createFaucet } from "./faucet.js";
import { createDishes } from "./dishes.js";
import { createWaterSystem } from "./water.js";
const createKitchenScene = (width, height) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#050505");
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(1, 0.5, 1);
  const materials = loadMaterials();
  scene.environment = materials.hdrEnv;
  setupLighting(scene);
  const { glass } = createEnvironment(scene, materials);
  createCounterAndSink(scene, materials);
  const { tipMesh } = createFaucet(scene, materials);
  createDishes(scene, materials);
  const waterSystem = createWaterSystem(scene);
  return { scene, camera, waterSystem, faucetTip: tipMesh, glassMesh: glass };
};
const KitchenSceneCanvas = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeCameraRef = useRef(null);
  const [ready, setReady] = useState(false);
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
      // Hint for better GPU usage
    });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.bias = -5e-4;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const { scene, camera, waterSystem, faucetTip, glassMesh } = createKitchenScene(width, height);
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      magFilter: THREE.LinearFilter
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 50, cubeRenderTarget);
    if (glassMesh) {
      cubeCamera.position.copy(glassMesh.position);
      glassMesh.material.envMap = cubeRenderTarget.texture;
      glassMesh.material.envMapIntensity = 1.2;
      glassMesh.material.needsUpdate = true;
    }
    scene.add(cubeCamera);
    cubeCameraRef.current = cubeCamera;
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    scene.userData = { waterSystem, faucetTip, glassMesh };
    setReady(true);
    return () => {
      renderer.dispose();
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
    if (cubeCameraRef.current && glassMesh && renderer && frame % 2 === 0) {
      glassMesh.visible = false;
      cubeCameraRef.current.update(renderer, scene);
      glassMesh.visible = true;
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
      lineNumber: 168,
      columnNumber: 5
    }
  );
};
const KitchenSceneStandalone = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const cubeCameraRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || rendererRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const canvas = document.createElement("canvas");
    containerRef.current.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(clientWidth, clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    const { scene, camera, waterSystem, faucetTip, glassMesh } = createKitchenScene(clientWidth, clientHeight);
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter
    });
    const cubeCamera = new THREE.CubeCamera(0.1, 50, cubeRenderTarget);
    if (glassMesh) {
      cubeCamera.position.copy(glassMesh.position);
      glassMesh.material.envMap = cubeRenderTarget.texture;
      glassMesh.material.needsUpdate = true;
    }
    scene.add(cubeCamera);
    cubeCameraRef.current = cubeCamera;
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    scene.userData = { waterSystem, faucetTip, glassMesh };
    let animationFrameId;
    const fps = 30;
    const durationSec = 95;
    const durationFrames = fps * durationSec;
    let frame = 0;
    const renderLoop = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      const renderer2 = rendererRef.current;
      const scene2 = sceneRef.current;
      const camera2 = cameraRef.current;
      const t = durationFrames > 0 ? frame % durationFrames / durationFrames : 0;
      const smoothT = t;
      const x = interpolate(t, [0, 0.4, 1], [3, 1.5, -1.8]);
      const y = interpolate(t, [0, 0.2, 1], [1.5, 3.5, 3]);
      const z = interpolate(t, [0, 0.3, 1], [5.5, 7, 9]);
      const lookX = 0;
      const lookY = interpolate(t, [0, 1], [-0.35, -0.05]);
      const lookZ = 0;
      const shake = Math.sin(frame * 0.05) * 5e-3;
      camera2.position.set(x, y + shake, z);
      camera2.lookAt(lookX, lookY, lookZ);
      const { waterSystem: waterSystem2, faucetTip: faucetTip2, glassMesh: glassMesh2 } = scene2.userData;
      if (waterSystem2 && faucetTip2) {
        waterSystem2.update(frame, fps, faucetTip2);
      }
      if (cubeCameraRef.current && glassMesh2 && frame % 2 === 0) {
        glassMesh2.visible = false;
        cubeCameraRef.current.update(renderer2, scene2);
        glassMesh2.visible = true;
      }
      renderer2.render(scene2, camera2);
      frame += 1;
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const { clientWidth: clientWidth2, clientHeight: clientHeight2 } = containerRef.current;
      rendererRef.current.setSize(clientWidth2, clientHeight2, false);
      cameraRef.current.aspect = clientWidth2 / clientHeight2;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
    };
  }, []);
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
      lineNumber: 306,
      columnNumber: 5
    }
  );
};
export {
  KitchenSceneCanvas,
  KitchenSceneStandalone
};

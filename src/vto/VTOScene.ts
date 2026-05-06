import * as THREE from "three";

export function initScene(container: HTMLDivElement, w: number, h: number) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,          // WAJIB: background transparan agar video terlihat
    antialias: true,
    premultipliedAlpha: false,
  });
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // alpha=0, fully transparent

  // Canvas Three.js overlap di atas video
  renderer.domElement.id = "vto-canvas-3d";
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.pointerEvents = "none"; // klik tembus ke video
  container.appendChild(renderer.domElement);

  // Kamera Three.js — pakai PerspectiveCamera dengan FOV yang match video
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
  camera.position.set(0, 0, 500); // jauh dari origin

  const scene = new THREE.Scene();

  // Lighting — wajib ada agar material kacamata terlihat
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(0, 10, 10);
  scene.add(ambient, dirLight);

  return { renderer, camera, scene };
}

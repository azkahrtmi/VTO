import * as THREE from "three";

/**
 * Maps MediaPipe landmarks to Three.js world space coordinates.
 */
export function mediapipeToThreeJS(
  landmark: { x: number; y: number; z: number },
  videoWidth: number,
  videoHeight: number,
  camera: THREE.PerspectiveCamera
): THREE.Vector3 {
  // Step 1: MediaPipe landmarks are already flipped if SelfieMode=true.
  // We assume the video is 640x480 or similar.
  const pixelX = landmark.x * videoWidth;


  const pixelY = landmark.y * videoHeight;



  // Step 2: Pixel -> NDC (Normalized Device Coordinates) [-1 .. 1]
  const ndcX = (pixelX / videoWidth) * 2 - 1;
  const ndcY = -(pixelY / videoHeight) * 2 + 1; // Y is inverted in WebGL

  // Step 3: NDC -> Three.js world space
  // We unproject to a point in the frustum
  const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
  vector.unproject(camera);

  // Step 4: Project from camera position through the vector onto the Z=0 plane (or approximate face plane)
  const dir = vector.sub(camera.position).normalize();
  const distance = -camera.position.z / dir.z;
  const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));

  return worldPos;
}

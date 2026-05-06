import * as THREE from "three";
import { mediapipeToThreeJS } from "./coordinateMapper";

const GLASSES_MODEL_WIDTH = 124; // unit — from data: frame_body X[-62~62]
const SCALE_FACTOR = 2.6; // empirical factor: IPD * 2.6 = frame width

export function updateGlassesTransform(
  glassesModel: THREE.Group,
  landmarks: any[], // NormalizedLandmarkList
  videoW: number,
  videoH: number,
  camera: THREE.PerspectiveCamera
) {
  const lm = landmarks;

  // 1. ANCHOR POINT: Nose Bridge (landmark #6)
  const noseBridge = mediapipeToThreeJS(lm[6], videoW, videoH, camera);

  // 2. EYE POSITIONS for IPD and Rotation
  const leftEye = mediapipeToThreeJS(lm[33], videoW, videoH, camera);
  const rightEye = mediapipeToThreeJS(lm[263], videoW, videoH, camera);

  // 3. POSITION: place model at nose bridge
  glassesModel.position.copy(noseBridge);
  // Optional slight Y offset if it sits too high/low
  // glassesModel.position.y -= 5; 

  // 4. SCALE: calculate from IPD
  const eyeDistWorld = leftEye.distanceTo(rightEye);
  const targetWidthWorld = eyeDistWorld * SCALE_FACTOR;
  const scaleFactor = targetWidthWorld / GLASSES_MODEL_WIDTH;
  glassesModel.scale.setScalar(scaleFactor);

  // 5. ROTATION Z (Roll): tilt of the head
  // In mirrored view, Left Eye (#33) is at higher X than Right Eye (#263)
  const dx = leftEye.x - rightEye.x;
  const dy = leftEye.y - rightEye.y;
  const rollAngle = Math.atan2(dy, dx);
  glassesModel.rotation.z = rollAngle;

  // 6. YAW (Rotation Y): head turning left/right
  // Simple estimation: difference in Z between eyes
  const yawAngle = (leftEye.z - rightEye.z) * 0.05; // Reduced factor
  glassesModel.rotation.y = yawAngle;

  // 7. PITCH (Rotation X): nodding
  const noseTip = mediapipeToThreeJS(lm[1], videoW, videoH, camera);
  const pitchDelta = noseTip.y - noseBridge.y;
  const pitchNorm = pitchDelta / (eyeDistWorld * 0.5);
  glassesModel.rotation.x = pitchNorm * 0.3; // dampen factor

}

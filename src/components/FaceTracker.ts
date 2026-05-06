import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import * as THREE from 'three';

export class FaceTracker {
  private static instance: FaceTracker;
  private faceLandmarker: FaceLandmarker | null = null;
  private isRunning = false;
  private videoElement: HTMLVideoElement | null = null;
  private lastVideoTime = -1;
  
  // Public state for Three.js to consume
  public currentResult: FaceLandmarkerResult | null = null;
  public transformMatrix = new THREE.Matrix4();
  public isFaceDetected = false;

  private constructor() {}

  public static getInstance(): FaceTracker {
    if (!FaceTracker.instance) {
      FaceTracker.instance = new FaceTracker();
    }
    return FaceTracker.instance;
  }

  public async initialize() {
    if (this.faceLandmarker) return;

    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
    );

    this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: '/face_landmarker.task',
        delegate: 'GPU'
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1
    });
  }

  public start(video: HTMLVideoElement) {
    this.videoElement = video;
    this.isRunning = true;
    this.processFrame();
  }

  public stop() {
    this.isRunning = false;
    this.videoElement = null;
    this.currentResult = null;
    this.isFaceDetected = false;
  }

  private processFrame = () => {
    if (!this.isRunning || !this.videoElement || !this.faceLandmarker) return;

    // Only process if video has a new frame
    let startTimeMs = performance.now();
    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      const result = this.faceLandmarker.detectForVideo(this.videoElement, startTimeMs);
      this.currentResult = result;

      if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
        this.isFaceDetected = true;
        // MediaPipe returns a 4x4 matrix (16 flat array, column-major)
        const mpMatrix = result.facialTransformationMatrixes[0].data;
        this.transformMatrix.fromArray(mpMatrix);
      } else {
        this.isFaceDetected = false;
      }
    }

    requestAnimationFrame(this.processFrame);
  }
}

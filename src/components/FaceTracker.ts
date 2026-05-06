import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export class FaceTracker {
  private static instance: FaceTracker;
  private faceLandmarker: FaceLandmarker | null = null;
  private isRunning = false;
  private videoElement: HTMLVideoElement | null = null;
  private lastVideoTime = -1;
  
  public currentResult: FaceLandmarkerResult | null = null;
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
      outputFacialTransformationMatrixes: false, // Not needed for Canvas 2D IPD approach
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

    let startTimeMs = performance.now();
    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      const result = this.faceLandmarker.detectForVideo(this.videoElement, startTimeMs);
      this.currentResult = result;
      this.isFaceDetected = (result.faceLandmarks && result.faceLandmarks.length > 0);
    }

    requestAnimationFrame(this.processFrame);
  }
}

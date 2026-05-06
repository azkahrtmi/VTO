export class CameraManager {
  private static instance: CameraManager;
  public videoElement: HTMLVideoElement | null = null;
  public stream: MediaStream | null = null;

  private constructor() {}

  public static getInstance(): CameraManager {
    if (!CameraManager.instance) {
      CameraManager.instance = new CameraManager();
    }
    return CameraManager.instance;
  }

  public async start(): Promise<HTMLVideoElement> {
    if (this.videoElement && this.stream) {
      return this.videoElement;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: false,
    });

    this.videoElement = document.createElement('video');
    this.videoElement.srcObject = this.stream;
    this.videoElement.playsInline = true;
    
    // Add to DOM
    const container = document.getElementById('video-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(this.videoElement);
    }
    
    await this.videoElement.play();
    return this.videoElement;
  }

  public stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement.remove();
      this.videoElement = null;
    }
  }
}

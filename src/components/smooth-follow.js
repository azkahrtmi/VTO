/**
 * Adaptive Smooth Follow Component for A-Frame
 * 
 * Provides "Essilor-grade" smooth tracking by:
 * 1. Dead Zone — ignores micro-jitter below a threshold
 * 2. Adaptive Alpha — smooths aggressively when still, responds instantly when moving
 * 3. Quaternion SLERP — proper rotation interpolation (no gimbal lock)
 * 4. Frame-rate independent — uses delta time for consistent behavior
 */

/* global AFRAME, THREE */

if (typeof AFRAME !== 'undefined') {
  AFRAME.registerComponent('smooth-follow', {
    schema: {
      target: { type: 'selector' },
      // Dead zone: movements smaller than this (in world units) are ignored
      positionDeadZone: { type: 'number', default: 0.0003 },
      rotationDeadZone: { type: 'number', default: 0.001 }, // in radians
      // Smoothing: lower = smoother but more delay, higher = snappier  
      minAlpha: { type: 'number', default: 0.04 },  // smoothing when still
      maxAlpha: { type: 'number', default: 0.6 },   // smoothing when moving fast
      // Velocity threshold: movement magnitude that triggers full responsiveness
      velocityThreshold: { type: 'number', default: 0.02 },
    },

    init: function () {
      // Smoothed state
      this._smoothedPos = new THREE.Vector3();
      this._smoothedQuat = new THREE.Quaternion();
      this._smoothedScale = new THREE.Vector3(1, 1, 1);
      
      // Previous raw state (for velocity calculation)
      this._prevRawPos = new THREE.Vector3();
      this._prevRawQuat = new THREE.Quaternion();
      
      // Temp vectors for math
      this._targetWorldPos = new THREE.Vector3();
      this._targetWorldQuat = new THREE.Quaternion();
      this._targetWorldScale = new THREE.Vector3();
      
      this._initialized = false;
      this._velocity = 0;
      
      // EMA for velocity itself (to avoid velocity noise)
      this._smoothedVelocity = 0;
    },

    tick: function (time, timeDelta) {
      const target = this.data.target;
      if (!target || !target.object3D) return;
      
      // Get target's world transform
      target.object3D.updateWorldMatrix(true, false);
      target.object3D.matrixWorld.decompose(
        this._targetWorldPos,
        this._targetWorldQuat,
        this._targetWorldScale
      );
      
      // First frame: snap to target immediately
      if (!this._initialized) {
        this._smoothedPos.copy(this._targetWorldPos);
        this._smoothedQuat.copy(this._targetWorldQuat);
        this._smoothedScale.copy(this._targetWorldScale);
        this._prevRawPos.copy(this._targetWorldPos);
        this._prevRawQuat.copy(this._targetWorldQuat);
        this._initialized = true;
        this._applyTransform();
        return;
      }
      
      // Clamp delta to avoid jumps when tab is backgrounded
      const dt = Math.min(timeDelta / 1000, 0.05); // cap at 50ms (20fps min)
      if (dt <= 0) return;
      
      // --- Calculate raw velocity ---
      const posDelta = this._targetWorldPos.distanceTo(this._prevRawPos);
      const quatDelta = this._quatAngleDiff(this._targetWorldQuat, this._prevRawQuat);
      const rawVelocity = posDelta + quatDelta * 0.1; // combine pos + rot velocity
      
      // Smooth the velocity to avoid velocity spikes from noise
      this._smoothedVelocity = this._smoothedVelocity * 0.7 + rawVelocity * 0.3;
      
      // Store current as previous for next frame
      this._prevRawPos.copy(this._targetWorldPos);
      this._prevRawQuat.copy(this._targetWorldQuat);
      
      // --- Dead Zone Check ---
      const posDistance = this._targetWorldPos.distanceTo(this._smoothedPos);
      const rotDistance = this._quatAngleDiff(this._targetWorldQuat, this._smoothedQuat);
      
      const inPositionDeadZone = posDistance < this.data.positionDeadZone;
      const inRotationDeadZone = rotDistance < this.data.rotationDeadZone;
      
      // If both pos and rot are in dead zone AND velocity is low, skip update entirely
      if (inPositionDeadZone && inRotationDeadZone && this._smoothedVelocity < this.data.positionDeadZone * 2) {
        return; // Don't update at all — this is what makes it "still"
      }
      
      // --- Adaptive Alpha ---
      // Map velocity to alpha: low velocity = low alpha (smooth), high velocity = high alpha (responsive)
      const velocityRatio = Math.min(this._smoothedVelocity / this.data.velocityThreshold, 1.0);
      // Use exponential curve for more aggressive response at high velocities
      const curvedRatio = velocityRatio * velocityRatio; 
      const baseAlpha = this.data.minAlpha + (this.data.maxAlpha - this.data.minAlpha) * curvedRatio;
      
      // Frame-rate independent smoothing: convert alpha to work correctly at any FPS
      // Using the formula: alpha_dt = 1 - (1 - alpha)^(dt * 60)
      const alpha = 1.0 - Math.pow(1.0 - baseAlpha, dt * 60);
      
      // --- Apply Position Smoothing ---
      if (!inPositionDeadZone) {
        this._smoothedPos.lerp(this._targetWorldPos, alpha);
      }

      // --- Apply Scale Smoothing ---
      this._smoothedScale.lerp(this._targetWorldScale, alpha);
      
      // --- Apply Rotation Smoothing (SLERP) ---
      if (!inRotationDeadZone) {
        this._smoothedQuat.slerp(this._targetWorldQuat, alpha);
      }
      
      this._applyTransform();
    },

    /**
     * Calculate angular difference between two quaternions in radians
     */
    _quatAngleDiff: function (q1, q2) {
      const dot = Math.abs(q1.dot(q2));
      // Clamp to avoid NaN from acos
      return 2.0 * Math.acos(Math.min(dot, 1.0));
    },

    /**
     * Apply the smoothed transform to this entity's object3D
     */
    _applyTransform: function () {
      this.el.object3D.position.copy(this._smoothedPos);
      this.el.object3D.quaternion.copy(this._smoothedQuat);
      this.el.object3D.scale.copy(this._smoothedScale);
    },
  });
}

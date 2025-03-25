// src/app/core/services/camera.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, Subject, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export interface DeviceInfo {
  deviceId: string;
  label: string;
  facingMode?: string;  // 'user' | 'environment' | undefined
}

@Injectable({ providedIn: 'root' })
export class CameraService {
  private mediaStream: MediaStream | null = null;
  private availableDevices: DeviceInfo[] = [];
  private errorSubject = new Subject<string>();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Initialize camera access and start video stream
   * @param videoElement HTML video element to display the preview
   * @param deviceId Preferred camera device ID
   */
  initializeCamera(
    videoElement: HTMLVideoElement,
    options?: { deviceId?: string; preferBackCamera?: boolean }
  ): Observable<void> {
    if (!this.isBrowser) {
      this.errorSubject.next('Camera access not available in this environment');
      return of();
    }
  
    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: 1280 },
      height: { ideal: 720 },
    };
  
    if (options?.deviceId) {
      videoConstraints.deviceId = { exact: options.deviceId };
    } else if (options?.preferBackCamera) {
      videoConstraints.facingMode = 'environment';
    }
  
    const constraints: MediaStreamConstraints = { video: videoConstraints };
  
    return from(navigator.mediaDevices.getUserMedia(constraints)).pipe(
      switchMap(stream => {
        this.mediaStream = stream;
        videoElement.srcObject = stream;
        return this.loadAvailableDevices();
      }),
      catchError(error => {
        if (options?.preferBackCamera) {
          return this.handleBackCameraFallback(error, videoElement);
        }
        this.handleCameraError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Capture current frame from video stream
   * @returns Observable with captured image Blob
   */
  captureImage(): Observable<Blob> {
    return new Observable(observer => {
      if (!this.mediaStream || !this.isBrowser) {
        observer.error('No active camera session');
        return;
      }

      const videoTrack = this.mediaStream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(videoTrack);
      
      imageCapture.takePhoto()
        .then((blob: Blob) => {
          observer.next(blob);
          observer.complete();
        })
        .catch((error: Error) => {
          this.handleCaptureError(error);
          observer.error(error);
        });
    });
  }

  /**
   * Switch between available camera devices
   * @param videoElement HTML video element to update
   * @param deviceId Target camera device ID
   */
  switchCamera(videoElement: HTMLVideoElement, deviceId: string): Observable<void> {
    this.stopCamera();
    return this.initializeCamera(videoElement, { deviceId: deviceId });
  }

  /**
   * Stop active camera stream
   */
  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Get list of available video devices
   */
  getAvailableDevices(): DeviceInfo[] {
    return [...this.availableDevices];
  }

  /**
   * Observable for camera errors
   */
  get errors$(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  private loadAvailableDevices(): Observable<void> {
    return from(navigator.mediaDevices.enumerateDevices()).pipe(
      switchMap(devices => {
        this.availableDevices = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${this.availableDevices.length + 1}`,
            facingMode: undefined,
          }));
  
        // Update facingMode for active device
        if (this.mediaStream) {
          const track = this.mediaStream.getVideoTracks()[0];
          if (track) {
            const settings = track.getSettings();
            const device = this.availableDevices.find(d => d.deviceId === settings.deviceId);
            if (device) device.facingMode = settings.facingMode;
          }
        }
  
        return of(undefined);
      })
    );
  }

  private handleCameraError(error: Error): void {
    console.error('Camera error:', error);
    let message = 'Camera access failed';

    switch(error.name) {
      case 'NotAllowedError':
        message = 'Camera access denied - please enable camera permissions';
        break;
      case 'NotFoundError':
        message = 'No camera device found';
        break;
      case 'NotReadableError':
        message = 'Camera is already in use by another application';
        break;
    }

    this.errorSubject.next(message);
  }

  private handleCaptureError(error: Error): void {
    console.error('Capture error:', error);
    this.errorSubject.next('Failed to capture image - please try again');
  }

  private handleBackCameraFallback(
    error: Error,
    videoElement: HTMLVideoElement
  ): Observable<void> {
    return this.loadAvailableDevices().pipe(
      switchMap(() => {
        const backDevice = this.findBackCamera();
        if (backDevice) {
          return this.initializeCamera(videoElement, { deviceId: backDevice.deviceId });
        }
        this.handleCameraError(error);
        return throwError(() => error);
      })
    );
  }
  
  private findBackCamera(): DeviceInfo | undefined {
    // Prioritize devices with known facingMode
    const environmentCam = this.availableDevices.find(d => d.facingMode === 'environment');
    if (environmentCam) return environmentCam;
  
    // Fallback to label check
    const keywords = ['back', 'rear', 'environment'];
    return this.availableDevices.find(device =>
      keywords.some(kw => device.label.toLowerCase().includes(kw))
    );
  }
}
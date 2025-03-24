// src/app/core/services/camera.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, from, Subject, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export interface DeviceInfo {
  deviceId: string;
  label: string;
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
  initializeCamera(videoElement: HTMLVideoElement, deviceId?: string): Observable<void> {
    if (!this.isBrowser) {
      this.errorSubject.next('Camera access not available in this environment');
      return of();
    }

    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        deviceId: deviceId ? { exact: deviceId } : undefined
      }
    };

    return from(navigator.mediaDevices.getUserMedia(constraints)).pipe(
      switchMap(stream => {
        this.mediaStream = stream;
        videoElement.srcObject = stream;
        return this.loadAvailableDevices();
      }),
      catchError(error => {
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
    return this.initializeCamera(videoElement, deviceId);
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
            label: device.label || `Camera ${this.availableDevices.length + 1}`
          }));
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
}
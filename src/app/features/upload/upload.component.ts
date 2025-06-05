import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CameraService } from '../../core/services/camera.service';
import { ImageService } from '../../core/services/api/image.service';
import { StateService } from '../../core/services/state/state.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { DeviceInfo } from '../../core/services/camera.service';
import { ErrorService } from '../../core/services/error.service';
import { ProblemDetails } from '../../core/interfaces/problem-details.interface';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    CommonModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit, OnDestroy, AfterViewInit {
  private videoElement!: HTMLVideoElement;
  
  // Change ViewChild to use static: true
  @ViewChild('videoPreview', { static: true }) videoPreview!: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private destroy$ = new Subject<void>();
  
  isLoading = false;
  isCameraActive = false;
  isDragging = false;
  availableDevices: DeviceInfo[] = [];
  currentDevice: DeviceInfo | null = null;

  constructor(
    private cameraService: CameraService,
    private imageService: ImageService,
    private stateService: StateService,
    private errorService: ErrorService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setupCameraErrorHandling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cameraService.stopCamera();
  }

  ngAfterViewInit() {
    this.videoElement = this.videoPreview.nativeElement;
    this.cdr.detectChanges();
  }

  toggleCamera(): void {
    if (this.isCameraActive) {
      this.stopCamera();
    } else {
      this.isCameraActive = true;
      setTimeout(() => {
        this.startCamera();
      }, 100);
    }
  }

  private startCamera(): void {
    this.cameraService.initializeCamera(this.videoElement, { preferBackCamera: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCameraActive = true;
          this.availableDevices = this.cameraService.getAvailableDevices();
          this.updateCurrentDevice();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorService.showError('Failed to start camera. Please check permissions.');
          console.error('Camera error:', error);
        }
      });
  }

  private updateCurrentDevice(): void {
    const stream = this.videoElement.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    
    if (track) {
      const settings = track.getSettings();
      this.currentDevice = this.availableDevices.find(d => d.deviceId === settings.deviceId) || null;
    }
  }

  switchCamera(): void {
    if (this.availableDevices.length < 2) return;
  
    // Try to find opposite facing mode first
    const desiredMode = this.currentDevice?.facingMode === 'environment' ? 'user' : 'environment';
    const nextDevice = this.findDeviceByFacingMode(desiredMode) || this.getNextDevice();
  
    if (nextDevice) {
      this.cameraService.switchCamera(this.videoElement, nextDevice.deviceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.currentDevice = nextDevice;
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.isLoading = false;
            this.errorService.showError('Failed to switch camera. Please try again.');
            console.error('Camera switch error:', error);
          }
        });
    }
  }

  private findDeviceByFacingMode(mode: string): DeviceInfo | undefined {
    return this.availableDevices.find(device => 
      device.facingMode === mode &&
      device.deviceId !== this.currentDevice?.deviceId
    );
  }
  
  private getNextDevice(): DeviceInfo {
    const currentIndex = this.availableDevices.findIndex(
      d => d.deviceId === this.currentDevice?.deviceId
    );
    return this.availableDevices[(currentIndex + 1) % this.availableDevices.length];
  }

  private stopCamera(): void {
    this.cameraService.stopCamera();
    this.isCameraActive = false;
  }

  capturePhoto(): void {
    this.cameraService.captureImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => this.handleImageFile(blob),
        error: (error) => {
          this.isLoading = false;
          this.errorService.showError('Failed to capture photo. Please try again.');
          console.error('Capture error:', error);
        }
      });
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleImageFile(input.files[0]);
    }
  }

  handleDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer?.files.length) {
      this.handleImageFile(event.dataTransfer.files[0]);
    }
  }

  handleDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  private handleImageFile(file: File | Blob): void {
    if (this.isCameraActive) {
      this.stopCamera();
    }

    this.isLoading = true;
    
    this.imageService.uploadImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
            this.stateService.setAnalysisData(result);
            this.router.navigate(['/results']);
        },
        error: () => { 
          this.isLoading = false;
        }
      });
  }

  private setupCameraErrorHandling(): void {
    this.cameraService.errors$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        this.isLoading = false;
        this.errorService.showError(message);
        this.stopCamera();
      });
  }

  // private showError(message: string): void {
  //   this.isLoading = false;
  //   this.snackBar.open(
  //     `${message}`,
  //     'Dismiss', 
  //     {
  //       duration: 5000,
  //       panelClass: ['custom-error-snackbar'],
  //       horizontalPosition: 'center',
  //       verticalPosition: 'top', // More noticeable than bottom
  //       data: {
  //         icon: 'error' // Material icon name
  //       }
  //     }
  //   );
  // }
}
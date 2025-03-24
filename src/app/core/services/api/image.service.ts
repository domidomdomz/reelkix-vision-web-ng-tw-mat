import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ImageAnalysisResponse } from '../../interfaces/shoe-analysis.interface';   

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadImage(file: File | Blob) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageAnalysisResponse>(`${this.apiUrl}/image/upload`, formData);
  }
}

// export interface ImageAnalysisResponse {
//     message: string;
//     imageUrl: string;
//     analysis: ShoeAnalysis;
// }

// export interface ShoeAnalysis {
//     brand: string;
//     model: string;
//     colorway: string;
//     sku: string;
//     confidence: number;
// }
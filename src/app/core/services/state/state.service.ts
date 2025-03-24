// src/app/core/services/state.service.ts
import { Injectable } from '@angular/core';
import { ImageAnalysisResponse } from '../../../core/interfaces/shoe-analysis.interface';

@Injectable({ providedIn: 'root' })
export class StateService {
    private readonly storageKey = 'analysisData';

    setAnalysisData(data: ImageAnalysisResponse): void {
        sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    getAnalysisData(): ImageAnalysisResponse | null {
        const data = sessionStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    clearData(): void {
        sessionStorage.removeItem(this.storageKey);
    }
}
  
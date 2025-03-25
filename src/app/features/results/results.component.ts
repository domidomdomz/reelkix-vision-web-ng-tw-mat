import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { ShoeAnalysis } from '../../core/interfaces/shoe-analysis.interface';
import { StateService } from '../../core/services/state/state.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterModule],
  template: `
    <div class="p-4 min-h-screen">
      <div class="max-w-md mx-auto">
        <mat-card class="bg-reelkix-black text-white p-4">
            <img [src]="imageUrl" class="w-full h-64 object-contain mb-4">
            <div *ngIf="analysis">
            <h2 class="text-xl font-bold mb-4 text-reelkix-red">Analysis Results</h2>

            <!-- Structured Data Section -->
            <div *ngIf="hasStructuredData()">
                <p *ngIf="analysis.brand"><span class="font-semibold">Brand:</span> {{ analysis.brand }}</p>
                <p *ngIf="analysis.model"><span class="font-semibold">Model:</span> {{ analysis.model }}</p>
                <p *ngIf="analysis.colorway"><span class="font-semibold">Colorway:</span> {{ analysis.colorway }}</p>
                <p *ngIf="analysis.sku"><span class="font-semibold">SKU:</span> {{ analysis.sku }}</p>
                <p *ngIf="analysis.confidence"><span class="font-semibold">Confidence:</span> {{ analysis.confidence }}</p>
            </div>

            <!-- Fallback Text Section -->
            <div *ngIf="!hasStructuredData()">
                <p class="whitespace-pre-line">{{ analysis.text }}</p>
            </div>
            </div>
        </mat-card>
        
        <div class="mt-4 flex justify-center">
          <button mat-raised-button color="warn" routerLink="/upload">
            Analyze Another Shoe
          </button>
        </div>
      </div>
    </div>
  `
})
export class ResultsComponent implements OnInit {
    imageUrl = '';
    analysis: ShoeAnalysis | null = null;

    constructor(
        private stateService: StateService,
        private router: Router
    ) {}
    
    ngOnInit() {
        const data = this.stateService.getAnalysisData();
    
        if (!data) {
            this.router.navigate(['/upload']);
            return;
        }

        this.imageUrl = data.imageUrl;
        this.analysis = data.analysis;
        
        // Clear state after displaying
        setTimeout(() => this.stateService.clearData(), 0);
    }

    hasStructuredData(): boolean {
        return !!this.analysis && (
            !!this.analysis.brand?.trim() ||
            !!this.analysis.model?.trim() ||
            !!this.analysis.colorway?.trim() ||
            !!this.analysis.sku?.trim()
        );
    }
}
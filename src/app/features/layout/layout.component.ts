import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MatToolbarModule, MatSidenavModule, MatIconModule, RouterModule],
  template: `
    <mat-toolbar color="primary" class="bg-reelkix-black text-reelkix-red">
        <button mat-icon-button (click)="sidenav.toggle()">
            <mat-icon>menu</mat-icon>
        </button>
        <img src="../../assets/reelkix-vision-logo.png" 
            alt="Reelkix Vision Logo"
            class="h-8 md:h-10 mr-2 hover:opacity-80 transition-opacity"
            style="vertical-align: middle">
        <span class="text-xl font-bold">Vision</span>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav #sidenav class="bg-reelkix-black text-white p-4" mode="over">
        <div class="flex flex-col space-y-4">
          <a routerLink="/upload" (click)="sidenav.close()">Upload</a>
          <a href="[FB_URL]" target="_blank">Facebook</a>
          <a href="[IG_URL]" target="_blank">Instagram</a>
          <a href="[TIKTOK_URL]" target="_blank">TikTok</a>
        </div>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class LayoutComponent {}
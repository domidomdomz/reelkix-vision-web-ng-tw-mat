import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SocialLinksService } from './core/services/social-links.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    RouterModule,
    CommonModule
  ],
  template: `
    <mat-toolbar class="reelkix-toolbar border-b-[1px] !border-reelkix-red">
      <!-- Left Side: Branding -->
      <div class="flex items-center">
        <img src="/assets/images/reelkix-white-logo.png" 
            alt="Reelkix Vision Logo"
            class="h-12 w-auto mr-3">
        <span class="brand-text text-xl font-bold">Reelkix Vision</span>
      </div>

      <!-- Right Side: Menu Button -->
      <div class="flex-1 flex justify-end">
        <button mat-icon-button (click)="sidenav.toggle()" class="menu-button">
          <mat-icon>menu</mat-icon>
        </button>
      </div>
    </mat-toolbar>

    <mat-sidenav-container class="h-[calc(100vh-4rem)]">
      <mat-sidenav #sidenav position="end" class="bg-reelkix-black w-64">
        <div class="p-6 flex flex-col space-y-4">
          <a routerLink="/upload" 
             class="text-white hover:text-reelkix-red transition-colors"
             (click)="sidenav.close()">
            Upload Photo
          </a>
          <a *ngFor="let link of socialLinks" 
             [href]="link.url" 
             target="_blank"
             class="text-white hover:text-reelkix-red transition-colors">
            <mat-icon class="mr-2">{{ link.icon }}</mat-icon>
            {{ link.name }}
          </a>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="bg-reelkix-dark-gray">
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  socialLinks: { name: string; url: string; icon: string }[] = [];

  constructor(
    private socialLinksService: SocialLinksService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.socialLinks = [
      { name: 'Facebook', url: this.socialLinksService.facebook, icon: 'facebook' },
      { name: 'Instagram', url: this.socialLinksService.instagram, icon: 'photo_camera' },
      { name: 'TikTok', url: this.socialLinksService.tiktok, icon: 'music_video' }
    ];
  }
}
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocialLinksService {
  get facebook(): string {
    return environment.socialLinks.facebook;
  }

  get instagram(): string {
    return environment.socialLinks.instagram;
  }

  get tiktok(): string {
    return environment.socialLinks.tiktok;
  }
}
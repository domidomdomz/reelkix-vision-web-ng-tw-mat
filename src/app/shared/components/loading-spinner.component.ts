import { Component } from '@angular/core';

@Component({
  selector: 'loading-spinner',
  standalone: true,
  template: `
    <div class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
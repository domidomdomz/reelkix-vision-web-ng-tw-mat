import { Component } from '@angular/core';

@Component({
  selector: 'loading-spinner',
  standalone: true,
  template: `
  <div class="flex justify-center items-center">
    <img src="/assets/images/reelkix-white-logo.png" 
         alt="Loading..."
         class="animate-flip 
                opacity-90 
                transition-all duration-1000">
  </div>
`,
})
export class LoadingSpinnerComponent {}
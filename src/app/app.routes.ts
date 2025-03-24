import { Routes } from '@angular/router';
import { UploadComponent } from '../app/features/upload/upload.component';
import { ResultsComponent } from '../app/features/results/results.component';

export const routes: Routes = [
  {
    path: 'upload',
    component: UploadComponent
  },
  {
    path: 'results',
    component: ResultsComponent
  },
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'upload'
  }
];
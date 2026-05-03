import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'youtube', pathMatch: 'full' },
  {
    path: 'youtube',
    loadComponent: () =>
      import('./pages/youtube/youtube.component').then((m) => m.YoutubeComponent),
  },
  {
    path: 'spotify',
    loadComponent: () =>
      import('./pages/spotify/spotify.component').then((m) => m.SpotifyComponent),
  },
  {
    path: 'emergencia',
    loadComponent: () =>
      import('./pages/emergency/emergency.component').then((m) => m.EmergencyComponent),
  },
  { path: '**', redirectTo: 'youtube' },
];

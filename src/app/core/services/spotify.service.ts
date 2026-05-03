import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpotifyModel } from '../models/spotify.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SpotifyService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/spotify`;

  getAll(): Observable<SpotifyModel[]> {
    return this.http.get<SpotifyModel[]>(this.base);
  }

  updateFavorite(id: string, favorite: boolean): Observable<SpotifyModel> {
    const params = new HttpParams().set('favorite', favorite);
    return this.http.put<SpotifyModel>(`${this.base}/${id}`, null, { params });
  }

  download(input: string): Observable<SpotifyModel> {
    const songId = this.extractSpotifyId(input.trim());
    const params = new HttpParams().set('songId', songId);
    return this.http.post<SpotifyModel>(`${this.base}/download`, null, { params });
  }

  private extractSpotifyId(input: string): string {
    // Extrae el ID de cualquier variante de URL de Spotify
    // Cubre: /track/, /intl-es/track/, /en/track/, etc.
    const match = input.match(
      /spotify\.com(?:\/[a-z]{2}(?:-[a-z]{2,4})?)?\/track\/([a-zA-Z0-9]{22})/,
    );
    if (match) return match[1];
    // Si ya es un ID puro lo devuelve tal cual
    return input;
  }

  delete(id: string): Observable<string> {
    return this.http.patch(`${this.base}/${id}/delete`, null, { responseType: 'text' });
  }

  restore(id: string): Observable<string> {
    return this.http.patch(`${this.base}/${id}/restore`, null, { responseType: 'text' });
  }

  deletePermanent(id: string): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }
}

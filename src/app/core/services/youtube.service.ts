import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoModel } from '../models/video.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class YoutubeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/youtube`;

  getAll(): Observable<VideoModel[]> {
    return this.http.get<VideoModel[]>(this.base);
  }

  updateFavorite(id: string, favorite: boolean): Observable<VideoModel> {
    const params = new HttpParams().set('favorite', favorite);
    return this.http.put<VideoModel>(`${this.base}/${id}`, null, { params });
  }

  download(input: string): Observable<VideoModel> {
    const params = new HttpParams().set('videoId', input.trim());
    return this.http.post<VideoModel>(`${this.base}/convert`, null, { params });
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

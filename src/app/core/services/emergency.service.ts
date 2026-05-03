import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PetEmergencyAnalysis, PetEmergencyRequest } from '../models/emergency.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmergencyService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/pet-emergency`;

  analyze(request: PetEmergencyRequest): Observable<object> {
    return this.http.post<object>(`${this.base}/analyze`, request);
  }

  getAll(): Observable<PetEmergencyAnalysis[]> {
    return this.http.get<PetEmergencyAnalysis[]>(`${this.base}/list`);
  }

  deleteLogical(id: number): Observable<PetEmergencyAnalysis> {
    return this.http.patch<PetEmergencyAnalysis>(`${this.base}/logical/${id}`, null);
  }

  restoreLogical(id: number): Observable<PetEmergencyAnalysis> {
    return this.http.patch<PetEmergencyAnalysis>(`${this.base}/restore/${id}`, null);
  }

  deletePhysical(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/physical/${id}`);
  }
}

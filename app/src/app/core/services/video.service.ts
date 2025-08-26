import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { VideoItem } from '../models/video.model';

@Injectable({ providedIn: 'root' })
export class VideoService {
  private apiUrl = 'http://localhost:8080/api/video';

  constructor(private http: HttpClient) {}

  getAll(): Observable<VideoItem[]> {
    return this.http.get<VideoItem[]>(`${this.apiUrl}/`).pipe(
      map((items: any[]) =>
        (items || []).map((v: any) => ({
          ...v,
          categoriaId: (v?.categoriaId && typeof v.categoriaId === 'object') ? (v.categoriaId?._id ?? null) : (v?.categoriaId ?? null),
          categoriaNombre: (v?.categoriaId && typeof v.categoriaId === 'object') ? (v.categoriaId?.nombre ?? '') : '',
        }))
      )
    );
  }

  getOne(id: string): Observable<VideoItem> {
    return this.http.get<VideoItem>(`${this.apiUrl}/${id}`);
  }

  create(video: Partial<VideoItem>): Observable<VideoItem> {
    return this.http.post<VideoItem>(`${this.apiUrl}/`, video);
  }

  update(id: string, video: Partial<VideoItem>): Observable<VideoItem> {
    return this.http.put<VideoItem>(`${this.apiUrl}/${id}`, video);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}



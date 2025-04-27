// src/app/core/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Document {
  id: string;
  name: string;
  description?: string;
  contentType: string;
  size: number;
  checksum: string;
  folderId?: string;
  createdBy: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdBy: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;
  private folderApiUrl = `${environment.apiUrl}/folders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Helper method to get auth headers
  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.authService.getToken())
      .pipe(
        switchMap(token => {
          return of(new HttpHeaders({
            'Authorization': `Bearer ${token}`
          }));
        })
      );
  }

  // Document methods
  getDocuments(folderId?: string): Observable<Document[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        let url = this.apiUrl;
        if (folderId) {
          url += `?folderId=${folderId}`;
        }
        return this.http.get<Document[]>(url, { headers });
      })
    );
  }

  getDocument(id: string): Observable<Document> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<Document>(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  uploadDocument(file: File, folderId?: string): Observable<HttpEvent<any>> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        const formData: FormData = new FormData();
        formData.append('file', file);
        
        if (folderId) {
          formData.append('folderId', folderId);
        }

        const req = new HttpRequest('POST', this.apiUrl, formData, {
          headers: headers,
          reportProgress: true,
          responseType: 'json'
        });

        return this.http.request(req);
      })
    );
  }

  updateDocument(id: string, data: Partial<Document>): Observable<Document> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put<Document>(`${this.apiUrl}/${id}`, data, { headers });
      })
    );
  }

  deleteDocument(id: string): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
      })
    );
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get(`${this.apiUrl}/${id}/content`, {
          headers: headers,
          responseType: 'blob'
        });
      })
    );
  }

  // Folder methods
  getFolders(parentId?: string): Observable<Folder[]> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        let url = this.folderApiUrl;
        if (parentId) {
          url += `?parentId=${parentId}`;
        }
        return this.http.get<Folder[]>(url, { headers });
      })
    );
  }

  getFolder(id: string): Observable<Folder> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.get<Folder>(`${this.folderApiUrl}/${id}`, { headers });
      })
    );
  }

  createFolder(folder: Partial<Folder>): Observable<Folder> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.post<Folder>(this.folderApiUrl, folder, { headers });
      })
    );
  }

  updateFolder(id: string, folder: Partial<Folder>): Observable<Folder> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.put<Folder>(`${this.folderApiUrl}/${id}`, folder, { headers });
      })
    );
  }

  deleteFolder(id: string): Observable<void> {
    return this.getAuthHeaders().pipe(
      switchMap(headers => {
        return this.http.delete<void>(`${this.folderApiUrl}/${id}`, { headers });
      })
    );
  }
}
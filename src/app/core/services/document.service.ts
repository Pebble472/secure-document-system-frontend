// src/app/core/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) { }

  // Document methods
  getDocuments(folderId?: string): Observable<Document[]> {
    let url = this.apiUrl;
    if (folderId) {
      url += `?folderId=${folderId}`;
    }
    return this.http.get<Document[]>(url);
  }

  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  uploadDocument(file: File, folderId?: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const req = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  updateDocument(id: string, data: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, data);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/content`, {
      responseType: 'blob'
    });
  }

  // Folder methods
  getFolders(parentId?: string): Observable<Folder[]> {
    let url = this.folderApiUrl;
    if (parentId) {
      url += `?parentId=${parentId}`;
    }
    return this.http.get<Folder[]>(url);
  }

  getFolder(id: string): Observable<Folder> {
    return this.http.get<Folder>(`${this.folderApiUrl}/${id}`);
  }

  createFolder(folder: Partial<Folder>): Observable<Folder> {
    return this.http.post<Folder>(this.folderApiUrl, folder);
  }

  updateFolder(id: string, folder: Partial<Folder>): Observable<Folder> {
    return this.http.put<Folder>(`${this.folderApiUrl}/${id}`, folder);
  }

  deleteFolder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.folderApiUrl}/${id}`);
  }
}
// src/app/features/documents/document-list/document-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { DocumentService } from '../../../core/services/document.service';
// Explicitly import and rename the interfaces to avoid conflicts
import { Document as DocumentModel, Folder } from '../../../core/services/document.service';
import { UploadDocumentDialogComponent } from '../upload-document-dialog/upload-document-dialog.component';
import { CreateFolderDialogComponent } from '../create-folder-dialog/create-folder-dialog.component';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="document-container">
      <!-- Header with breadcrumb and actions -->
      <div class="header">
        <div class="breadcrumb">
          <button mat-button (click)="navigateToRoot()">
            <mat-icon>home</mat-icon> Root
          </button>
          <ng-container *ngFor="let crumb of breadcrumbs; let i = index">
            <span class="breadcrumb-separator">/</span>
            <button mat-button (click)="navigateToFolder(crumb.id)">
              {{ crumb.name }}
            </button>
          </ng-container>
        </div>
        
        <div class="actions" *ngIf="canUpload">
          <button mat-raised-button color="primary" (click)="openUploadDialog()">
            <mat-icon>upload</mat-icon>
            Upload Document
          </button>
          <button mat-raised-button color="accent" (click)="openCreateFolderDialog()">
            <mat-icon>create_new_folder</mat-icon>
            New Folder
          </button>
        </div>
      </div>

      <!-- Loading spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading...</p>
      </div>

      <!-- Empty state -->
      <mat-card *ngIf="!loading && folders.length === 0 && documents.length === 0">
        <mat-card-content class="empty-state">
          <mat-icon class="empty-icon">folder_open</mat-icon>
          <h2>This folder is empty</h2>
          <p>Upload documents or create folders to get started</p>
          <div class="empty-actions" *ngIf="canUpload">
            <button mat-raised-button color="primary" (click)="openUploadDialog()">
              Upload Document
            </button>
            <button mat-raised-button color="accent" (click)="openCreateFolderDialog()">
              Create Folder
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Folders section -->
      <div class="content-section" *ngIf="!loading && folders.length > 0">
        <h2>Folders</h2>
        <div class="folders-grid">
          <div class="folder-item" *ngFor="let folder of folders">
            <div class="folder-card" (click)="navigateToFolder(folder.id)">
              <mat-icon class="folder-icon">folder</mat-icon>
              <div class="folder-details">
                <h3 class="folder-name">{{ folder.name }}</h3>
                <p class="folder-info">Created: {{ folder.createdAt | date }}</p>
              </div>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="folderMenu" (click)="$event.stopPropagation()">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #folderMenu="matMenu">
              <button mat-menu-item (click)="renameFolder(folder)">
                <mat-icon>edit</mat-icon>
                <span>Rename</span>
              </button>
              <button mat-menu-item (click)="deleteFolder(folder.id)">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>

      <!-- Documents section -->
      <div class="content-section" *ngIf="!loading && documents.length > 0">
        <h2>Documents</h2>
        <div class="documents-grid">
          <div class="document-item" *ngFor="let document of documents">
            <div class="document-card" (click)="viewDocument(document.id)">
              <mat-icon class="document-icon">{{ getDocumentIcon(document.contentType) }}</mat-icon>
              <div class="document-details">
                <h3 class="document-name">{{ document.name }}</h3>
                <p class="document-info">
                  {{ formatFileSize(document.size) }} • {{ document.contentType }} • 
                  {{ document.updatedAt | date }}
                </p>
              </div>
            </div>
            <button mat-icon-button [matMenuTriggerFor]="documentMenu" (click)="$event.stopPropagation()">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #documentMenu="matMenu">
              <button mat-menu-item (click)="downloadDocument(document.id)">
                <mat-icon>download</mat-icon>
                <span>Download</span>
              </button>
              <button mat-menu-item (click)="viewDocument(document.id)">
                <mat-icon>visibility</mat-icon>
                <span>View Details</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="renameDocument(document)">
                <mat-icon>edit</mat-icon>
                <span>Rename</span>
              </button>
              <button mat-menu-item (click)="deleteDocument(document.id)">
                <mat-icon>delete</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
    }
    .breadcrumb-separator {
      margin: 0 4px;
      color: #757575;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }
    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
      color: #757575;
    }
    .empty-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .content-section {
      margin-bottom: 30px;
    }
    .folders-grid, .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }
    .folder-item, .document-item {
      display: flex;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .folder-item:hover, .document-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .folder-card, .document-card {
      display: flex;
      align-items: center;
      padding: 16px;
      cursor: pointer;
      flex: 1;
    }
    .folder-icon, .document-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
      margin-right: 16px;
    }
    .folder-icon {
      color: #FFC107;
    }
    .folder-details, .document-details {
      overflow: hidden;
    }
    .folder-name, .document-name {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .folder-info, .document-info {
      margin: 4px 0 0;
      font-size: 12px;
      color: #757575;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class DocumentListComponent implements OnInit {
  canUpload = false;
  loading = true;
  currentFolderId?: string;
  folders: Folder[] = [];
  documents: DocumentModel[] = [];
  breadcrumbs: { id: string; name: string }[] = [];
  
  constructor(
    private authService: AuthService,
    private documentService: DocumentService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if user has permission to upload
    this.authService.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.canUpload = this.authService.hasRole('ADMIN') || this.authService.hasRole('EDITOR');
      }
    });

    // Get the current folder ID from route params
    this.route.queryParams.subscribe(params => {
      this.currentFolderId = params['folderId'];
      this.loadContent();
      this.loadBreadcrumbs();
    });
  }

  loadContent(): void {
    this.loading = true;
    
    // Load folders
    this.documentService.getFolders(this.currentFolderId).subscribe({
      next: (folders) => {
        this.folders = folders;
        
        // Load documents
        this.documentService.getDocuments(this.currentFolderId).subscribe({
          next: (documents) => {
            this.documents = documents;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading documents:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading folders:', error);
        this.loading = false;
      }
    });
  }

  loadBreadcrumbs(): void {
    this.breadcrumbs = [];
    
    // If we're in a folder, load the breadcrumb path
    if (this.currentFolderId) {
      this.loadFolderPath(this.currentFolderId);
    }
  }

  loadFolderPath(folderId: string): void {
    this.documentService.getFolder(folderId).subscribe({
      next: (folder) => {
        // Add current folder to breadcrumbs
        this.breadcrumbs.unshift({ id: folder.id, name: folder.name });
        
        // If this folder has a parent, recursively load that too
        if (folder.parentId) {
          this.loadFolderPath(folder.parentId);
        }
      },
      error: (error) => {
        console.error('Error loading folder path:', error);
      }
    });
  }

  navigateToRoot(): void {
    this.router.navigate(['/documents'], { queryParams: {} });
  }

  navigateToFolder(folderId: string): void {
    this.router.navigate(['/documents'], { queryParams: { folderId } });
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      width: '500px',
      data: { folderId: this.currentFolderId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Upload dialog result:', result);
      if (result) {
        console.log('Reloading document list after upload');
        this.loadContent();
      }
    });
  }

  openCreateFolderDialog(): void {
    const dialogRef = this.dialog.open(CreateFolderDialogComponent, {
      width: '400px',
      data: { parentId: this.currentFolderId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload content after successful folder creation
        this.loadContent();
      }
    });
  }

  viewDocument(documentId: string): void {
    this.router.navigate(['/documents/view', documentId]);
  }

  downloadDocument(documentId: string): void {
    this.documentService.downloadDocument(documentId).pipe(take(1)).subscribe({
      next: (blob: Blob) => {
        // Get document information to determine file name
        this.documentService.getDocument(documentId).pipe(take(1)).subscribe({
          next: (docInfo: DocumentModel) => {
            // Create a download link and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = docInfo.name;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
          },
          error: (error) => {
            console.error('Error getting document information:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error downloading document:', error);
      }
    });
  }

  renameDocument(document: DocumentModel): void {
    // This would be implemented with a dialog similar to the upload dialog
    console.log('Rename document: ', document);
    // For now, we'll just show a placeholder
    alert(`Rename functionality will be implemented for: ${document.name}`);
  }

  deleteDocument(documentId: string): void {
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      this.documentService.deleteDocument(documentId).subscribe({
        next: () => {
          // Remove the document from the list without reloading
          this.documents = this.documents.filter(doc => doc.id !== documentId);
        },
        error: (error) => {
          console.error('Error deleting document:', error);
        }
      });
    }
  }

  renameFolder(folder: Folder): void {
    // This would be implemented with a dialog similar to the create folder dialog
    console.log('Rename folder: ', folder);
    // For now, we'll just show a placeholder
    alert(`Rename functionality will be implemented for: ${folder.name}`);
  }

  deleteFolder(folderId: string): void {
    if (confirm('Are you sure you want to delete this folder and all its contents? This action cannot be undone.')) {
      this.documentService.deleteFolder(folderId).subscribe({
        next: () => {
          // Remove the folder from the list without reloading
          this.folders = this.folders.filter(folder => folder.id !== folderId);
        },
        error: (error) => {
          console.error('Error deleting folder:', error);
        }
      });
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
  }

  
  getDocumentIcon(contentType: string): string {
    if (!contentType) return 'insert_drive_file';
    
    if (contentType.includes('pdf')) {
      return 'picture_as_pdf';
    } else if (contentType.includes('word') || contentType.includes('document') || contentType.includes('msword')) {
      return 'description';
    } else if (contentType.includes('excel') || contentType.includes('spreadsheet') || contentType.includes('csv')) {
      return 'table_chart';
    } else if (contentType.includes('powerpoint') || contentType.includes('presentation')) {
      return 'slideshow';
    } else if (contentType.includes('image')) {
      return 'image';
    } else if (contentType.includes('video')) {
      return 'video_file';
    } else if (contentType.includes('audio')) {
      return 'audio_file';
    } else if (contentType.includes('text')) {
      return 'article';
    } else if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('tar') || contentType.includes('7z')) {
      return 'folder_zip';
    }
    
    return 'insert_drive_file';
  }
}
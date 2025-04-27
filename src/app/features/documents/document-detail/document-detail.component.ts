// src/app/features/documents/document-detail/document-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { DocumentService, Document } from '../../../core/services/document.service';
import { AuthService } from '../../../core/services/auth.service';

// Interface for document versions
interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  storagePath: string;
  size: number;
  checksum: string;
  createdBy: string;
  createdAt: Date;
}

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatDialogModule,
    DatePipe
  ],
  template: `
    <div class="container">
      <!-- Back button and header -->
      <div class="header-actions">
        <button mat-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Back to Documents
        </button>
        
        <div class="action-buttons">
          <button mat-raised-button color="primary" (click)="downloadDocument()">
            <mat-icon>download</mat-icon> Download
          </button>
          
          <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="More options">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="createShareLink()" *ngIf="canShare">
              <mat-icon>share</mat-icon>
              <span>Share</span>
            </button>
            <button mat-menu-item (click)="uploadNewVersion()" *ngIf="canEdit">
              <mat-icon>upload_file</mat-icon>
              <span>Upload New Version</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="renameDocument()" *ngIf="canEdit">
              <mat-icon>edit</mat-icon>
              <span>Rename</span>
            </button>
            <button mat-menu-item (click)="moveDocument()" *ngIf="canEdit">
              <mat-icon>drive_file_move</mat-icon>
              <span>Move</span>
            </button>
            <button mat-menu-item class="delete-option" (click)="deleteDocument()" *ngIf="canDelete">
              <mat-icon>delete</mat-icon>
              <span>Delete</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <!-- Loading spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading document details...</p>
      </div>

      <!-- Error message -->
      <mat-card *ngIf="error" class="error-card">
        <mat-card-content>
          <mat-icon>error</mat-icon>
          <h2>Error loading document</h2>
          <p>{{ error }}</p>
          <button mat-button color="primary" (click)="goBack()">Go Back</button>
        </mat-card-content>
      </mat-card>

      <!-- Document details -->
      <div *ngIf="document && !loading && !error" class="document-details">
        <div class="document-header">
          <div class="document-icon-container">
            <mat-icon class="document-icon">{{ getDocumentIcon(document.contentType) }}</mat-icon>
          </div>
          <div class="document-title-container">
            <h1 class="document-title">{{ document.name }}</h1>
            <div class="document-metadata">
              <span class="metadata-item">{{ formatFileSize(document.size) }}</span>
              <span class="separator">•</span>
              <span class="metadata-item">{{ document.contentType }}</span>
              <span class="separator">•</span>
              <span class="metadata-item">Created: {{ document.createdAt | date:'medium' }}</span>
              <span class="separator">•</span>
              <span class="metadata-item">Last modified: {{ document.updatedAt | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Document content tabs -->
        <mat-tab-group>
          <!-- Preview tab -->
          <mat-tab label="Preview">
            <div class="tab-content">
              <div *ngIf="isLoading" class="preview-loading">
                <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                <p>Loading preview...</p>
              </div>
              
              <div *ngIf="!isLoading" class="preview-container">
                <!-- PDF preview -->
                <div *ngIf="isPdf" class="pdf-preview">
                  <iframe [src]="previewUrl" width="100%" height="600" frameborder="0"></iframe>
                </div>
                
                <!-- Image preview -->
                <div *ngIf="isImage" class="image-preview">
                  <img [src]="previewUrl" alt="{{ document.name }}">
                </div>
                
                <!-- Text preview -->
                <div *ngIf="isText" class="text-preview">
                  <pre>{{ textContent }}</pre>
                </div>
                
                <!-- Video preview -->
                <div *ngIf="isVideo" class="video-preview">
                  <video [src]="previewUrl" controls width="100%"></video>
                </div>
                
                <!-- Audio preview -->
                <div *ngIf="isAudio" class="audio-preview">
                  <audio [src]="previewUrl" controls width="100%"></audio>
                </div>
                
                <!-- No preview available -->
                <div *ngIf="!canPreview" class="no-preview">
                  <mat-icon>visibility_off</mat-icon>
                  <h3>Preview not available</h3>
                  <p>This file type cannot be previewed. Please download the file to view its contents.</p>
                  <button mat-raised-button color="primary" (click)="downloadDocument()">
                    <mat-icon>download</mat-icon> Download
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <!-- Details tab -->
          <mat-tab label="Details">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <h2>Document Information</h2>
                  
                  <div class="info-grid">
                    <div class="info-row">
                      <div class="info-label">Name:</div>
                      <div class="info-value">{{ document.name }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">Description:</div>
                      <div class="info-value">{{ document.description || 'No description' }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">File Type:</div>
                      <div class="info-value">{{ document.contentType }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">Size:</div>
                      <div class="info-value">{{ formatFileSize(document.size) }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">Created By:</div>
                      <div class="info-value">{{ document.createdBy }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">Owner:</div>
                      <div class="info-value">{{ document.ownerId }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">Created:</div>
                      <div class="info-value">{{ document.createdAt | date:'medium' }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">Last Modified:</div>
                      <div class="info-value">{{ document.updatedAt | date:'medium' }}</div>
                    </div>
                    
                    <div class="info-row">
                      <div class="info-label">File Checksum:</div>
                      <div class="info-value">{{ document.checksum }}</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Versions tab -->
          <mat-tab label="Versions">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="versions-header">
                    <h2>Version History</h2>
                    <button mat-raised-button color="primary" (click)="uploadNewVersion()" *ngIf="canEdit">
                      <mat-icon>upload_file</mat-icon> Upload New Version
                    </button>
                  </div>
                  
                  <div *ngIf="loadingVersions" class="loading-versions">
                    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                    <p>Loading version history...</p>
                  </div>
                  
                  <div *ngIf="!loadingVersions && versions.length === 0" class="no-versions">
                    <p>No version history is available for this document.</p>
                  </div>
                  
                  <mat-list *ngIf="!loadingVersions && versions.length > 0">
                    <mat-list-item *ngFor="let version of versions">
                      <mat-icon matListItemIcon>history</mat-icon>
                      <div matListItemTitle>Version {{ version.versionNumber }}</div>
                      <div matListItemLine>
                        {{ formatFileSize(version.size) }} • 
                        {{ version.createdAt | date:'medium' }} • 
                        Uploaded by {{ version.createdBy }}
                      </div>
                      <div matListItemMeta>
                        <button mat-icon-button [matMenuTriggerFor]="versionMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #versionMenu="matMenu">
                          <button mat-menu-item (click)="downloadVersion(version)">
                            <mat-icon>download</mat-icon>
                            <span>Download</span>
                          </button>
                          <button mat-menu-item (click)="restoreVersion(version)" *ngIf="canEdit && version.versionNumber !== currentVersionNumber">
                            <mat-icon>restore</mat-icon>
                            <span>Restore This Version</span>
                          </button>
                        </mat-menu>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Permissions tab -->
          <mat-tab label="Permissions" *ngIf="canShare">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="permissions-header">
                    <h2>Access Permissions</h2>
                    <button mat-raised-button color="primary" (click)="addUserPermission()">
                      <mat-icon>person_add</mat-icon> Add User
                    </button>
                  </div>
                  
                  <div *ngIf="loadingPermissions" class="loading-permissions">
                    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                    <p>Loading permissions...</p>
                  </div>
                  
                  <div *ngIf="!loadingPermissions && permissions.length === 0" class="no-permissions">
                    <p>No additional users have been granted access to this document.</p>
                    <button mat-stroked-button color="primary" (click)="addUserPermission()">
                      <mat-icon>person_add</mat-icon> Add User
                    </button>
                  </div>
                  
                  <mat-list *ngIf="!loadingPermissions && permissions.length > 0">
                    <mat-list-item *ngFor="let permission of permissions">
                      <mat-icon matListItemIcon>person</mat-icon>
                      <div matListItemTitle>{{ permission.userName }}</div>
                      <div matListItemLine>
                        <mat-chip-set>
                          <mat-chip *ngIf="permission.canRead">Read</mat-chip>
                          <mat-chip *ngIf="permission.canWrite">Write</mat-chip>
                          <mat-chip *ngIf="permission.canDelete">Delete</mat-chip>
                          <mat-chip *ngIf="permission.canShare">Share</mat-chip>
                        </mat-chip-set>
                      </div>
                      <div matListItemMeta>
                        <button mat-icon-button [matMenuTriggerFor]="permissionMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #permissionMenu="matMenu">
                          <button mat-menu-item (click)="editPermission(permission)">
                            <mat-icon>edit</mat-icon>
                            <span>Edit Permissions</span>
                          </button>
                          <button mat-menu-item (click)="removePermission(permission)">
                            <mat-icon>delete</mat-icon>
                            <span>Remove Access</span>
                          </button>
                        </mat-menu>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
          
          <!-- Sharing tab -->
          <mat-tab label="Sharing Links" *ngIf="canShare">
            <div class="tab-content">
              <mat-card>
                <mat-card-content>
                  <div class="sharing-header">
                    <h2>Sharing Links</h2>
                    <button mat-raised-button color="primary" (click)="createShareLink()">
                      <mat-icon>add_link</mat-icon> Create New Link
                    </button>
                  </div>
                  
                  <div *ngIf="loadingShareLinks" class="loading-share-links">
                    <mat-progress-bar mode="indeterminate"></mat-progress-bar>
                    <p>Loading share links...</p>
                  </div>
                  
                  <div *ngIf="!loadingShareLinks && shareLinks.length === 0" class="no-share-links">
                    <p>No sharing links have been created for this document.</p>
                    <button mat-stroked-button color="primary" (click)="createShareLink()">
                      <mat-icon>add_link</mat-icon> Create New Link
                    </button>
                  </div>
                  
                  <mat-list *ngIf="!loadingShareLinks && shareLinks.length > 0">
                    <mat-list-item *ngFor="let link of shareLinks">
                      <mat-icon matListItemIcon>link</mat-icon>
                      <div matListItemTitle>
                        {{ link.accessToken.substring(0, 8) }}...
                      </div>
                      <div matListItemLine>
                        Expires: {{ link.expiresAt | date:'medium' }} •
                        <span *ngIf="link.requiresOtp">Password protected</span>
                        <span *ngIf="!link.requiresOtp">No password</span>
                      </div>
                      <div matListItemMeta>
                        <button mat-icon-button [matMenuTriggerFor]="linkMenu">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                        <mat-menu #linkMenu="matMenu">
                          <button mat-menu-item (click)="copyShareLink(link)">
                            <mat-icon>content_copy</mat-icon>
                            <span>Copy Link</span>
                          </button>
                          <button mat-menu-item (click)="deactivateShareLink(link)">
                            <mat-icon>link_off</mat-icon>
                            <span>Deactivate Link</span>
                          </button>
                        </mat-menu>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    .error-card {
      text-align: center;
      padding: 40px;
    }
    .error-card mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }
    .document-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }
    .document-icon-container {
      margin-right: 20px;
    }
    .document-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }
    .document-title {
      margin: 0 0 8px;
      font-size: 24px;
    }
    .document-metadata {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      color: #757575;
      font-size: 14px;
    }
    .metadata-item {
      margin-right: 8px;
    }
    .separator {
      margin: 0 4px;
    }
    .tab-content {
      padding: 20px 0;
    }
    .preview-loading {
      padding: 20px;
      text-align: center;
    }
    .preview-container {
      padding: 16px;
    }
    .pdf-preview, .image-preview, .text-preview, .video-preview, .audio-preview {
      display: flex;
      justify-content: center;
      margin: 0 auto;
      max-width: 100%;
    }
    .image-preview img {
      max-width: 100%;
      max-height: 600px;
      object-fit: contain;
    }
    .text-preview {
      width: 100%;
      max-height: 600px;
      overflow: auto;
      border: 1px solid #e0e0e0;
      padding: 16px;
      background-color: #f5f5f5;
    }
    .text-preview pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
    }
    .no-preview {
      text-align: center;
      padding: 40px;
    }
    .no-preview mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #757575;
      margin-bottom: 16px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .info-row {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 16px;
    }
    .info-label {
      font-weight: 500;
      color: #757575;
    }
    .versions-header, .permissions-header, .sharing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .loading-versions, .loading-permissions, .loading-share-links {
      padding: 20px;
      text-align: center;
    }
    .no-versions, .no-permissions, .no-share-links {
      padding: 20px;
      text-align: center;
    }
    .delete-option {
      color: #f44336;
    }
    @media (max-width: 768px) {
      .info-row {
        grid-template-columns: 1fr;
        gap: 4px;
      }
      .document-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .document-icon-container {
        margin-bottom: 16px;
      }
    }
  `]
})
export class DocumentDetailComponent implements OnInit {
  document: Document | null = null;
  loading = true;
  error: string | null = null;
  isLoading = true;
  previewUrl: SafeResourceUrl | SafeUrl | null = null;
  textContent: string | null = null;
  canPreview = false;
  isPdf = false;
  isImage = false;
  isText = false;
  isVideo = false;
  isAudio = false;
  
  // Permissions flags
  canEdit = false;
  canDelete = false;
  canShare = false;
  
  // Versions
  versions: DocumentVersion[] = [];
  currentVersionNumber = 1;
  loadingVersions = false;
  
  // Permissions and sharing
  permissions: any[] = []; // Will replace with proper interface
  loadingPermissions = false;
  shareLinks: any[] = []; // Will replace with proper interface
  loadingShareLinks = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    // Check user permissions
    this.authService.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.canEdit = this.authService.hasRole('ADMIN') || this.authService.hasRole('EDITOR');
        this.canDelete = this.authService.hasRole('ADMIN') || this.authService.hasRole('EDITOR');
        this.canShare = this.authService.hasRole('ADMIN') || this.authService.hasRole('EDITOR');
      }
    });
    
    // Load document
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          throw new Error('Document ID is required');
        }
        return this.documentService.getDocument(id);
      }),
      tap(document => {
        this.document = document;
        this.loading = false;
        this.loadPreview();
        
        // Also load versions, permissions, and share links
        this.loadVersions();
        if (this.canShare) {
          this.loadPermissions();
          this.loadShareLinks();
        }
      }),
      catchError(error => {
        console.error('Error loading document:', error);
        this.error = 'Failed to load document. The document may have been deleted or you might not have permission to view it.';
        this.loading = false;
        return of(null);
      })
    ).subscribe();
  }
  
  goBack(): void {
    // Navigate back to documents page (with folder ID if applicable)
    if (this.document?.folderId) {
      this.router.navigate(['/documents'], { queryParams: { folderId: this.document.folderId } });
    } else {
      this.router.navigate(['/documents']);
    }
  }
  
  loadPreview(): void {
    if (!this.document) return;
    
    this.isLoading = true;
    
    // Check document type for preview
    const contentType = this.document.contentType || '';
    
    // Determine document type
    this.isPdf = contentType.includes('pdf');
    this.isImage = contentType.includes('image');
    this.isText = contentType.includes('text') || contentType.includes('json') || 
                  contentType.includes('xml') || contentType.includes('csv');
    this.isVideo = contentType.includes('video');
    this.isAudio = contentType.includes('audio');
    
    this.canPreview = this.isPdf || this.isImage || this.isText || this.isVideo || this.isAudio;
    
    if (this.canPreview) {
      // In a real implementation, we would fetch the document content
      // and create a blob URL or handle text content appropriately
      if (this.isText) {
        // For text documents, we would fetch the content as text
        this.documentService.downloadDocument(this.document.id).subscribe({
          next: (blob: Blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.textContent = reader.result as string;
              this.isLoading = false;
            };
            reader.readAsText(blob);
          },
          error: (error) => {
            console.error('Error loading text preview:', error);
            this.canPreview = false;
            this.isLoading = false;
          }
        });
      } else {
        // For other supported types, create a blob URL
        this.documentService.downloadDocument(this.document.id).subscribe({
          next: (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading preview:', error);
            this.canPreview = false;
            this.isLoading = false;
          }
        });
      }
    } else {
      this.isLoading = false;
    }
  }
  
  downloadDocument(): void {
    if (!this.document) return;
    
    this.documentService.downloadDocument(this.document.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.document?.name || 'document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        alert('Failed to download document. Please try again.');
      }
    });
  }
  
  // Placeholder methods for version handling
  loadVersions(): void {
    // This would fetch versions from the API
    this.loadingVersions = true;
    setTimeout(() => {
      // Simulated data - in real implementation this would be API data
      this.versions = [];
      this.loadingVersions = false;
    }, 1000);
  }
  
  downloadVersion(version: DocumentVersion): void {
    console.log('Download version:', version);
    alert('Version download functionality will be implemented here');
  }
  
  restoreVersion(version: DocumentVersion): void {
    console.log('Restore version:', version);
    alert('Version restore functionality will be implemented here');
  }
  
  uploadNewVersion(): void {
    console.log('Upload new version');
    alert('New version upload functionality will be implemented here');
  }
  
  // Placeholder methods for permission handling
  loadPermissions(): void {
    this.loadingPermissions = true;
    setTimeout(() => {
      this.permissions = [];
      this.loadingPermissions = false;
    }, 1000);
  }
  
  addUserPermission(): void {
    console.log('Add user permission');
    alert('Add user permission functionality will be implemented here');
  }
  
  editPermission(permission: any): void {
    console.log('Edit permission:', permission);
    alert('Edit permission functionality will be implemented here');
  }
  
  removePermission(permission: any): void {
    console.log('Remove permission:', permission);
    alert('Remove permission functionality will be implemented here');
  }
  
  // Placeholder methods for sharing
  loadShareLinks(): void {
    this.loadingShareLinks = true;
    setTimeout(() => {
      this.shareLinks = [];
      this.loadingShareLinks = false;
    }, 1000);
  }
  
  createShareLink(): void {
    console.log('Create share link');
    alert('Create share link functionality will be implemented here');
  }
  
  copyShareLink(link: any): void {
    console.log('Copy share link:', link);
    alert('Copy share link functionality will be implemented here');
  }
  
  deactivateShareLink(link: any): void {
    console.log('Deactivate share link:', link);
    alert('Deactivate share link functionality will be implemented here');
  }
  
  // Document operations
  renameDocument(): void {
    console.log('Rename document');
    alert('Rename document functionality will be implemented here');
  }
  
  moveDocument(): void {
    console.log('Move document');
    alert('Move document functionality will be implemented here');
  }
  
  deleteDocument(): void {
    if (!this.document) return;
    
    if (confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      this.documentService.deleteDocument(this.document.id).subscribe({
        next: () => {
          alert('Document deleted successfully');
          this.goBack();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          alert('Failed to delete document. Please try again.');
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
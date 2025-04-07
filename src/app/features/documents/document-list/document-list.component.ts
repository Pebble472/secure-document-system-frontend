import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div style="margin: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h1 style="margin: 0;">Documents</h1>
        @if (canUpload) {
          <div>
            <button mat-raised-button color="primary" style="margin-right: 8px;" (click)="openUploadDialog()" aria-label="Upload Document">
              <mat-icon>upload</mat-icon>
              Upload Document
            </button>
            <button mat-raised-button color="accent" (click)="openCreateFolderDialog()" aria-label="Create New Folder">
              <mat-icon>create_new_folder</mat-icon>
              New Folder
            </button>
          </div>
        }
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Documents</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>This is the document list view.</p>
          <p>Document management is ready to implement.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class DocumentListComponent implements OnInit {
  canUpload = false;
  
  constructor(
    private authService: AuthService,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    // Check if user has permission to upload
    this.authService.isLoggedIn().then(loggedIn => {
      if (loggedIn) {
        this.canUpload = this.authService.hasRole('ADMIN') || this.authService.hasRole('EDITOR');
        console.log('Can upload documents:', this.canUpload);
      }
    });
  }

  openUploadDialog(): void {
    console.log('Upload dialog should open here');
    // For now, just show an alert
    alert('Upload document functionality will be implemented here');
    
    // In a real implementation, we would open a dialog:
    // this.dialog.open(UploadDocumentDialogComponent, {
    //   width: '500px',
    //   data: { /* any data to pass to the dialog */ }
    // });
  }

  openCreateFolderDialog(): void {
    console.log('Create folder dialog should open here');
    // For now, just show an alert
    alert('Create folder functionality will be implemented here');
    
    // In a real implementation, we would open a dialog:
    // this.dialog.open(CreateFolderDialogComponent, {
    //   width: '400px',
    //   data: { /* any data to pass to the dialog */ }
    // });
  }
}
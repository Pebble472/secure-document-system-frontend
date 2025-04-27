// src/app/features/documents/upload-document-dialog/upload-document-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpEventType } from '@angular/common/http';
import { DocumentService } from '../../../core/services/document.service';
import { NgxFileDropModule, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

export interface UploadDialogData {
  folderId?: string;
}

@Component({
  selector: 'app-upload-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    NgxFileDropModule
  ],
  template: `
    <h2 mat-dialog-title>Upload Document</h2>
    <div mat-dialog-content>
      <form [formGroup]="uploadForm">
        <div class="file-drop-area">
          <ngx-file-drop 
            dropZoneLabel="Drop files here" 
            (onFileDrop)="dropped($event)"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
            [multiple]="false">
            <ng-template ngx-file-drop-content-tmp let-openFileSelector="openFileSelector">
              <div class="drop-zone-content">
                <p>Drag & drop your file here</p>
                <p>- or -</p>
                <button type="button" mat-raised-button color="primary" (click)="openFileSelector()">Browse Files</button>
              </div>
            </ng-template>
          </ngx-file-drop>
        </div>

        <div *ngIf="selectedFile" class="file-info">
          <p><strong>Selected file:</strong> {{ selectedFile.name }}</p>
          <p><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
          <p><strong>Type:</strong> {{ selectedFile.type || 'Unknown' }}</p>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Document Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="uploadForm.get('name')?.hasError('required')">
            Document name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>

      <div *ngIf="uploadProgress > 0" class="progress-container">
        <p>Uploading: {{ uploadProgress }}%</p>
        <mat-progress-bar mode="determinate" [value]="uploadProgress"></mat-progress-bar>
      </div>

      <div *ngIf="uploadError" class="error-message">
        {{ uploadError }}
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="!uploadForm.valid || !selectedFile || uploadInProgress" 
        (click)="upload()">
        Upload
      </button>
    </div>
  `,
  styles: [`
    .file-drop-area {
      margin-bottom: 20px;
    }
    .drop-zone-content {
      text-align: center;
      padding: 20px;
    }
    .file-info {
      margin: 16px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .progress-container {
      margin: 16px 0;
    }
    .error-message {
      color: #f44336;
      margin: 16px 0;
    }
  `]
})
export class UploadDocumentDialogComponent implements OnInit {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  uploadProgress = 0;
  uploadInProgress = false;
  uploadError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    public dialogRef: MatDialogRef<UploadDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData
  ) {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {}

  dropped(files: any): void {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        
        fileEntry.file((file: File) => {
          this.selectedFile = file;
          // Auto-fill the name field with the file name (without extension)
          const fileName = file.name.split('.').slice(0, -1).join('.');
          this.uploadForm.patchValue({
            name: fileName
          });
        });
      }
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

  upload(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploadInProgress = true;
      this.uploadError = null;
      
      // Get form values
      const formValues = this.uploadForm.value;
      
      // Process file name if user provided a custom name
      let fileToUpload = this.selectedFile;
      if (formValues.name && formValues.name.trim() !== '') {
        // If custom name is provided, create a new file with that name
        const customName = formValues.name;
        const fileExtension = this.selectedFile.name.split('.').pop() || '';
        const newFileName = fileExtension ? `${customName}.${fileExtension}` : customName;
        
        // Create a new File object with the custom name
        fileToUpload = new File(
          [this.selectedFile], 
          newFileName, 
          { type: this.selectedFile.type }
        );
      }

      // Begin upload
      this.documentService.uploadDocument(fileToUpload, this.data.folderId)
        .subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
            } else if (event.type === HttpEventType.Response) {
              // Upload complete
              this.dialogRef.close(event.body);
            }
          },
          error: (err) => {
            console.error('Upload error:', err);
            this.uploadError = 'An error occurred while uploading the document. Please try again.';
            this.uploadInProgress = false;
          },
          complete: () => {
            this.uploadInProgress = false;
          }
        });
    }
  }
}
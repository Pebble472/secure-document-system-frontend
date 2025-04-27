// src/app/features/documents/create-folder-dialog/create-folder-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentService } from '../../../core/services/document.service';

export interface CreateFolderDialogData {
  parentId?: string;
}

@Component({
  selector: 'app-create-folder-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Create New Folder</h2>
    <div mat-dialog-content>
      <form [formGroup]="folderForm">
        <mat-form-field class="full-width">
          <mat-label>Folder Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="folderForm.get('name')?.hasError('required')">
            Folder name is required
          </mat-error>
          <mat-error *ngIf="folderForm.get('name')?.hasError('pattern')">
            Folder name can only contain letters, numbers, spaces, and these characters: . _ -
          </mat-error>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Description (Optional)</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button 
        mat-raised-button 
        color="primary" 
        [disabled]="!folderForm.valid || isCreating" 
        (click)="createFolder()">
        <span *ngIf="!isCreating">Create Folder</span>
        <mat-spinner *ngIf="isCreating" diameter="20"></mat-spinner>
      </button>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .error-message {
      color: #f44336;
      margin: 16px 0;
    }
    mat-spinner {
      display: inline-block;
      margin-left: 8px;
    }
  `]
})
export class CreateFolderDialogComponent implements OnInit {
  folderForm: FormGroup;
  isCreating = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    public dialogRef: MatDialogRef<CreateFolderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateFolderDialogData
  ) {
    this.folderForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9\s\._-]+$/)
      ]],
      description: ['']
    });
  }

  ngOnInit(): void {}

  createFolder(): void {
    if (this.folderForm.valid) {
      this.isCreating = true;
      this.error = null;
      
      const folder = {
        ...this.folderForm.value,
        parentId: this.data.parentId || null
      };
      
      this.documentService.createFolder(folder).subscribe({
        next: (createdFolder) => {
          this.dialogRef.close(createdFolder);
        },
        error: (err) => {
          console.error('Error creating folder:', err);
          this.error = 'An error occurred while creating the folder. Please try again.';
          this.isCreating = false;
        }
      });
    }
  }
}
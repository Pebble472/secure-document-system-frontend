import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Documents</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>This is the document list view.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class DocumentListComponent {}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-recent',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Recent Documents</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Your recently accessed documents will appear here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RecentComponent {}
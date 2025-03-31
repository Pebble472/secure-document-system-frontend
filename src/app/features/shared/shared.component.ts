import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-shared',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Shared with me</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Documents shared with you will appear here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class SharedComponent {}
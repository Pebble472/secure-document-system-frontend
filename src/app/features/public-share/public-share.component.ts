import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-public-share',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Shared Document</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>This is a publicly shared document view.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PublicShareComponent {}
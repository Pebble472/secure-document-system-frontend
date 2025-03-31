import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Dashboard</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Welcome to the Secure Document System dashboard!</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class DashboardComponent {}
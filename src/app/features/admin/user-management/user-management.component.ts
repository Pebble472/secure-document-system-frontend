// src/app/features/admin/user-management/user-management.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <h1>User Management</h1>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Users</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>User management functionality will be implemented here.</p>
          <p>This page should only be accessible to administrators.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class UserManagementComponent {}
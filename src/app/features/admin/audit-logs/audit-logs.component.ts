// src/app/features/admin/audit-logs/audit-logs.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div style="margin: 20px;">
      <h1>Audit Logs</h1>
      <mat-card>
        <mat-card-header>
          <mat-card-title>System Activity</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Audit log functionality will be implemented here.</p>
          <p>This page should only be accessible to administrators.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AuditLogsComponent {}
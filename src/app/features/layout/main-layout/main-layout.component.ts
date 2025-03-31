// src/app/features/layout/main-layout/main-layout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

// Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div style="display: flex; flex-direction: column; position: absolute; top: 0; bottom: 0; left: 0; right: 0;">
      <mat-toolbar color="primary">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span style="margin-left: 10px;">Secure Document System</span>
        <span style="flex: 1 1 auto;"></span>
        <span style="margin-right: 10px; font-size: 14px;">{{ username }}</span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container style="flex: 1; margin-top: 64px;">
        <mat-sidenav #sidenav mode="side" opened style="width: 250px; padding-top: 10px;">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span style="margin-left: 10px;">Dashboard</span>
            </a>
            <a mat-list-item routerLink="/documents" routerLinkActive="active">
              <mat-icon>folder</mat-icon>
              <span style="margin-left: 10px;">Documents</span>
            </a>
            <a mat-list-item routerLink="/shared" routerLinkActive="active">
              <mat-icon>share</mat-icon>
              <span style="margin-left: 10px;">Shared with me</span>
            </a>
            <a mat-list-item routerLink="/recent" routerLinkActive="active">
              <mat-icon>history</mat-icon>
              <span style="margin-left: 10px;">Recent</span>
            </a>
            <mat-divider></mat-divider>
            @if (isAdmin) {
              <a mat-list-item routerLink="/admin/users" routerLinkActive="active">
                <mat-icon>people</mat-icon>
                <span style="margin-left: 10px;">User Management</span>
              </a>
              <a mat-list-item routerLink="/admin/audit" routerLinkActive="active">
                <mat-icon>security</mat-icon>
                <span style="margin-left: 10px;">Audit Logs</span>
              </a>
            }
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content style="padding: 20px;">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .active {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  username: string = '';
  isAdmin = false;
  isEditor = false;

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.isEditor = this.authService.hasRole('EDITOR');
  }

  logout(): void {
    this.authService.logout();
  }
}
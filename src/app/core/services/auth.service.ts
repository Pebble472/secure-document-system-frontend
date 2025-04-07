// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Observable, from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfile: KeycloakProfile | null = null;

  constructor(private keycloak: KeycloakService) {
    // Load user profile when service is initialized
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.keycloak.loadUserProfile()
      .then(profile => {
        console.log('User profile loaded:', profile);
        this.userProfile = profile;
      })
      .catch(error => {
        console.error('Failed to load user profile:', error);
      });
  }

  public getUser(): Observable<KeycloakProfile | null> {
    if (this.userProfile) {
      return of(this.userProfile);
    }
    
    return from(this.keycloak.loadUserProfile()).pipe(
      tap(profile => this.userProfile = profile),
      catchError(error => {
        console.error('Error loading user profile:', error);
        return of(null);
      })
    );
  }

  public async isLoggedIn(): Promise<boolean> {
    return await this.keycloak.isLoggedIn();
  }

  public hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  public logout(): void {
    this.keycloak.logout();
  }

  public getUsername(): string {
    if (!this.userProfile || !this.userProfile.username) {
      // Return a default value or throw a more informative error
      console.warn('Username not available, user may not be fully authenticated yet');
      return 'Guest';
    }
    return this.userProfile.username;
  }

  public getToken(): Promise<string> {
    return this.keycloak.getToken();
  }
}
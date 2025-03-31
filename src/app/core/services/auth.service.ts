import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

  public getUser(): Observable<KeycloakProfile> {
    return from(this.keycloak.loadUserProfile());
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
    return this.keycloak.getUsername();
  }

  public getToken(): Promise<string> {
    return this.keycloak.getToken();
  }
}
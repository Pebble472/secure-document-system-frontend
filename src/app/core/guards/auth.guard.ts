import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const AuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const keycloak = inject(KeycloakService);

  if (!await keycloak.isLoggedIn()) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  // Get the roles required from the route
  const requiredRoles = route.data['roles'];

  // Allow the user to proceed if no additional roles are required to access the route
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Get user roles
  const userRoles = keycloak.getUserRoles();
  
  // Allow the user to proceed if all the required roles are present
  const hasRequiredRoles = requiredRoles.every((role: string) => userRoles.includes(role));
  
  if (!hasRequiredRoles) {
    router.navigate(['']);
    return false;
  }

  return true;
};
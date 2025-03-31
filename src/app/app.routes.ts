import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './features/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'documents',
        loadChildren: () => import('./features/documents/documents.module').then(m => m.DocumentsModule)
      },
      {
        path: 'shared',
        loadChildren: () => import('./features/shared/shared.module').then(m => m.SharedModule)
      },
      {
        path: 'recent',
        loadChildren: () => import('./features/recent/recent.module').then(m => m.RecentModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  {
    path: 'share',
    loadChildren: () => import('./features/public-share/public-share.module').then(m => m.PublicShareModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
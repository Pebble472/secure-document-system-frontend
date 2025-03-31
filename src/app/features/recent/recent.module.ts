import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecentComponent } from './recent.component';

const routes: Routes = [
  {
    path: '',
    component: RecentComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class RecentModule { }
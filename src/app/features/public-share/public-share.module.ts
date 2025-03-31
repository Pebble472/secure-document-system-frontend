import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicShareComponent } from './public-share.component';

const routes: Routes = [
  {
    path: '',
    component: PublicShareComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class PublicShareModule { }
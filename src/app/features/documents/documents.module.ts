// src/app/features/documents/documents.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentDetailComponent } from './document-detail/document-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentListComponent
  },
  {
    path: 'view/:id',
    component: DocumentDetailComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class DocumentsModule { }
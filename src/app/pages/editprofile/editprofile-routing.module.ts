import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditprofilePage } from './editprofile';

const routes: Routes = [
  {
    path: '',
    component: EditprofilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditprofilePageRoutingModule { }

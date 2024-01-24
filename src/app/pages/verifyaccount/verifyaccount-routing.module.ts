import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { VerifyaccountPage } from './verifyaccount';

const routes: Routes = [
  {
    path: '',
    component: VerifyaccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerifyaccountPageRoutingModule { }

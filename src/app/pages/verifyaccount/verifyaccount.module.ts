import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { VerifyaccountPage } from './verifyaccount';
import { VerifyaccountPageRoutingModule } from './verifyaccount-routing.module';
import { ComponentsModule } from '../../components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    VerifyaccountPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    VerifyaccountPage,
  ]
})
export class VerifyaccountModule { }

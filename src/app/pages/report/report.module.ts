import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ReportPage } from './report';
import { ReportPageRoutingModule } from './report-routing.module';
import { ComponentsModule } from '../../components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ReportPage,
  ]
})
export class ReportModule { }

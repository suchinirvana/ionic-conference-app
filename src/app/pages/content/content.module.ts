import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ContentPage } from './content';
import { ContentPageRoutingModule } from './content-routing.module';
import { ComponentsModule } from '../../components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContentPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ContentPage,
  ]
})
export class ContentModule { }

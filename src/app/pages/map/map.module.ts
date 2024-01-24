import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { MapPage } from './map';
import { MapPageRoutingModule } from './map-routing.module';
import { ComponentsModule } from '../../components.module';
import { MyModalPageModule } from '../../modals/my-modal/my-modal.module';
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    MapPageRoutingModule,
    ComponentsModule,
    MyModalPageModule
  ],
  declarations: [
    MapPage,
  ]
})
export class MapModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ListingPage } from './listing';
import { ListingPageRoutingModule } from './listing-routing.module';
import { ComponentsModule } from '../../components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListingPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    ListingPage,
  ]
})
export class ListingModule { }

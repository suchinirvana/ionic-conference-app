import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SettingPage } from './setting';
import { SettingPageRoutingModule } from './setting-routing.module';
import { ComponentsModule } from '../../components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    SettingPageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    SettingPage,
  ]
})
export class SettingModule { }

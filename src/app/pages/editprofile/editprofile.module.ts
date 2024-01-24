import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { EditprofilePage } from './editprofile';
import { EditprofilePageRoutingModule } from './editprofile-routing.module';
import { ComponentsModule } from '../../components.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    EditprofilePageRoutingModule,
    ComponentsModule
  ],
  declarations: [
    EditprofilePage,
  ]
})
export class EditprofileModule { }

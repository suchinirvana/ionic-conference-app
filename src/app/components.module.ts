import { NgModule } from '@angular/core';
import { HeaderPage } from './pages/header/header';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [HeaderPage],
  exports: [HeaderPage],
  imports: [IonicModule,CommonModule],
})
export class ComponentsModule {}

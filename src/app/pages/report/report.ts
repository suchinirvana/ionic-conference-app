import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
  styleUrls: ['./report.scss'],
})
export class ReportPage {
  message : string = null;
  categories : any = [];
  series : any = [];
  queryText = "";
  arr = [1,2,3,4,5]; 

  constructor(
    public userData: UserData,
    private storage: Storage,
    public router: Router,
    public jwtHelper: JwtHelperService,
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    this.getData();
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.message,
      duration: 2000
    });
    toast.present();
  }

  getData(){
    this.storage.get('safealley_token').then((token) => {
      if(token){
          if (this.jwtHelper.isTokenExpired(token)) {
            this.message = 'You must be logged in to access this content';
            this.presentToast();
            this.router.navigateByUrl('/app/tabs/login/');
          }else{
            const decoded = this.jwtHelper.decodeToken(token);
            fetch('https://www.mysafealley.com/api/listings/?user_id='+decoded.data.user_id, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
              }
            })
            .then(res => res.json())
            .then((res) => {
              this.series = res.data;
            });
          }
      }else{
          this.message = 'You must be logged in to view details';
          this.presentToast();
          this.router.navigateByUrl('/app/tabs/login/');
      }
    });
  }

  buttonClick(e){
    var id = e.target.dataset.id;
    this.storage.get('safealley_token').then((token) => {
      if(token){
          if (this.jwtHelper.isTokenExpired(token)) {
            this.message = 'You must be logged in to view details';
            this.presentToast();
          }else{
            this.router.navigateByUrl('/app/tabs/listing/'+id);
          }
      }else{
          this.message = 'You must be logged in to view details';
          this.presentToast();
      }
    });
  }

  deleteListing(e){
    var id = e.target.dataset.id;
    fetch('https://www.mysafealley.com/api/listings/dellist/id/'+id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res => res.json())
      .then((res) => {
        this.message = 'Successfully Deleted';
        this.presentToast();
        this.getData();
      });
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}

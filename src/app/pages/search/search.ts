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
  selector: 'page-search',
  templateUrl: 'search.html',
  styleUrls: ['./search.scss'],
})
export class SearchPage {
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
    
  }

  ionViewWillEnter() {
    this.queryText = "";
    this.series = [];
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.message,
      duration: 2000
    });
    toast.present();
  }

  getData(){
      fetch('https://www.mysafealley.com/api/search/result/?keyword='+this.queryText, {
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

  testClick(e){
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

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}

import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';
import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
  styleUrls: ['./setting.scss'],
})


export class SettingPage implements AfterViewInit {
  username: string;
  email: string;
  phone: string;
  plan_selected: string;
  end_date: string;
  start_date: string;
  message : string = null;
  isLoggedIn : boolean;
  is_subscribed : 0;
  categories: [];
  imgs : '';
  user_id = '';
  setting = { is_subscribed : 1, selectedArray : [] }
  selectedArray : any = [];
  
  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public userData: UserData,
    private storage: Storage,
    public jwtHelper: JwtHelperService,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController
  ) { }

  ngAfterViewInit() {
    this.getUsername();
    //this.getData();
    this.userData.isLoggedIn().then(loggedIn => {
      if(!loggedIn){
        
        this.router.navigateByUrl('/app/tabs/login');
      }else{
        this.isLoggedIn = loggedIn;
        this.userData.setUsername(this.username);
      }
    });
  }

  ionViewDidEnter() {
  //alert('sd')
    this.userData.isLoggedIn().then(loggedIn => {
      if(!loggedIn){
        this.router.navigateByUrl('/app/tabs/login');
      }else{
        this.isLoggedIn = loggedIn;
        this.userData.setUsername(this.username);
      }
    });
  }

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

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'New Device Detected',
      subHeader: '',
      message: this.message,
      buttons: ['Okay']
    });

    await alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Loading...',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
  }

  async dismissLoader() {
      await this.loadingController.dismiss()
      .then(()=>{
        
      })
      .catch(e => console.log(e));
  }

  getData(){
      this.presentLoading();

      const ret = this.storage.get('safealley_token');
      this.storage.get('safealley_token').then((token) => {
        if(token){
            if (this.jwtHelper.isTokenExpired(token)) {
              this.message = 'Unauthorized: Please login again';
              this.presentToast();
            }else{
              const decoded = this.jwtHelper.decodeToken(token);
              this.user_id = decoded.data.user_id;
              fetch('https://www.mysafealley.com/api/users/categories/user_id/'+decoded.data.user_id, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
                  }
                })
                .then(res => res.json())
                .then(res => {
                      var arr = res.data;
                      this.categories = res.data;
                      for(var i=0; i<arr.length; i++){
                        if(arr[i].isChecked==true){
                          this.selectedArray.push(arr[i]);
                        }

                      }
                    }
                );


              fetch('https://www.mysafealley.com/api/users/?email_address='+decoded.data.email, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
                }
              })
              .then(res => res.json())
              .then(res => {
                    this.username = res.data[0].user_name;
                    this.email = res.data[0].email_address;
                    this.phone = res.data[0].contact_number;
                    this.imgs = res.data[0].user_image_url;
                    this.is_subscribed = res.data[0].is_subscribed;
                    this.setting.is_subscribed = res.data[0].is_subscribed;
                    this.setting.selectedArray = res.data[0].subscribed_categories.split(",");
                    this.userData.setUsername(res.data[0].user_name);
                    this.dismissLoader();
                  }
              );
            }
        }else{
          //this.props.history.push('/');
          this.message = 'Unauthorized: Please login';
          this.presentToast();
          this.router.navigateByUrl('/app/tabs/login');
        }
      });
  }
  radioGroupChange(e){
    this.setting.is_subscribed = e.detail.value;
    //for(let i =0; i <= this.categories.length; i++) {
      //this.categories[i].isChecked = false;
    //}
  }

  selectMember(data, e){
//console.log(e.target);
    this.setting.is_subscribed = 2;
    if (data.isChecked == true) {
      this.selectedArray.push(data);
    } else {
     let newArray = this.selectedArray.filter(function(el) {
       return el.id !== data.id;
    });
     this.selectedArray = newArray;

     
   }
//console.log(this.selectedArray)
  }

  onUpdateProfile(form: NgForm){
    const formData = { is_subscribed : 0, subscribed_categories : [], user_id : ''};
      formData.is_subscribed = this.setting.is_subscribed;
      formData.subscribed_categories = this.selectedArray;
      formData.user_id = this.user_id;
      //console.log(formData);
      //return;
      fetch('https://www.mysafealley.com/api/users/settings', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.dismissLoader();
        if(res.status==="success") {
          this.message = res.message;
          this.presentToast();
        } else {
            throw res.message;
        }
      })
      .catch(err => {
          this.message = err;
          this.presentToast();
      });
  }

  updatePicture() {
    //console.log('Clicked to update picture');
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  async changeUsername() {
    const alert = await this.alertCtrl.create({
      header: 'Change Username',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            this.userData.setUsername(data.username);
            this.getUsername();
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'username',
          value: this.username,
          placeholder: 'username'
        }
      ]
    });
    await alert.present();
  }

  getUsername() {
    this.userData.getUsername().then((username) => {
      this.username = username;
    });
  }
}

import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;


@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
  styleUrls: ['./signup.scss'],
})
export class SignupPage implements OnInit {
  
   @ViewChild('map',  {static: false}) mapElement: ElementRef;
   map: any;
  address:string;
  lat: string;
  long: string;  
  autocomplete: any = { input: '' };
  autocompleteItems: any[];
  location: any;
  placeid: any;
  GoogleAutocomplete: any;
  infowindow: any;

  signup: UserOptions = { username: '', first_name: '', last_name : '', email_address : '', contact_number : '', password: '', city : '', country : '' };
  submitted = false;
  passwordShown : boolean = false;
  message : string = null;
  selectedCountry = 'CA';
  phone_code = '+1';

  constructor(
    public router: Router,
    public userData: UserData,
    private storage: Storage,
    public toastController: ToastController,
    public alertController: AlertController,
    public loadingController: LoadingController,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,    
    public zone: NgZone,
  ) {
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = { input: '' };
    this.autocompleteItems = [];

  }

  //LOAD THE MAP ONINIT.
  ngOnInit() {
    this.loadMap();    
  }

  doRefresh(event) {
    setTimeout(() => {
      this.loadMap();
      event.target.complete();
    }, 2000);
  }

  async ionViewWillEnter() {
    await this.storage.get('safealley_country').then((country) => {
        this.selectedCountry = country;
    });
    this.loadMap();
    this.signup = {username:'',first_name:'',last_name :'',email_address : '',contact_number : '',password: '',city : '',country : '' };
  }
  loadMap() {
      this.storage.get('safealley_country').then((country) => {
          //console.log(country);
          if(country){
              fetch('https://www.mysafealley.com/api/users/countryPhone?country='+country, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
                }
              })
              .then(res => res.json())
              .then(res => {
                    //console.log(res);
                    if(res.status=="success"){
                      this.phone_code = '+'+res.data.phonecode;
                    }else{
                      this.phone_code = '+1';
                    }
                  }
              );
          }

      });

      const input = document.getElementById("pac-input");
      var options = {
        types: ['(cities)'],
      };
      const autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.setComponentRestrictions({
          country : [this.selectedCountry]
      })
      autocomplete.addListener("place_changed", () => {
        var vals=""
        var componentForm = { locality: 'long_name', country: 'short_name' };
        const place = autocomplete.getPlace();
        for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
          if (componentForm[addressType] && addressType=="locality") {
            var val = place.address_components[i][componentForm[addressType]];
            this.signup.city = val;
          }
          if (componentForm[addressType] && addressType=="country") {
            var val = place.address_components[i][componentForm[addressType]];
            this.signup.country = val;
          }
        }

      });
  }

  
  getAddressFromCoords(lattitude, longitude) {
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5    
    }; 
    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if(value.length>0)
          responseAddress.push(value); 
        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value+", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) =>{ 
        this.address = "Address Not Available!";
      }); 
  }

  //FUNCTION SHOWING THE COORDINATES OF THE POINT AT THE CENTER OF THE MAP
  ShowCords(){
    alert('lat' +this.lat+', long'+this.long )
  }
  
  //AUTOCOMPLETE, SIMPLY LOAD THE PLACE USING GOOGLE PREDICTIONS AND RETURNING THE ARRAY.
  UpdateSearchResults(){
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
    (predictions, status) => {
      this.autocompleteItems = [];
      this.zone.run(() => {
        predictions.forEach((prediction) => {
          this.autocompleteItems.push(prediction);
        });
      });
    });
  }
  
  //wE CALL THIS FROM EACH ITEM.
  SelectSearchResult(item) {
    ///WE CAN CONFIGURE MORE COMPLEX FUNCTIONS SUCH AS UPLOAD DATA TO FIRESTORE OR LINK IT TO SOMETHING
    alert(JSON.stringify(item))      
    this.placeid = item.place_id
  }
  
  
  //lET'S BE CLEAN! THIS WILL JUST CLEAN THE LIST WHEN WE CLOSE THE SEARCH BAR.
  ClearAutocomplete(){
    this.autocompleteItems = []
    this.autocomplete.input = ''
  }
 
  //sIMPLE EXAMPLE TO OPEN AN URL WITH THE PLACEID AS PARAMETER.
  GoTo(){
    return window.location.href = 'https://www.google.com/maps/search/?api=1&query=Google&query_place_id='+this.placeid;
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
      message: this.message,
      duration: 5000
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

  togglePasswordVisiblity(){
    this.passwordShown = !this.passwordShown;
  };

  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  letterOnlyValidation(event: any) {
    const pattern = /^[a-z A-Z]+$/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  string_to_slug(str){
    str = str.replace(/^\s+|\s+$/g, ""); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to = "aaaaaaeeeeiiiioooouuuunc------";

      for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
      }

      str = str
        .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // collapse whitespace and replace by -
        .replace(/-+/g, "-") // collapse dashes
        .replace(/^-+/, "") // trim - from start of text
        .replace(/-+$/, ""); // trim - from end of text

      return str;
  }

  onSignup(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.message = "Processing...";
      this.presentLoading();
      const slug = this.string_to_slug(this.signup.first_name+' '+this.signup.last_name);

      const sData = { 
        email_address : '', 
        contact_number : this.signup.contact_number, 
        first_name : this.signup.first_name, 
        last_name : this.signup.last_name, 
        password : this.signup.password,
        country : this.selectedCountry,
        user_role : 'User'
      }
      sData.email_address = this.signup.email_address;
      sData.password = this.signup.password;

      if(this.signup.first_name.trim()==='' || this.signup.last_name.trim()==='' || this.signup.contact_number.trim()==='' || this.signup.password==='' || this.signup.email_address===''){
        alert('All fields are required');
         this.submitted = false;
        this.dismissLoader();
        return false;
      }

      /*fetch('https://www.mysafealley.com/api/users', {
      method: 'POST',
      body: JSON.stringify(sData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
      }
    })
    .then(res=> res.json())
    .then(res => {
        this.dismissLoader();

        if(res.status=="error"){
          this.message = res.message;
          this.presentToast();
        }else{
          this.message = "Processing...";
          this.presentLoading();
          this.router.navigateByUrl('/app/tabs/verify-account/'+res.data.id);
          this.message = res.message;
          this.presentToast();
        }
      })*/

      //this.userData.signup(this.signup.first_name);
      //this.router.navigateByUrl('/app/tabs/map');
    }
  }
}

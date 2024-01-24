import { Component, ElementRef, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Platform } from '@ionic/angular';
import { DOCUMENT} from '@angular/common';
import { Storage } from '@ionic/storage';
import { UserData } from '../../providers/user-data';
import { JwtHelperService } from '@auth0/angular-jwt';
import { darkStyle } from './map-dark-style';
import { ModalController } from '@ionic/angular';
import { MyModalPage } from '../../modals/my-modal/my-modal.page';
import { InAppBrowser , InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.scss']
})
export class MapPage implements AfterViewInit {
  @ViewChild('mapCanvas', { static: true }) mapElement: ElementRef;
  listingData : [];
  selectedCountry = 'CA';
  countries : [];
  isLoggedIn : boolean = false;
  map : any;
  user_id : '';
  message = '';
  markersArray = [];
  image = {
      url: 'https://www.mysafealley.com/assets/front/images/fav/favicon-32x32.png',
    };
  place_address = '';
  city = '';
  state = '';
  country = '';
  lat = '43.6507448';
  lng = '-79.34878719999999';
  dataReturned : any;
  options : InAppBrowserOptions = {
    location : 'no',//Or 'no' 
    hidden : 'no', //Or  'yes'
    clearcache : 'yes',
    clearsessioncache : 'yes',
    zoom : 'no',//Android only ,shows browser zoom controls 
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only 
    closebuttoncaption : 'Cancel', //iOS only
    disallowoverscroll : 'no', //iOS only 
    toolbar : 'no', //iOS only 
    enableViewportScale : 'no', //iOS only 
    allowInlineMediaPlayback : 'no',//iOS only 
    presentationstyle : 'pagesheet',//iOS only 
    fullscreen : 'yes',//Windows only    
};

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    public confData: ConferenceData,
    public platform: Platform,
    public userData: UserData,
    public jwtHelper: JwtHelperService,
    private storage: Storage,
    public modalController: ModalController,
    private theInAppBrowser: InAppBrowser,
    public toastController: ToastController,
    public loadingController: LoadingController
    ) {}

    ngAfterViewInit() {
        this.getData();
    }

    doRefresh(event) {
      setTimeout(() => {
        this.getMap();
        event.target.complete();
      }, 2000);
    }

    async presentToast() {
      const toast = await this.toastController.create({
        message: this.message,
        duration: 2000
      });
      toast.present();
    }

    async presentLoading() {
      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: this.message,
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

    public openWithSystemBrowser(url : string){
        let target = "_system";
        this.theInAppBrowser.create(url,target,this.options);
    }
    public openWithInAppBrowser(url : string){
        let target = "_blank";
        const browser = this.theInAppBrowser.create(url,target,this.options);
        browser.on('loadstop').subscribe(event => {
           if(event.url && event.url === 'http://www.sampleurl.com/sample.htm#close') {
              browser.close(); 
              this.getMap();
            }
          
        });
    }
    public openWithCordovaBrowser(url : string){
        let target = "_self";
        this.theInAppBrowser.create(url,target,this.options);
    }

    async openModal() {
      const modal = await this.modalController.create({
        component: MyModalPage,
        componentProps: {
          "latitude": this.lat,
          "longitude": this.lng,
          "city": this.city,
          "state": this.state,
          "country": this.country,
          "place_address": this.place_address
        }
      });

      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned !== null) {
          this.dataReturned = dataReturned.data;
          //alert('Modal Sent Data :'+ dataReturned);
        }
      });

      return await modal.present();
    }

    getData(){
      fetch('https://www.mysafealley.com/api/resources/?type=country', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        this.countries = res.data.country;
      })
      .catch(err => {
          
      });
    }

    onChange(e){
      this.storage.set('safealley_country', e.target.value);
      this.selectedCountry = e.target.value;
      fetch('https://www.mysafealley.com/api/listings/latLngVal/?country='+e.target.value, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
          this.lat = res.data.latitude;
          this.lng = res.data.longitude;
          this.getMap();
      });
      
    }

    async getMap(){
      this.message = "Loading..."
      this.presentLoading();
      await this.storage.get('safealley_token').then((token) => {
      if(token){
          if (this.jwtHelper.isTokenExpired(token)) {
            this.isLoggedIn = false;
          }else{
            this.isLoggedIn = true;
          }
      }else{
        this.isLoggedIn = false;
      }
    });

    await this.storage.get('safealley_country').then((country) => {
        this.selectedCountry = country;
    });
    
    const appEl = this.doc.querySelector('ion-app');
    let isDark = false;
    let style = [];
    if (appEl.classList.contains('dark-theme')) {
      style = darkStyle;
    }

    const googleMaps = await getGoogleMaps(
      'AIzaSyBdl4FuMlu0lP6ShVcx2oohI3vermG0d40'
    );

    let map = this.map;

    const input = document.getElementById("pac-input");
    var options = {
      //types: ['(cities)'],
    };
    const autocomplete = new googleMaps.places.Autocomplete(input, options);
    autocomplete.setComponentRestrictions({
        country : [this.selectedCountry]
    })
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry.viewport) {
        this.getDbLocations(place.geometry.location.lat(), place.geometry.location.lng());
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        //map.setZoom(17); // Why 17? Because it looks good.
      }
    });
      var pyrmont = new googleMaps.LatLng(this.lat, this.lng);
      const mapEle = this.mapElement.nativeElement;
      map = new googleMaps.Map(mapEle, {
        zoom: 5,
        center: pyrmont,
        styles: style
      });
      this.getDbLocations(this.lat,this.lng);
      googleMaps.event.addListenerOnce(map, 'idle', () => {
        mapEle.classList.add('show-map');
      });

      googleMaps.event.addListener(map, 'click', (e) => {
      });

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const el = mutation.target as HTMLElement;
          isDark = el.classList.contains('dark-theme');
          if (map && isDark) {
            map.setOptions({styles: darkStyle});
          } else if (map) {
            map.setOptions({styles: []});
          }
        }
      });
    });
    observer.observe(appEl, {
      attributes: true
    });
    }

  ionViewWillEnter() {
    this.getMap();
  }

  async getDbLocations(lat, long){
    const mapEle = this.mapElement.nativeElement;
    const appEl = this.doc.querySelector('ion-app');
    let isDark = false;
    let style = [];
    if (appEl.classList.contains('dark-theme')) {
      style = darkStyle;
    }

    const googleMaps = await getGoogleMaps(
      'AIzaSyBdl4FuMlu0lP6ShVcx2oohI3vermG0d40'
    );

    let map = this.map;
    map = new googleMaps.Map(mapEle, {
        zoom: 5,
        styles: style
      });
    var myLatlng = new googleMaps.LatLng(lat, long);
    map.setCenter(myLatlng);
    this.map = map;

    //googleMaps.event.addListener(map, 'dragend', (e) => {
       //console.log('map dragged',e); 
    //});

    googleMaps.event.addListener(map, 'click', (e) => {
        const that = this;

        this.storage.get('safealley_token').then((token) => {
            if(token){
                if (this.jwtHelper.isTokenExpired(token)) {
                  //alert('Login to report an activity');
                  that.message = "Login to report an activity";
                  that.presentToast();
                  return false;
                }else{
                  const decoded = this.jwtHelper.decodeToken(token);
                  this.user_id = decoded.data.user_id;
                  let marker = new googleMaps.Marker({
                    map: map,
                    position: e.latLng,
                    draggable: true,
                    icon: this.image
                  });

                  var geocoder = new googleMaps.Geocoder;
                  var latitude=marker.getPosition().lat();               
                  var longitude=marker.getPosition().lng();

                  var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
                  var placeId = '';
                  geocoder.geocode({'location': latlng}, function(results, status) {
                      if (status === googleMaps.GeocoderStatus.OK) {
                          if (results[1]) {
                              placeId = results[1].place_id;

                              const request = {
                                placeId: results[1].place_id,
                                fields: ["name", "formatted_address", "place_id", "geometry","address_components"]
                              };

                              const service = new googleMaps.places.PlacesService(map);
                              service.getDetails(request, (place, status) => {
                                  if (status === googleMaps.places.PlacesServiceStatus.OK) {
                                    that.place_address = place.formatted_address;
                                    var c = 0;
                                    for (var i=0; i<place.address_components.length; i++){
                                      if (place.address_components[i].types[0] == "locality") {
                                          //this is the object you are looking for City
                                          var city = place.address_components[i];
                                          that.city = city.long_name;
                                          c = 1;
                                  
                                      }
                                      if(c==0){
                                          if (place.address_components[i].types[0] == "administrative_area_level_2") {
                                                var city = place.address_components[i];
                                                c = 1;
                                          }
                                      }
                                      if (place.address_components[i].types[0] == "administrative_area_level_1") {
                                          var region = place.address_components[i];
                                          that.state = region.long_name;
                                      }
                                      if (place.address_components[i].types[0] == "country") {
                                          var country = place.address_components[i];
                                          that.country = country.short_name;
                                      }
                                    }

                                    that.lat = latitude;
                                    that.lng = longitude;
                                    //that.openModal();
                                    that.openWithInAppBrowser('https://www.mysafealley.com/listing/appListing/?lat='+latitude+'&lng='+longitude+'&country='+that.country+'&state='+that.state+'&city='+that.city+'&place_address='+that.place_address+'&user_id='+that.user_id);
                                  }
                              });
                          }
                      }
                  }); 
                  this.markersArray.push(marker);
                   
                  marker.setMap(null);
                }
            }else{
                that.message = "Login to report an activity";
                that.presentToast();
                return false;
            }
        });


        
    });

    var url = "https://www.mysafealley.com/api/listings/?country="+this.selectedCountry;
    if(lat && long){
      url = 'https://www.mysafealley.com/api/listings?latitude='+lat+'&longitude='+long
    }

    fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic '+btoa('admin' + ":" + '1234')
        }
      })
      .then(res=> res.json())
      .then(res => {
        var d = res.data;
        d.forEach((markerData: any) => {
          var img = "";
          if(markerData.img.length){
            img = "https://www.mysafealley.com/uploads/locations/"+markerData.img.file_name;
          }
          if(markerData.user.length){
            img = "https://www.mysafealley.com/uploads/locations/"+markerData.user.user_image_url;
          }

          if(img==''){
            img = "https://www.mysafealley.com/assets/front/images/placeholder.png";
          }

          var anc = '';
          if(this.isLoggedIn){
            anc = '/app/tabs/listing/'+markerData.id;
          }else{
            anc = 'javascript:;;';
          }

          var contentString = '<div class="info"><div class="listing-row"><div class="img-box img-box2" style="float:left;width: 100px;text-align:left;"><img style="width:90px" src="'+img+'" /></div><div class="details"><h3 style="font-size: 15px;margin-bottom:7px;height:40px;overflow:hidden;"><a style="color:#000;text-decoration:none" class="tts" href="'+anc+'">'+markerData.address+'</a></h3><strong style="display: block;font-size: 14px;font-weight: 600;margin: 5px 0 0;">'+markerData.user.user_name+'</strong><p style="margin-top:10px;"><a href="'+anc+'" onclick="this.checkLogin()">Read More</a></p></div></div></div>';

          myLatlng = new googleMaps.LatLng(markerData.latitude, markerData.longitude);
          const infoWindow = new googleMaps.InfoWindow({
            minWidth: 320,
            content: contentString
          });

          const marker = new googleMaps.Marker({
            position: myLatlng,
            map,
            icon: this.image,
            title: markerData.address
          });

          marker.addListener('click', () => {
            infoWindow.close();
            infoWindow.setContent(contentString); 
            infoWindow.open(map, marker);
          });

          map.setCenter(myLatlng);

       });
      })
      .catch(err => {
      });
  }
  async getPlaceDetails(marker){
      const googleMaps = await getGoogleMaps(
        'AIzaSyBdl4FuMlu0lP6ShVcx2oohI3vermG0d40'
      );

      var geocoder = new googleMaps.Geocoder;
      var latitude=marker.getPosition().lat();               
      var longitude=marker.getPosition().lng();

      var latlng = {lat: parseFloat(latitude), lng: parseFloat(longitude)};
      var placeId = '';
      geocoder.geocode({'location': latlng}, function(results, status) {
          if (status === googleMaps.GeocoderStatus.OK) {
              if (results[1]) {
                  placeId = results[1].place_id;

                  const request = {
                    placeId: results[1].place_id,
                    fields: ["name", "formatted_address", "place_id", "geometry","address_components"]
                  };

                  const service = new googleMaps.places.PlacesService(this.map);
                  service.getDetails(request, (place, status) => {
                      if (status === googleMaps.places.PlacesServiceStatus.OK) {
                      }
                  });
              }
          }
      }); 
  }

  async addMarker(latLng) {
      let map = this.map;
      const googleMaps = await getGoogleMaps(
        'AIzaSyBdl4FuMlu0lP6ShVcx2oohI3vermG0d40'
      );

      let marker = new googleMaps.Marker({
          map: map,
          position: latLng,
          draggable: true,
          icon: this.image
      });

      // add listener to redraw the polyline when markers position change
      marker.addListener('position_changed', function() {
        //add_info(marker);
      });

      marker.addListener('click', function() {
        //add_info(marker);
      });

      //getPlaceDetails(marker);

      //store the marker object drawn in global array
      this.markersArray.push(marker);
      marker.setMap(null);
  }


}

function checkLogin(){
}

function getGoogleMaps(apiKey: string): Promise<any> {
  const win = window as any;
  const googleModule = win.google;
  if (googleModule && googleModule.maps) {
    return Promise.resolve(googleModule.maps);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.31`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      const googleModule2 = win.google;
      if (googleModule2 && googleModule2.maps) {
        resolve(googleModule2.maps);
      } else {
        reject('google maps not available');
      }
    };
  });
}


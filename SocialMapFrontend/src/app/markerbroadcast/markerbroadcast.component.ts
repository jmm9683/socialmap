import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-markerbroadcast',
  templateUrl: './markerbroadcast.component.html',
  styleUrls: ['./markerbroadcast.component.css']
})
export class MarkerbroadcastComponent implements OnInit {
  geocoderObject: object;
  geocoderFlag: boolean;
  markerForm: FormGroup;
  selectedBroadcasts: Array<String>;
  markerBroadcasts: object;
  minDate

  userData = {
    uid: null
  }; 
 
  constructor(private data: DataService, private formBuilder: FormBuilder, public db: AngularFireDatabase, private afAuth: AngularFireAuth ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.userData = user;
      if (this.userData){
        this.markerBroadcasts = db.list(`users/${this.userData["uid"]}/markerBroadcasts`).valueChanges();
      }
      else {
        this.markerBroadcasts = null;
      }
    });
    
  }
  
  ngOnInit() {
    this.data.currentGeocoderObject.subscribe(geocoderObject => {this.geocoderObject = geocoderObject;
      this.markerForm = this.formBuilder.group({
        address: [this.geocoderObject["result"]["place_name"],Validators.compose([Validators.required])],
        longitude: [this.geocoderObject["result"]["center"][0],Validators.compose([Validators.required])],
        lattitude: [this.geocoderObject["result"]["center"][1],Validators.compose([Validators.required])],
        description: ['',Validators.compose([Validators.required])],
        time: ['',Validators.compose([Validators.required])],
        name: ['',Validators.compose([Validators.required])]
      })
    });
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedBroadcasts.subscribe(selectedBroadcasts => this.selectedBroadcasts = selectedBroadcasts);
    const now = new Date();
    this.minDate = new Date();
    this.minDate.setDate(now.getDate());
  
  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let name = this.markerForm.controls['name'].value;
    let description = this.markerForm.controls['description'].value;
    let time = this.markerForm.controls['time'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let newMarker = {
      "broadcastName": name,
      "description": description,
      "time": time.getTime(),
      "type": 'Feature',
      "geometry": {
        "type": 'Point',
        "coordinates": [[longitude], [lattitude]]
      }
    };

    this.db.list(`users/${this.userData["uid"]}/markerBroadcasts/`).push(newMarker);
    this.data.changeGeocoderFlag(false);
  }

  changeSelectedBroadcasts(){
    this.data.changeSelectedBroadcasts(this.selectedBroadcasts);
    this.data.DisplayMarkersOnMap(); 
  }



}

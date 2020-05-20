import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-markercollection',
  templateUrl: './markercollection.component.html',
  styleUrls: ['./markercollection.component.css']
})
export class MarkercollectionComponent implements OnInit {
  geocoderObject: object;
  geocoderFlag: boolean;
  markerForm: FormGroup;
  selectedCollections: Array<String>;
  markerCollection: object;

  userData = {
    uid: null
  }; 
 
  constructor(private data: DataService, private formBuilder: FormBuilder, public db: AngularFireDatabase, private afAuth: AngularFireAuth ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.userData = user;
      this.markerCollection = db.list('users/' + this.userData["uid"] + '/markerCollection').valueChanges();
    });
    
  }
  
  ngOnInit() {
    this.data.currentGeocoderObject.subscribe(geocoderObject => {this.geocoderObject = geocoderObject;
      this.markerForm = this.formBuilder.group({
        address: [this.geocoderObject["result"]["place_name"],Validators.compose([Validators.required])],
        longitude: [this.geocoderObject["result"]["center"][0],Validators.compose([Validators.required])],
        lattitude: [this.geocoderObject["result"]["center"][1],Validators.compose([Validators.required])],
        description: [this.geocoderObject["result"]["text"],Validators.compose([Validators.required])],
        collection: ['',Validators.compose([Validators.required])]
      })
    });
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedCollections.subscribe(selectedCollections => this.selectedCollections = selectedCollections);

  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let collection = this.markerForm.controls['collection'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let newMarker = {
      "type": 'Feature',
      "geometry": {
        "type": 'Point',
        "coordinates": [[longitude], [lattitude]]
      }
    };
    this.db.list("users/" + this.userData["uid"] + "/markerCollection/" + collection).push(newMarker);
    this.db.list("users/" + this.userData["uid"] + "/markerCollection/" + collection).set("collectionName", collection);
    this.data.changeGeocoderFlag(false);
  }

  changeSelectedCollections(){
    this.data.changeSelectedCollections(this.selectedCollections);
    this.data.DisplayMarkersOnMap(); 
  }



}

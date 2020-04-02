import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-markercollection',
  templateUrl: './markercollection.component.html',
  styleUrls: ['./markercollection.component.css']
})
export class MarkercollectionComponent implements OnInit {
  geocoderObject: object;
  geocoderFlag: boolean;
  markerCollection: object;
  markerForm: FormGroup;
  selectedCollections: Array<String>;
 
  constructor(private data: DataService, private formBuilder: FormBuilder) { }
  
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
    this.data.currentMarkerCollection.subscribe(markerCollection => this.markerCollection = markerCollection);
    this.data.currentSelectedCollections.subscribe(selectedCollections => this.selectedCollections = selectedCollections);

    this.data.getCollections("BurgerMilkshake");

  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let collection = this.markerForm.controls['collection'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let newCollection = {
      [collection] : [{
          "type": 'Feature',
          "geometry": {
            "type": 'Point',
            "coordinates": [[longitude], [lattitude]]
          }
      }]
    };

    //if a new collection
    if (!this.markerCollection["collectionNames"].includes(collection)){
      this.markerCollection["collectionNames"].push(collection);
      this.markerCollection['markerCollection'].push(newCollection);
      this.data.postCollections(this.markerCollection);
    }
    else{
      //!!
      let collectionIndex = this.markerCollection["collectionNames"].indexOf(collection);
      this.markerCollection['markerCollection'][collectionIndex][collection].push(newCollection[collection][0]);
      this.data.postCollections(this.markerCollection);
    }
    this.data.changeGeocoderFlag(false);
  }

  changeSelectedCollections(){
    this.data.changeSelectedCollections(this.selectedCollections);
    this.data.DisplayMarkersOnMap(); 
  }



}

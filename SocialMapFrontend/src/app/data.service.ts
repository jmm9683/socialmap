import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';   

@Injectable()

export class DataService {
    
    private geocoderObject = new BehaviorSubject<object>(
        {"result": {
            "place_name": "temp",
            "center": [0,0],
            "text": "temp"
        }
    });
    private geocoderFlag = new BehaviorSubject<boolean>(false);
    
    currentGeocoderFlag = this.geocoderFlag.asObservable();
    currentGeocoderObject = this.geocoderObject.asObservable();

    private markerCollection = new BehaviorSubject<object>(
        {"markerCollection": []});
    private markerCollectionNames = new BehaviorSubject<Array<String>>([]);
    private selectedCollections = new BehaviorSubject<Array<String>>([]);

    currentMarkerCollection = this.markerCollection.asObservable();
    currentMarkerCollectionNames = this.markerCollectionNames.asObservable();
    currentSelectedCollections = this.selectedCollections.asObservable();

    constructor() {}

    changeGeocoderFlag(flag: boolean){
        this.geocoderFlag.next(flag);
    }

    changeGeocoderObject(geocoder: object){
        this.geocoderObject.next(geocoder);
    }

    changeMarkerCollection(marker: object){
        this.markerCollection.next(marker);
        console.log(this.markerCollection);
    }
    changeMarkerCollectionNames(name: Array<String>){
        this.markerCollectionNames.next(name);
    }
    changeSelectedCollections(name: Array<String>){
        this.selectedCollections.next(name);
    }




    invokeDisplayMarkers = new EventEmitter();    
    displayMakerSub: Subscription;

    DisplayMarkersOnMap() {    
        this.invokeDisplayMarkers.emit();    
      } 
}
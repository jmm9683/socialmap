import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { Observable } from 'rxjs';

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

    private selectedCollections = new BehaviorSubject<Array<String>>([]);
    currentSelectedCollections = this.selectedCollections.asObservable();
    
    private selectedBroadcasts = new BehaviorSubject<Array<String>>([]);
    currentSelectedBroadcasts = this.selectedBroadcasts.asObservable();

    constructor() {}

    changeGeocoderFlag(flag: boolean){
        this.geocoderFlag.next(flag);
    }

    changeGeocoderObject(geocoder: object){
        this.geocoderObject.next(geocoder);
    }
    
    changeSelectedCollections(name: Array<String>){
        this.selectedCollections.next(name);
    }

    changeSelectedBroadcasts(name: Array<any>){
        this.selectedBroadcasts.next(name);
    }

    invokeDisplayCollections = new EventEmitter();    
    displayCollectionSub: Subscription;

    DisplayCollectionsOnMap() {    
        this.invokeDisplayCollections.emit();    
      }

    invokeDisplayBroadcasts = new EventEmitter();    
    displayBroadcastSub: Subscription;

    DisplayBroadcastsOnMap(){
        this.invokeDisplayBroadcasts.emit();
    }

    private handleError(error){
        console.error(error);
    }
}
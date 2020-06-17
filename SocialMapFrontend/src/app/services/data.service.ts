import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { Observable } from 'rxjs';

@Injectable()

export class DataService {
    private geocoderObject = new BehaviorSubject<object>(
        {"result": {
            "place_name": "Current Location",
            "center": [0,0],
            "text": "Current Location"
        }
    });
    private geocoderFlag = new BehaviorSubject<boolean>(false);
    currentGeocoderFlag = this.geocoderFlag.asObservable();
    currentGeocoderObject = this.geocoderObject.asObservable();

    private selectedCollections = new BehaviorSubject<Array<String>>([]);
    currentSelectedCollections = this.selectedCollections.asObservable();
    
    private myBroadcasts = new BehaviorSubject<Array<String>>([]);
    currentMyBroadcasts = this.myBroadcasts.asObservable();
    private followingBroadcasts = new BehaviorSubject<Array<String>>([]);
    currentFollowingBroadcasts = this.followingBroadcasts.asObservable();
    private publicBroadcasts = new BehaviorSubject<Array<String>>([]);
    currentPublicBroadcasts = this.publicBroadcasts.asObservable();

    constructor() {}

    changeGeocoderFlag(flag: boolean){
        this.geocoderFlag.next(flag);
    }

    changeGeocoderObject(geocoder: object){
        this.geocoderObject.next(geocoder);
    }

    changeGeocoderObjectLngLat(lnglat: object){
        console.log(lnglat)
        console.log(lnglat["lng"])
        console.log(lnglat["lat"])
        let center = [lnglat["lng"], lnglat["lat"]]
        this.geocoderObject.next({...this.geocoderObject.value, "result": {...this.geocoderObject.value["result"], "center": center}})
    }
    
    changeSelectedCollections(collection: Array<String>){
        this.selectedCollections.next(collection);
    }

    changeMyBroadcasts(broadcast: Array<any>){
        this.myBroadcasts.next(broadcast);
    }
    changeFollowingBroadcasts(broadcast: Array<any>){
        this.followingBroadcasts.next(broadcast);
    }
    changePublicBroadcasts(broadcast: Array<any>){
        this.publicBroadcasts.next(broadcast);
    }
    

    invokeDisplayCollections = new EventEmitter();    
    displayCollectionSub: Subscription;

    DisplayCollectionsOnMap() {    
        this.invokeDisplayCollections.emit();    
      }

    invokeDisplayMyBroadcasts = new EventEmitter();    
    displayMyBroadcastSub: Subscription;

    DisplayMyBroadcastsOnMap(){
        this.invokeDisplayMyBroadcasts.emit();
    }
    invokeDisplayFollowingBroadcasts = new EventEmitter();    
    displayFollowingBroadcastSub: Subscription;

    DisplayFollowingBroadcastsOnMap(){
        this.invokeDisplayFollowingBroadcasts.emit();
    }
    invokeDisplayPublicBroadcasts = new EventEmitter();    
    displayPublicBroadcastSub: Subscription;

    DisplayPublicBroadcastsOnMap(){
        this.invokeDisplayPublicBroadcasts.emit();
    }

    private handleError(error){
        console.error(error);
    }
}
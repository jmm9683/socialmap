import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { HttpClient, HttpHeaders } from '@angular/common/http';   

@Injectable()

export class DataService {
    BASE_URL = 'http://localhost:63145'
    private collectionStore;
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
        {"markerCollection": [], "collectionNames": [], "user": "BurgerMilkshake"});
    private selectedCollections = new BehaviorSubject<Array<String>>([]);

    currentMarkerCollection = this.markerCollection.asObservable();
    currentSelectedCollections = this.selectedCollections.asObservable();

    constructor(private http: HttpClient ) {}

    changeGeocoderFlag(flag: boolean){
        this.geocoderFlag.next(flag);
    }

    changeGeocoderObject(geocoder: object){
        this.geocoderObject.next(geocoder);
    }

    getCollections(user){
          this.http.post(this.BASE_URL + '/collection/user', {"user": user}).subscribe(response =>{
            this.collectionStore = response;
            this.changeMarkerCollection(this.collectionStore);
          }, error => {
            this.handleError("Unable to get collections.");
          });
      }

    postCollections(collection){
        this.http.put(this.BASE_URL + '/collection/user', collection).subscribe(response => {
          this.collectionStore = (response);
          this.changeMarkerCollection(this.collectionStore);
          this.DisplayMarkersOnMap()
        }, error => {
          this.handleError("Unable to post collection.")
        });
        
    }

    changeMarkerCollection(marker: object){
        this.markerCollection.next(marker);
        console.log(this.markerCollection);
    }
    changeSelectedCollections(name: Array<String>){
        this.selectedCollections.next(name);
    }

    invokeDisplayMarkers = new EventEmitter();    
    displayMakerSub: Subscription;

    DisplayMarkersOnMap() {    
        this.invokeDisplayMarkers.emit();    
      } 

    private handleError(error){
        console.error(error);
    }
}
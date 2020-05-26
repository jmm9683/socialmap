import { environment } from '../../environments/environment';
import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';




@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit, AfterViewInit {
  map: mapboxgl.Map;
  geocoder: MapboxGeocoder;
  geocoderObject: object;
  geocoderFlag: boolean;
  selectedCollections: Array<String>;
  selectedBroadcasts: Array<any>;
  style = 'mapbox://styles/jjaakee/ck5l9uadc29pu1ipb6l3xp5r5';
  lat = 30.2672;
  lng = -97.7431;

  // markers saved here
  currentCollectionMarkers =  [];
  currentBroadcastMarkers = [];

  userData = {
    uid: null
  }; 

  constructor(private data: DataService, public db: AngularFireDatabase, private afAuth: AngularFireAuth ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.userData = user;
      if (this.userData == null){
        this.clearMarkers("collection");
        this.clearMarkers("broadcast");
      }
    });
  }
  
  ngOnInit() {
    this.data.currentGeocoderObject.subscribe(geocoderObject => this.geocoderObject = geocoderObject);
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedCollections.subscribe(selectedCollections => this.selectedCollections = selectedCollections);
    this.data.currentSelectedBroadcasts.subscribe(selectedBroadcasts => this.selectedBroadcasts = selectedBroadcasts);


    Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set(environment.mapbox.accessToken);
      this.map = new mapboxgl.Map({
        container: 'map',
        style: this.style,
        zoom: 12,
        center: [this.lng, this.lat]
    });
    this.geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      marker: {
      color: 'orange'
      },
      mapboxgl: mapboxgl
    })
    this.map.addControl(this.geocoder, 'top-left');
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(new mapboxgl.GeolocateControl());

    if (this.data.displayCollectionSub==undefined) {    
      this.data.displayCollectionSub = this.data.invokeDisplayCollections.subscribe((name:string) => {    
        this.DisplayCollectionsOnMap();    
      });    
    }   
    if (this.data.displayBroadcastSub==undefined) {    
      this.data.displayBroadcastSub = this.data.invokeDisplayBroadcasts.subscribe((name:string) => {    
        this.DisplayBroadcastsOnMap();    
      });    
    } 
    this.currentCollectionMarkers = []; 
    this.currentBroadcastMarkers = [];
  }

  
  ngAfterViewInit(){
      this.geocoder.on('result', (e: object) => {
        this.data.changeGeocoderObject(e);
        this.data.changeGeocoderFlag(true);
      });
  } 

  DisplayCollectionsOnMap(){

    this.db.list('users/' + this.userData["uid"] + '/markerCollection').valueChanges().subscribe(snapshots => {
      this.clearMarkers("collection");
      this.currentCollectionMarkers = [];

      snapshots.forEach((snapshot: object) => {
        let collectionName = snapshot["collectionName"];
        if (this.selectedCollections.includes(collectionName)){
          for (let i in snapshot){
            if (i != "collectionName"){
              this.currentCollectionMarkers.push(snapshot[i]);
            }
          }
        }
      });

      for (let i = 0; i < this.currentCollectionMarkers.length; i++){
        console.log(this.currentCollectionMarkers.length);
        console.log(this.currentCollectionMarkers[i]);
        let id = 'collection' + i
        this.map.addLayer({
          id: id,
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [this.currentCollectionMarkers[i]['geometry']['coordinates'][0], this.currentCollectionMarkers[i]['geometry']['coordinates'][1]]
              }
            }
          },
          layout: {
            'icon-image': 'embassy-15',
            'icon-padding': 0,
            'icon-allow-overlap': true
            }
        });
      }

    })
  }

  DisplayBroadcastsOnMap(){

      this.clearMarkers("broadcast");
      this.currentBroadcastMarkers = this.selectedBroadcasts
      for (let i = 0; i < this.selectedBroadcasts.length; i++){
        let id = 'broadcast' + i
        this.map.addLayer({
          id: id,
          type: 'symbol',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [this.selectedBroadcasts[i]['geometry']['coordinates'][0], this.selectedBroadcasts[i]['geometry']['coordinates'][1]]
              }
            }
          },
          layout: {
            'icon-image': 'embassy-15',
            'icon-padding': 0,
            'icon-allow-overlap': true
            }
        });
      }
  }

  clearMarkers(type){
    console.log(type)
    if (type == "collection"){
      for (let i = 0; i < this.currentCollectionMarkers.length; i++){
        console.log(this.currentCollectionMarkers);
        let id = 'collection' + i;
        this.map.removeLayer(id);
        this.map.removeSource(id);
        
      }
    }
    else if (type == "broadcast"){
      for (let i = 0; i < this.currentBroadcastMarkers.length; i++){
        console.log(this.currentBroadcastMarkers);
        let id = 'broadcast' + i;
        this.map.removeLayer(id);
        this.map.removeSource(id);
        
      }
    }

  }
}
	  

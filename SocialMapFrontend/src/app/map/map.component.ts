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
  markerCount = 0;

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
      color: 'orange',
      draggable: true
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
        console.log(e)
        this.data.changeGeocoderObject(e);
        this.data.changeGeocoderFlag(true);
        
    this.geocoder.mapMarker.on('dragend', (e) => {
      this.data.changeGeocoderObjectLngLat(e.target.getLngLat());
      this.data.changeGeocoderFlag(true); 
    });
      });
  } 

  DisplayCollectionsOnMap(){
      // remove markers 
      if (this.currentCollectionMarkers!==null) {
        for (var i = this.currentCollectionMarkers.length - 1; i >= 0; i--) {
          this.currentCollectionMarkers[i].remove();
        }
      }
      this.currentCollectionMarkers = [];
      for (let i = 0; i < this.selectedCollections.length; i++){
        for (var key in this.selectedCollections[i]) {
          console.log(this.selectedCollections[i][key])
          if (this.selectedCollections[i].hasOwnProperty(key) && this.selectedCollections[i][key].hasOwnProperty("coordinates")) {
              // create a HTML element for each feature
              var el = document.createElement('div');
              el.id = 'marker';
              el.className = key;
              el.style.backgroundImage = 'url(' + this.selectedCollections[i]["markerLogo"] + ')';
              el.style.backgroundSize = "cover";
              el.style.width = "30px";
              el.style.height = "30px";
              el.style.borderRadius = "50%";
              el.style.cursor = "pointer";
              
              // make a marker for each feature and add to the map
              let coordinates = [this.selectedCollections[i][key]['coordinates'][0].value, this.selectedCollections[i][key]['coordinates'][1].value]
              let thisMarker = new mapboxgl.Marker(el)
                .setLngLat([this.selectedCollections[i][key]['coordinates'][0], this.selectedCollections[i][key]['coordinates'][1]])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML('<h3>' + this.selectedCollections[i][key]['title'] + '</h3><p>' + this.selectedCollections[i][key]['description'] + '</p>'))
                .addTo(this.map);

                                
              this.currentCollectionMarkers.push(thisMarker);
              console.log(thisMarker)
              console.log(el.style)
          }
        }
      }
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
                coordinates: [this.selectedBroadcasts[i]['coordinates'][0], this.selectedBroadcasts[i]['coordinates'][1]]
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
      for (let i = 0; i < this.markerCount; i++){
        let id = 'collection' + i;
        this.map.removeLayer(id);
        this.map.removeSource(id);
      }
      this.markerCount = 0;
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
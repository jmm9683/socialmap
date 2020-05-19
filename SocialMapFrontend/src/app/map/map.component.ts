import { environment } from '../../environments/environment';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DataService } from '../data.service';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { AngularFireDatabase } from '@angular/fire/database'; 
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
  style = 'mapbox://styles/jjaakee/ck5l9uadc29pu1ipb6l3xp5r5';
  lat = 30.2672;
  lng = -97.7431;

  // markers saved here
  currentMarkers =  [];

  private user = "BurgerMilkshake"

  constructor(private data: DataService, public db: AngularFireDatabase ) {}
  
  ngOnInit() {
    this.data.currentGeocoderObject.subscribe(geocoderObject => this.geocoderObject = geocoderObject);
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedCollections.subscribe(selectedCollections => this.selectedCollections = selectedCollections);

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

    if (this.data.displayMakerSub==undefined) {    
      this.data.displayMakerSub = this.data.invokeDisplayMarkers.subscribe((name:string) => {    
        this.DisplayMarkersOnMap();    
      });    
    }   
    this.currentMarkers = []; 
  }

  
  ngAfterViewInit(){
      this.geocoder.on('result', (e: object) => {
        this.data.changeGeocoderObject(e);
        this.data.changeGeocoderFlag(true);
      });
  } 





  DisplayMarkersOnMap(){

    this.db.list('users/' + this.user + '/markerCollection').valueChanges().subscribe(snapshots => {
      for (let i = 0; i < this.currentMarkers.length; i++){
        console.log(this.currentMarkers);
        let id = 'marker' + i;
        this.map.removeLayer(id);
        this.map.removeSource(id);
        
      }
      this.currentMarkers = [];

      snapshots.forEach((snapshot: object) => {
        let collectionName = snapshot["collectionName"];
        if (this.selectedCollections.includes(collectionName)){
          for (let i in snapshot){
            if (i != "collectionName"){
              this.currentMarkers.push(snapshot[i]);
            }
          }
        }
      });

      for (let i = 0; i < this.currentMarkers.length; i++){
        console.log(this.currentMarkers.length);
        console.log(this.currentMarkers[i]);
        let id = 'marker' + i
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
                coordinates: [this.currentMarkers[i]['geometry']['coordinates'][0], this.currentMarkers[i]['geometry']['coordinates'][1]]
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
}
	  

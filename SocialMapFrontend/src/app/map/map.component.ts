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
  geolocate: mapboxgl.GeolocateControl;
  geocoderObject: object;
  geocoderFlag: boolean;
  selectedCollections: Array<String>;
  myBroadcasts: Array<any>;
  followingBroadcasts: Array<any>;
  publicBroadcasts: Array<any>;
  style = 'mapbox://styles/jjaakee/ck5l9uadc29pu1ipb6l3xp5r5';
  lat = 30.2672;
  lng = -97.7431;
  markerCount = 0;

  // markers saved here
  currentCollectionMarkers =  [];
  currentMyBroadcastMarkers = [];
  currentFollowingBroadcastMarkers = [];
  currentPublicBroadcastMarkers = [];

  userData = {
    uid: null
  }; 

  constructor(private data: DataService, public db: AngularFireDatabase, private afAuth: AngularFireAuth ) {
    this.afAuth.onAuthStateChanged((user) => {
      this.userData = user;
      if (this.userData == null){
        this.clearMarkers("collection", 0);
        this.clearMarkers("broadcast", 0);
        this.clearMarkers("broadcast", 1);
        this.clearMarkers("broadcast", 2);
      }
    });
  }
  
  ngOnInit() {
    this.data.currentGeocoderObject.subscribe(geocoderObject => this.geocoderObject = geocoderObject);
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedCollections.subscribe(selectedCollections => this.selectedCollections = selectedCollections);
    this.data.currentMyBroadcasts.subscribe(myBroadcasts => this.myBroadcasts = myBroadcasts);
    this.data.currentFollowingBroadcasts.subscribe(followingBroadcasts => this.followingBroadcasts = followingBroadcasts);
    this.data.currentPublicBroadcasts.subscribe(publicBroadcasts => this.publicBroadcasts = publicBroadcasts);

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
    this.geolocate = new mapboxgl.GeolocateControl();

    this.map.addControl(this.geocoder, 'top-left');
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.addControl(this.geolocate);
    if (this.data.displayCollectionSub==undefined) {    
      this.data.displayCollectionSub = this.data.invokeDisplayCollections.subscribe((name:string) => {    
        this.DisplayCollectionsOnMap();    
      });    
    }   
    if (this.data.displayMyBroadcastSub==undefined) {    
      this.data.displayMyBroadcastSub = this.data.invokeDisplayMyBroadcasts.subscribe((name:string) => {    
        this.DisplayPrivateBroadcastsOnMap(0, this.myBroadcasts);    
      });    
    } 
    if (this.data.displayFollowingBroadcastSub==undefined) {    
      this.data.displayFollowingBroadcastSub = this.data.invokeDisplayFollowingBroadcasts.subscribe((name:string) => {    
        this.DisplayPrivateBroadcastsOnMap(1, this.followingBroadcasts);    
      });    
    }
    if (this.data.displayPublicBroadcastSub==undefined) {    
      this.data.displayPublicBroadcastSub = this.data.invokeDisplayPublicBroadcasts.subscribe((name:string) => {    
        this.DisplayPublicBroadcastsOnMap(this.publicBroadcasts);    
      });    
    }
     
    this.currentCollectionMarkers = []; 
    this.currentMyBroadcastMarkers = [];
    this.currentFollowingBroadcastMarkers = [];
    this.currentPublicBroadcastMarkers = [];

  }  


  ngAfterViewInit(){
      this.geocoder.on('result', (e: object) => {
        this.data.changeGeocoderObject(e);
        this.data.changeGeocoderFlag(true);
        
        this.geocoder.mapMarker.on('dragend', (e) => {
          this.data.changeGeocoderObjectLngLat(e.target.getLngLat());
          this.data.changeGeocoderFlag(true); 
        });
      });
      this.geolocate.on('geolocate', (e) => {
        let position = {"lng": e.coords.longitude, "lat": e.coords.latitude};
        this.data.changeGeocoderObjectLngLat(position);
        this.data.changeGeocoderFlag(true); 
      });
      this.map.on('click', 'publicBroadcasts', (e) => {
        var coordinates = e.features[0].geometry['coordinates'].slice();
        var description = e.features[0]['properties'].description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(this.map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      this.map.on('mouseenter', 'publicBroadcasts', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', 'publicBroadcasts', () => {
        this.map.getCanvas().style.cursor = '';
      });  

  } 

  DisplayCollectionsOnMap(){
    this.clearMarkers("collection", 0);
      for (let i = 0; i < this.selectedCollections.length; i++){
        for (var key in this.selectedCollections[i]) {
          console.log(this.selectedCollections[i][key])
          if (this.selectedCollections[i].hasOwnProperty(key) && this.selectedCollections[i][key].hasOwnProperty("coordinates")) {
              // create a HTML element for each feature
              var el = document.createElement('div');
              el.className = key;
              el.style.backgroundImage = 'url(' + this.selectedCollections[i]["markerLogo"] + ')';
              el.style.backgroundSize = "cover";
              el.style.backgroundPosition = "center center";
              el.style.width = "30px";
              el.style.height = "30px";
              el.style.borderRadius = "50%";
              el.style.cursor = "pointer";
              
              // make a marker for each feature and add to the map
              let coordinates = [this.selectedCollections[i][key]['coordinates'][0].value, this.selectedCollections[i][key]['coordinates'][1].value]
              let thisMarker = new mapboxgl.Marker(el)
                .setLngLat([this.selectedCollections[i][key]['coordinates'][0], this.selectedCollections[i][key]['coordinates'][1]])
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML('<h3>' + this.selectedCollections[i][key]['title'] + '</h3>' +
                            '<p>' + this.selectedCollections[i][key]['description'] + '</p>' +
                            '<footer> <p> By:' + this.selectedCollections[i]['owner'] + '</p></footer>'))
                .addTo(this.map);

                                
              this.currentCollectionMarkers.push(thisMarker);
          }
        }
      }
  }

  DisplayPrivateBroadcastsOnMap(type, broadcasts){
      this.clearMarkers("broadcast", type);
      for (let i = 0; i < broadcasts.length; i++){
        // create a HTML element for each feature
        var el = document.createElement('div');
        el.style.backgroundImage = 'url(' + broadcasts[i]["markerLogo"] + ')';
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center center";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        
        let startDate = new Date(broadcasts[i]['start']);
        let month = startDate.getMonth() + 1;
        let startHours = startDate.getHours();
        let startPeriod = "AM"
        if (startHours > 12){
          startHours = startHours - 12;
          startPeriod = "PM"
        }
        let endDate = new Date(broadcasts[i]['end']);
        let endHours = endDate.getHours();
        let endPeriod = "AM"
        if (endHours > 12){
          endHours = endHours - 12;
          endPeriod = "PM"
        }
        let startMinute = startDate.getMinutes();
        let startMinuteZero = ''
        if (startMinute < 10){
          startMinuteZero = '0';
        }
        let endMinute = endDate.getMinutes();
        let endMinuteZero = ''
        if (endMinute < 10){
          endMinuteZero = '0';
        }

        // make a marker for each feature and add to the map
        let thisMarker = new mapboxgl.Marker(el)
          .setLngLat([broadcasts[i]['coordinates'][0], broadcasts[i]['coordinates'][1]])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML('<h3>' + broadcasts[i]['broadcastName'] + '</h3>'+
                    '<p>' + broadcasts[i]['description'] + '</p>' +
                    '<footer> <p> By:' + broadcasts[i]['owner'] + '<br>'
                    + month +  '/' + startDate.getDate() + '/' + startDate.getFullYear() + ', ' + startHours + ':' + startMinuteZero + startMinute + ' ' + startPeriod +  
                    ' to ' + endHours + ':' + endMinuteZero + endMinute + ' ' + endPeriod + '</p></footer>'))
          .addTo(this.map);

        if(type == 0){
          this.currentMyBroadcastMarkers.push(thisMarker);
        }    
        if(type == 1){
          this.currentFollowingBroadcastMarkers.push(thisMarker);
        }             
        
      }
  }

  DisplayPublicBroadcastsOnMap(broadcasts){
    if (this.map.getLayer("publicBroadcasts")) {
      this.map.removeLayer("publicBroadcasts");
    }
    if (this.map.getSource("publicBroadcasts")) {
      this.map.removeSource("publicBroadcasts");
    }
    let data = {
      'features': [] 
    }
    for (let i = 0; i < broadcasts.length; i++){
      let startDate = new Date(broadcasts[i]['start']);
      let month = startDate.getMonth()+1;
      let startHours = startDate.getHours();
      let startPeriod = "AM"
      if (startHours > 12){
        startHours = startHours - 12;
        startPeriod = "PM"
      }
      let startMinute = startDate.getMinutes();
      let startMinuteZero = ''
      if (startMinute < 10){
        startMinuteZero = '0';
      }
      let endDate = new Date(broadcasts[i]['end']);
      let endHours = endDate.getHours();
      let endPeriod = "AM"
      if (endHours > 12){
        endHours = endHours - 12;
        endPeriod = "PM"
      }
      let endMinute = endDate.getMinutes();
      let endMinuteZero = ''
      if (endMinute < 10){
        endMinuteZero = '0';
      }
      let thisBroadcast = {
        'type': 'Feature',
        'properties': {
            'description':
            '<h3>' + broadcasts[i]['broadcastName'] + '</h3>'+
            '<p>' + broadcasts[i]['description'] + '</p>' +
            '<footer> <p> By:' + broadcasts[i]['owner'] + '<br>'
            + month +  '/' + startDate.getDate() + '/' + startDate.getFullYear() + ', ' + startHours + ':' + startMinuteZero + startMinute + ' ' + startPeriod +  
            ' to ' + endHours + ':' + endMinuteZero + endMinute + ' ' + endPeriod + '</p></footer>',
            'icon': broadcasts[i]['icon']
        },
        'geometry': {
            'type': 'Point',
            'coordinates': [broadcasts[i]['coordinates'][0], broadcasts[i]['coordinates'][1]]
        }
      }
      data.features.push(thisBroadcast);
    }
    this.map.addSource('publicBroadcasts', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': data.features 
      },
      'cluster': true,
      'clusterRadius': 5,
      'clusterMaxZoom': 10,
    });
    this.map.addLayer({
      'id': 'publicBroadcasts',
      'type': 'symbol',
      'source': 'publicBroadcasts',
      'layout': {
          'icon-image': '{icon}',
          'icon-allow-overlap': true
      }

    });
  }

  clearMarkers(type, broadcastType){
    if (type == "collection"){
      // remove markers 
      if (this.currentCollectionMarkers!==null) {
        for (var i = this.currentCollectionMarkers.length - 1; i >= 0; i--) {
          this.currentCollectionMarkers[i].remove();
        }
      }
      this.currentCollectionMarkers = [];
    }
    else if (type == "broadcast" && broadcastType == 0){
      if (this.currentMyBroadcastMarkers!==null) {
        for (var i = this.currentMyBroadcastMarkers.length - 1; i >= 0; i--) {
          this.currentMyBroadcastMarkers[i].remove();
        }
        this.currentMyBroadcastMarkers = [];
      }
    }
    else if(type == "broadcast" && broadcastType == 1){
      if (this.currentFollowingBroadcastMarkers!==null) {
        for (var i = this.currentFollowingBroadcastMarkers.length - 1; i >= 0; i--) {
          this.currentFollowingBroadcastMarkers[i].remove();
        }
        this.currentFollowingBroadcastMarkers = [];
      }
    } 
  }
}

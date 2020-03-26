import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { SearchComponent } from './search/search.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoiamphYWtlZSIsImEiOiJjazVrOGV5MXMwYmsxM21tdnh0MGdoeGowIn0.ZnEs41Ez6kvvxQSJAlJahA', // Optional, can also be set per map (accessToken input of mgl-map)
  //    geocoderAccessToken: 'TOKEN' // Optional, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

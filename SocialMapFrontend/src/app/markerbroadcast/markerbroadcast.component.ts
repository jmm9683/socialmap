import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';

export interface Broadcast {
  broadcastName: string;
  time: Number;
  description: string;
}


@Component({
  selector: 'app-markerbroadcast',
  templateUrl: './markerbroadcast.component.html',
  styleUrls: ['./markerbroadcast.component.css']
})
export class MarkerbroadcastComponent implements OnInit {
  geocoderObject: object;
  geocoderFlag: boolean;
  markerForm: FormGroup;
  selectedBroadcasts: Array<any>;
  markerBroadcasts: Array<any> = [];
  following: Array<any> = [];
  minDate

  displayedColumns = ['select', 'time', 'owner', 'name', 'description'];
  dataSource
  selection = new SelectionModel<Broadcast>(true, []);
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  userData = {
    uid: null
  }; 
 
  constructor(private data: DataService, private formBuilder: FormBuilder, public db: AngularFireDatabase, private afAuth: AngularFireAuth, public user: UserService ) {}
  
  ngOnInit() {
    this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/`).valueChanges().subscribe( data => {
      for (let i in data){
        this.markerBroadcasts.push(data[i]);
      }
      this.dataSource = new MatTableDataSource<Broadcast>(this.markerBroadcasts);
    })
    this.data.currentGeocoderObject.subscribe(geocoderObject => {this.geocoderObject = geocoderObject;
      this.markerForm = this.formBuilder.group({
        address: [this.geocoderObject["result"]["place_name"],Validators.compose([Validators.required])],
        longitude: [this.geocoderObject["result"]["center"][0],Validators.compose([Validators.required])],
        lattitude: [this.geocoderObject["result"]["center"][1],Validators.compose([Validators.required])],
        description: ['',Validators.compose([Validators.required])],
        time: ['',Validators.compose([Validators.required])],
        name: ['',Validators.compose([Validators.required])]
      })
    });
    this.db.object(`following/${this.user.currentUser.uid}`).valueChanges().subscribe((following : Object) => {
      this.following = [{"uid": this.user.currentUser.uid, "username": this.user.currentUser.username}];
      for (let thisFollowing in following){
        this.db.list(`markerBroadcasts/${thisFollowing}/`).valueChanges().subscribe( data => {
          for (let i in data){
            this.markerBroadcasts.push(data[i]);
          }
          this.dataSource = new MatTableDataSource<Broadcast>(this.markerBroadcasts);
        })
        this.db.object(`users/${thisFollowing}/`).valueChanges().subscribe(followingInfo => {
          this.following.push({"uid": thisFollowing, "username": followingInfo['username']});
        })
      }
    })
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedBroadcasts.subscribe(selectedBroadcasts => this.selectedBroadcasts = selectedBroadcasts);
    const now = new Date();
    this.minDate = new Date();
    this.minDate.setDate(now.getDate());
  
  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let name = this.markerForm.controls['name'].value;
    let description = this.markerForm.controls['description'].value;
    let time = this.markerForm.controls['time'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let newMarker = {
      "owner": this.user.currentUser.username,
      "broadcastName": name,
      "description": description,
      "time": time.getTime(),
      "type": 'Feature',
      "geometry": {
        "type": 'Point',
        "coordinates": [[longitude], [lattitude]]
      }
    };

    this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/`).push(newMarker);
    this.data.changeGeocoderFlag(false);
  }


  changeSelectedBroadcasts(){
    this.selectedBroadcasts = this.selection.selected;
    this.data.changeSelectedBroadcasts(this.selectedBroadcasts);
    this.data.DisplayBroadcastsOnMap(); 
  }

  // clearSelectedBroadcasts(){
  //   this.selectedBroadcasts = [];
  //   this.data.changeSelectedBroadcasts(this.selectedBroadcasts);
  //   this.data.DisplayBroadcastsOnMap(); 
  // }


  // showBroadcast(broadcast){
  //   console.log(broadcast)
  //   this.selectedBroadcasts.push(broadcast)
  //   console.log(this.selectedBroadcasts)
  //   this.data.changeSelectedBroadcasts(this.selectedBroadcasts);
  //   this.data.DisplayBroadcastsOnMap(); 
  // }



}

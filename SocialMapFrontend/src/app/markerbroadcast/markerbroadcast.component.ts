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
import * as firebase from 'firebase';

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
  markerBroadcasts: Array<any> = [];
  myBroadcasts:  Array<any> = [];
  followingBroadcasts: Array<any> = [];
  publicBroadcasts: Array<any> = [];
  following: Array<any> = [];
  minDate
  isPublic = false;
  

  displayedColumns = ['select', 'time', 'owner', 'title', 'description'];
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

  constructor(private data: DataService, private formBuilder: FormBuilder, public db: AngularFireDatabase, private afAuth: AngularFireAuth, public user: UserService ) {}
  
  ngOnInit() {
    this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/`).valueChanges().subscribe( data => {
      this.myBroadcasts = data;
      console.log(this.myBroadcasts)
      this.displayMyBroadcasts();
    })
    this.data.currentGeocoderObject.subscribe(geocoderObject => {this.geocoderObject = geocoderObject;
      this.markerForm = this.formBuilder.group({
        title: [this.geocoderObject["result"]["text"],Validators.compose([Validators.required])],
        longitude: [this.geocoderObject["result"]["center"][0],Validators.compose([Validators.required])],
        lattitude: [this.geocoderObject["result"]["center"][1],Validators.compose([Validators.required])],
        description: ['',Validators.compose([Validators.required])],
        time: ['',Validators.compose([Validators.required])]
      })
    });
    this.db.object(`following/${this.user.currentUser.uid}`).valueChanges().subscribe((following : Object) => {
      this.followingBroadcasts = []
      this.following = [{"uid": this.user.currentUser.uid, "username": this.user.currentUser.username}];
      for (let thisFollowing in following){
        this.db.list(`markerBroadcasts/${thisFollowing}/`).valueChanges().subscribe( data => {
          for(let i in data){
            this.followingBroadcasts.push(data[i]);
          }
          this.displayFollowingBroadcasts();
        })
        this.db.object(`users/${thisFollowing}/`).valueChanges().subscribe(followingInfo => {
          this.following.push({"uid": thisFollowing, "username": followingInfo['username']});
        })
      }
    })
    this.db.list(`publicBroadcasts/`).valueChanges().subscribe( data => {
      for(let user in data){
        let userBroadcasts = []
        userBroadcasts.push(data[user])
        for(let marker in userBroadcasts[0]){
          this.publicBroadcasts.push(userBroadcasts[0][marker]);
        }
      }
      this.displayPublicBroadcasts();
    })
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag)
    const now = new Date();
    this.minDate = new Date();
    this.minDate.setDate(now.getDate());
    
  
  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let title = this.markerForm.controls['title'].value;
    let description = this.markerForm.controls['description'].value;
    let time = this.markerForm.controls['time'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let newMarker = {
      "owner": this.user.currentUser.username,
      "broadcastName": title,
      "description": description,
      "time": time.getTime(),
      "coordinates": [[longitude], [lattitude]],
      "markerLogo": this.user.currentUser.propicURL,
      "public": this.isPublic
    };

    this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/`).push(newMarker).then((snap) => {
      let key = snap.key; 
      if(this.isPublic){
        this.db.list(`publicBroadcasts/${this.user.currentUser.uid}/`).set(key, newMarker)
      }
      this.isPublic = false;
   })
    
    this.data.changeGeocoderFlag(false);
  }

  displayMyBroadcasts(){
    this.data.changeMyBroadcasts(this.myBroadcasts);
    this.data.DisplayMyBroadcastsOnMap(); 
  }

  displayFollowingBroadcasts(){
    this.data.changeFollowingBroadcasts(this.followingBroadcasts);
    this.data.DisplayFollowingBroadcastsOnMap(); 
  }
  displayPublicBroadcasts(){
    this.data.changePublicBroadcasts(this.publicBroadcasts);
    this.data.DisplayPublicBroadcastsOnMap(); 
  }
  displayMyFlag = true;
  displayFollowingFlag = true;
  displayPublicFlag = true;
  hideBroadcasts(type){
    if(type == 0){
      if(!this.displayMyFlag){
        this.displayMyBroadcasts();
      }
      else{
        this.data.changeMyBroadcasts([]);
        this.data.DisplayMyBroadcastsOnMap(); 
      }
    }
    if(type == 1){
      if(!this.displayFollowingFlag){
        this.displayFollowingBroadcasts();
      }
      else{
        this.data.changeFollowingBroadcasts([]);
        this.data.DisplayFollowingBroadcastsOnMap(); 
      }
    }
    if(type == 2){
      if(!this.displayPublicFlag){
        this.displayPublicBroadcasts();
      }
      else{
        this.data.changePublicBroadcasts([]);
        this.data.DisplayPublicBroadcastsOnMap(); 
      }
    }
  }



}

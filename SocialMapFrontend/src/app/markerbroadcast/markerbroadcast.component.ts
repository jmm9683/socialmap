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



@Component({
  selector: 'app-markerbroadcast',
  templateUrl: './markerbroadcast.component.html',
  styleUrls: ['./markerbroadcast.component.css']
})
export class MarkerbroadcastComponent implements OnInit {
  geocoderObject: object;
  geocoderFlag: boolean;
  markerForm: FormGroup;
  myMarkerBroadcasts: object;
  myBroadcasts:  Array<any> = [];
  followingBroadcasts: Array<any> = [];
  publicBroadcasts: Array<any> = [];
  following: Array<any> = [];
  minDate
  isPublic = false;
  editing = false;
  now = new Date();
  startDate;
  maxDate;
  todaysDate = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate())
  oneDay = new Date(this.todaysDate.getTime() + 86400000);
  twoDay = new Date(this.oneDay.getTime() + 86400000);
  threeDay = new Date(this.twoDay.getTime() + 86400000);
  fourDay = new Date(this.threeDay.getTime() + 86400000);
  fiveDay = new Date(this.fourDay.getTime() + 86400000);
  sixDay = new Date(this.fiveDay.getTime() + 86400000);
  sevenDay = new Date(this.sixDay.getTime() + 86400000);
  selectedDay = "0";
  selectedIcon = "embassy-15";

  constructor(private data: DataService, private formBuilder: FormBuilder, public db: AngularFireDatabase, private afAuth: AngularFireAuth, public user: UserService ) {}
  
  ngOnInit() {
    this.myMarkerBroadcasts = this.db.object(`markerBroadcasts/${this.user.currentUser.uid}/`).valueChanges();
    this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/`).valueChanges().subscribe( data => {
      this.filterDay(0, 0);
    })
    this.data.currentGeocoderObject.subscribe(geocoderObject => {this.geocoderObject = geocoderObject;
      this.markerForm = this.formBuilder.group({
        title: [this.geocoderObject["result"]["text"],Validators.compose([Validators.required])],
        longitude: [this.geocoderObject["result"]["center"][0],Validators.compose([Validators.required])],
        lattitude: [this.geocoderObject["result"]["center"][1],Validators.compose([Validators.required])],
        description: ['',Validators.compose([Validators.required])],
        start: ['',Validators.compose([Validators.required])],
        end: ['',Validators.compose([Validators.required])]
      })
    });
    this.db.object(`following/${this.user.currentUser.uid}`).valueChanges().subscribe((following : Object) => {
      this.followingBroadcasts = []
      this.following = [];
      for (let thisFollowing in following){
        // this.db.list(`markerBroadcasts/${thisFollowing}/`).valueChanges().subscribe( data => {
        //   for(let i in data){
        //     this.followingBroadcasts.push(data[i]);
        //   }
        //   this.displayFollowingBroadcasts();
        // })
        this.db.object(`users/${thisFollowing}/`).valueChanges().subscribe(followingInfo => {
          this.following.push({"uid": thisFollowing, "username": followingInfo['username']});
          this.filterDay(1, 0);
        })
      }
    })
    this.db.list(`publicBroadcasts/`).valueChanges().subscribe( data => {
      this.filterDay(2,0);
    })
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag)
    
    this.minDate = new Date();
    this.minDate.setDate(this.now.getDate());
  }

  updateStartDate(){
    // this.maxDate = new Date(this.startDate.getTime() + 86400000);
    let tempDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
    this.maxDate = new Date(tempDate.getTime() + 86399000);
  }
  updateEndDate(){
  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let title = this.markerForm.controls['title'].value;
    let description = this.markerForm.controls['description'].value;
    let start = this.markerForm.controls['start'].value;
    let end = this.markerForm.controls['end'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let newMarker = {
      "owner": this.user.currentUser.username,
      "broadcastName": title,
      "description": description,
      "start": start.getTime(),
      "end": end.getTime(),
      "coordinates": [[longitude], [lattitude]],
      "markerLogo": this.user.currentUser.propicURL,
      "public": this.isPublic,
      "icon": this.selectedIcon
    };

    this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/`).push(newMarker).then((snap) => {
      let key = snap.key
      let combinedKey = this.user.currentUser.uid + snap.key; 
      if(this.isPublic){
        this.db.list(`publicBroadcasts/`).set(combinedKey, newMarker)
        this.db.list(`markerBroadcasts/${this.user.currentUser.uid}/${key}`).set("publicKey", combinedKey)
      }
      this.isPublic = false;
   })
    
    this.data.changeGeocoderFlag(false);
  }
  changeFilterDate(){
    this.filterDay(0, this.selectedDay)
    this.filterDay(1, this.selectedDay)
    this.filterDay(2, this.selectedDay)
  }
  filterDay(type, day){
    let start = this.getStartBounds(day);
    let end = this.getEndBounds(day);
    if (type == 1){
      this.followingBroadcasts = [];
      for (let i in this.following){
        this.getBroadcastDay(type, start, end, this.following[i].uid).then(snapshot => {this.setBroadcastDay(type, snapshot)})
      }
    }
    else{
      this.getBroadcastDay(type, start, end, null).then(snapshot => {this.setBroadcastDay(type, snapshot)})
    }
    
  }

  getBroadcastDay(type, start, end, following){
    if(type == 0){
      let ref = firebase.database().ref(`/markerBroadcasts/${this.user.currentUser.uid}/`);
      return ref.orderByChild("end").startAt(start).endAt(end).once('value')
    }
    if(type == 1){
      let ref = firebase.database().ref(`/markerBroadcasts/${following}/`);
      return ref.orderByChild("end").startAt(start).endAt(end).once('value')
    }
    if(type == 2){
      let ref = firebase.database().ref(`/publicBroadcasts/`);
      return ref.orderByChild("end").startAt(start).endAt(end).once('value')
    }
  }
  
  setBroadcastDay(type, snapshot){
    if(type == 0){
      this.myBroadcasts = [];
      let data = snapshot.val();
      for (let i in data){
        this.myBroadcasts.push(data[i])
      }
      this.displayMyBroadcasts();
    }
    if(type == 1){
      let data = snapshot.val();
      for (let i in data){
        this.followingBroadcasts.push(data[i]);
      }
      this.displayFollowingBroadcasts();

    }
    if(type == 2){
      this.publicBroadcasts = [];
      let data = snapshot.val();
      console.log(data)
      for (let i in data){
        this.publicBroadcasts.push(data[i])
      }
      this.displayPublicBroadcasts();
    }
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

  getStartBounds(day){
    if (day == 0){
      return this.now.getTime();
    }
    if (day == 1){
      return this.oneDay.getTime();
    }
    if (day == 2){
      return this.twoDay.getTime();
    }
    if (day == 3){
      return this.threeDay.getTime();
    }
    if (day == 4){
      return this.fourDay.getTime();
    }
    if (day == 5){
      return this.fiveDay.getTime();
    }
    if (day == 6){
      return this.sixDay.getTime();
    }
  }
  getEndBounds(day){
    if (day == 0){
      return this.oneDay.getTime();
    }
    if (day == 1){
      return this.twoDay.getTime();
    }
    if (day == 2){
      return this.threeDay.getTime();
    }
    if (day == 3){
      return this.fourDay.getTime();
    }
    if (day == 4){
      return this.fiveDay.getTime();
    }
    if (day == 5){
      return this.sixDay.getTime();
    }
    if (day == 6){
      return this.sevenDay.getTime();
    }
  }

  editBroadcasts(){
    this.editing = !this.editing;
  }
  deleteBroadcast(broadcastKey, broadcast){
    if(broadcast.public){
      let pubRef = firebase.database().ref(`publicBroadcasts/${broadcast.publicKey}/`);
      pubRef.remove()
    }
    let ref = firebase.database().ref(`markerBroadcasts/${this.user.currentUser.uid}/${broadcastKey}/`);
    ref.remove()
  }
}

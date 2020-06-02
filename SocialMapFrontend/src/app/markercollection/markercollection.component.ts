import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-markercollection',
  templateUrl: './markercollection.component.html',
  styleUrls: ['./markercollection.component.css']
})
export class MarkercollectionComponent implements OnInit {
  geocoderObject: object;
  geocoderFlag: boolean;
  markerForm: FormGroup;
  selectedCollections: Array<String>;
  markerCollection: object;
  myMarkerCollection: object;
  following: Array<any> = [];

  constructor(private data: DataService, private formBuilder: FormBuilder, public db: AngularFireDatabase, private afAuth: AngularFireAuth, public user: UserService ) {}
  
  ngOnInit() {
    this.markerCollection = this.db.list(`markerCollections/${this.user.currentUser.uid}/`).valueChanges();
    this.myMarkerCollection = this.db.list(`markerCollections/${this.user.currentUser.uid}/`).valueChanges();
    this.data.currentGeocoderObject.subscribe(geocoderObject => {this.geocoderObject = geocoderObject;
      this.markerForm = this.formBuilder.group({
        title: [this.geocoderObject["result"]["text"],Validators.compose([Validators.required])],
        longitude: [this.geocoderObject["result"]["center"][0],Validators.compose([Validators.required])],
        lattitude: [this.geocoderObject["result"]["center"][1],Validators.compose([Validators.required])],
        description: ['',Validators.compose([Validators.required])],
        collection: ['',Validators.compose([Validators.required])]
      })
    });
    this.data.currentGeocoderFlag.subscribe(geocoderFlag => this.geocoderFlag = geocoderFlag);
    this.data.currentSelectedCollections.subscribe(selectedCollections => this.selectedCollections = selectedCollections);
    this.db.object(`following/${this.user.currentUser.uid}`).valueChanges().subscribe((following : Object) => {
      this.following = [{"uid": this.user.currentUser.uid, "username": this.user.currentUser.username}];
      for (let thisFollowing in following){
        this.db.object(`users/${thisFollowing}/`).valueChanges().subscribe(followingInfo => {
          this.following.push({"uid": thisFollowing, "username": followingInfo['username']});
        })
      }
    })

  }

  addMarker(){
    if (!this.markerForm.valid){
      console.log('form is not valid');
      return;
    }
    
    let collection = this.markerForm.controls['collection'].value;
    let longitude = this.markerForm.controls['longitude'].value;
    let lattitude = this.markerForm.controls['lattitude'].value;
    let title = this.markerForm.controls['title'].value;
    let description = this.markerForm.controls['description'].value;
    let newMarker = {
      "title": title,
      "description": description,
      "coordinates": [[longitude], [lattitude]]
    };
    this.db.list(`markerCollections/${this.user.currentUser.uid}/${collection}`).push(newMarker);
    this.db.list(`markerCollections/${this.user.currentUser.uid}/${collection}`).set("markerLogo", this.user.currentUser.propicURL);
    this.db.list(`markerCollections/${this.user.currentUser.uid}/${collection}`).set("collectionName", collection);
    this.db.list(`markerCollections/${this.user.currentUser.uid}/${collection}`).set("owner", this.user.currentUser.username)
    this.data.changeGeocoderFlag(false);
  }

  changeSelectedCollections(){
    this.data.changeSelectedCollections(this.selectedCollections);
    this.data.DisplayCollectionsOnMap(); 
  }

  changeCollection(user){
    this.markerCollection = this.db.list(`markerCollections/${user.value}/`).valueChanges();
    this.selectedCollections = [];
    this.data.changeSelectedCollections(this.selectedCollections);
    this.data.DisplayCollectionsOnMap(); 
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import { AngularFireDatabase } from '@angular/fire/database'; 
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {

  @Input() account;

  accountInfo;
  followers: Array<any> = [];
  followRequests: Array<any> = [];
  following: Array<any> = [];
  requestFlag = false;
  followFlag = false;
  isPrivate = true;
  followRequestsCount = 0;

  storageRef = firebase.storage().ref().child('profile_pictures/defaultprofile.png');

  constructor(private user: UserService, private db: AngularFireDatabase) { 

  }

  ngOnInit() {
    this.db.object(`users/${this.account}/`).valueChanges().subscribe(info => {
      this.accountInfo = info;
      if(!info['propicURL']){
        this.storageRef.getDownloadURL().then(url => {
          this.accountInfo['propicURL'] = url;
        });
      }
      this.isPrivate = info['private'];
    })
    this.db.object(`following/${this.account}/`).valueChanges().subscribe((following: object) => {
      this.following = [];
      for (let thisFollowing in following){
        this.db.object(`users/${thisFollowing}/`).valueChanges().subscribe(followingInfo => {
          this.following.push({"uid": thisFollowing, "username": followingInfo['username']});
        })
      }
    })
    this.db.object(`followers/${this.account}/`).valueChanges().subscribe((followers: object) => {
      for (let follower in followers){
        if (follower == this.user.currentUser.uid){
          this.followFlag = true;
        }
        this.followers = [];
        this.db.object(`users/${follower}/`).valueChanges().subscribe(followerInfo => {
          this.followers.push({"uid": follower, "username": followerInfo['username']});
        })
      }
    })
    this.user.currentfollowRequestsCount.subscribe(followRequestsCount => this.followRequestsCount = followRequestsCount);
    this.db.object(`followRequests/${this.account}/`).valueChanges().subscribe((followRequests: object)=> {
      for (let request in followRequests){
        if(this.thisAccount()){
          this.followRequestsCount++;
          this.user.changeFollowRequestsCount(this.followRequestsCount);
        }
        if (request == this.user.currentUser.uid){
          this.requestFlag = true;
        }
        this.followRequests = [];
        this.db.object(`users/${request}/`).valueChanges().subscribe(requestInfo => {
          this.followRequests.push({"uid": request, "username": requestInfo['username']});
        })
      }
    });
  }

  thisAccount(){
    return this.user.currentUser.uid == this.account;
  }

  sendFollowRequst(privateFlag){
    if (privateFlag){
      this.db.list(`followRequests/${this.account}/${this.user.currentUser.uid}`).push(true);
    }
    else{
      this.db.list(`followers/${this.account}/${this.user.currentUser.uid}`).push(true);
      this.db.list(`following/${this.user.currentUser.uid}/${this.account}`).push(true);
    }
  }
  cancelFollowRequst(cancelRequest){
    if (!cancelRequest){
      let ref = firebase.database().ref(`followRequests/${this.account}/${this.user.currentUser.uid}`);
      ref.remove()
    }
    else{
      let ref = firebase.database().ref(`followRequests/${cancelRequest}/${this.account}`);
      ref.remove()
      this.followRequestsCount--;
      this.user.changeFollowRequestsCount(this.followRequestsCount);
    }
    this.requestFlag = false; 
    this.followFlag = false;
  }

  unfollow(unfollowUID){
    if(!unfollowUID){
      let ref = firebase.database().ref(`followers/${this.account}/${this.user.currentUser.uid}`);
      ref.remove()
      ref = firebase.database().ref(`following/${this.user.currentUser.uid}/${this.account}`);
      ref.remove()
    }
    else{
      let ref = firebase.database().ref(`followers/${unfollowUID}/${this.account}`);
      ref.remove()
      ref = firebase.database().ref(`following/${this.account}/${unfollowUID}`);
      ref.remove()
    }

    this.requestFlag = false; 
    this.followFlag = false;
  }

  removeFollower(removeUID){
    let ref = firebase.database().ref(`followers/${this.account}/${removeUID}`);
    ref.remove()
    ref = firebase.database().ref(`following/${removeUID}/${this.account}`);
    ref.remove()
    let newFollowers = [];
    for (let i = 0; i < this.followers.length; i++){
      if (this.followers[i].uid == removeUID){}
      else{
        newFollowers.push(this.followers[i])
      }
    }
    this.followers = newFollowers;
  }

  acceptRequest(acceptUID){
    let ref = firebase.database().ref(`followRequests/${this.account}/${acceptUID}`);
      ref.remove()
    this.db.list(`followers/${this.account}/${acceptUID}`).push(true);
    this.db.list(`following/${acceptUID}/${this.account}`).push(true);
    let newRequest = [];
    for (let i = 0; i < this.followRequests.length; i++){
      if (this.followRequests[i].uid == acceptUID){}
      else{
        newRequest.push(this.followRequests[i])
      }
    }
    this.followRequests = newRequest;
    this.followRequestsCount--;
    this.user.changeFollowRequestsCount(this.followRequestsCount);
  }
  changePrivacy(){
    if(this.isPrivate){
      //make public
      this.db.list(`users/${this.account}`).set("private", false);
    }
    else{
      //make public
      this.db.list(`users/${this.account}`).set("private", true);
    }
  }

  selectedFile: File = null;

  onFileSelected(event){
    this.selectedFile = <File>event.target.files[0];
    console.log(this.selectedFile);
    this.uploadImage().then(() => {
      firebase.storage().ref().child(`profile_pictures/${this.account}`).getDownloadURL().then(url => {
        this.accountInfo['propicURL'] = url;
        this.db.list(`users/${this.account}`).set("propicURL", url);
      });
    })
    
  }

  uploadImage(){
    let promise = new Promise((res,rej) => {
      let uploadTask = firebase.storage().ref(`profile_pictures/${this.account}`).put(this.selectedFile);
          uploadTask.on('state_changed', function(snapshot) {
          }, function(error) {
              rej(error);
          }, function() {
          var downloadURL = uploadTask.snapshot.downloadURL;
              res(downloadURL);
          });
      });
      return promise;

  }
}

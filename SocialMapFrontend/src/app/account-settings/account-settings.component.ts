import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../services/user.service';
import { AngularFireDatabase } from '@angular/fire/database'; 
import * as firebase from 'firebase';

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
  requestFlag = false;
  followFlag = false;
  public = false;


  constructor(private user: UserService, private db: AngularFireDatabase) { }

  ngOnInit() {
    this.accountInfo = this.db.object(`users/${this.account}/`).valueChanges();
    this.db.object(`followers/${this.account}/`).valueChanges().subscribe((followers: object) => {
      let follower;
      for (follower in followers){
        if (follower == this.user.currentUser.uid){
          this.followFlag = true;
        }
        this.db.object(`users/${follower}/`).valueChanges().subscribe(followerInfo => {
          this.followers.push(followerInfo['username']);
        })
      }
    })
    this.db.object(`followRequests/${this.account}/`).valueChanges().subscribe((followRequests: object)=> {
      let request;
      for (request in followRequests){
        if (request == this.user.currentUser.uid){
          this.requestFlag = true;
        }
        this.db.object(`users/${request}/`).valueChanges().subscribe(requestInfo => {
          this.followRequests.push(requestInfo['username']);
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
    }
  }
  cancelFollowRequst(){
    let ref = firebase.database().ref(`followRequests/${this.account}/${this.user.currentUser.uid}`);
    ref.remove()
    this.requestFlag = false; 
    this.followFlag = false;
  }

  unfollow(){
    let ref = firebase.database().ref(`followers/${this.account}/${this.user.currentUser.uid}`);
    ref.remove()
    this.requestFlag = false; 
    this.followFlag = false;
  }
}

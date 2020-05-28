import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';

import 'rxjs/add/operator/switchMap';
import {switchMap} from 'rxjs/operators';

@Injectable()

export class UserService {

    currentUser = {
        uid: null,
        username: "blank"
      }; 
    
    constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase){

        this.afAuth.authState.pipe( switchMap (user => {
            if (user){
                this.currentUser.uid = user['uid'];
                return this.db.object(`/users/${user['uid']}`).valueChanges();
            }
            else{
                this.currentUser.uid = null;
                this.currentUser.username = null;
            }
            
        })).subscribe(user => {
            this.currentUser['username'] = user['username']
        })

    }

    get isLoggedIn(){
        return this.currentUser.uid ? true : false;
    }

    get hasUsername() {
        return this.currentUser.username ? true : false;
    }
  
    checkUsername(username: string) {
        username = username.toLowerCase()
        return this.db.object(`usernames/${username}`)
    }
  

    updateUsername(username: string) {
        let data = {}
        data[username.toLowerCase()] = this.currentUser.uid;
        this.currentUser.username = username;
  
        this.db.object(`/users/${this.currentUser.uid}`).update({"username": username.toLowerCase()})
        this.db.object(`/usernames`).update(data)
    }

    logout(){
        firebase.auth().signOut().then(function() {
            //success
          }).catch(function(error) {
            // An error happened.
          });
    }

}
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit {

  userSearch: string;
  userSearchResult: any;
  searchObservable: Observable<any>;

  constructor(private user: UserService) { }

  ngOnInit() {
  }

  findUsernames() {
    this.getUsernames(this.userSearch).then(snapshot => {this.setSearhcList(snapshot)})
  }

  setSearhcList(snapshot){
    this.userSearchResult = snapshot.val()
    if(this.userSearchResult){
      delete this.userSearchResult[this.user.currentUser.uid]
    }
  }

  getUsernames(userSearch: string){
    userSearch = userSearch.toLowerCase();
    var ref = firebase.database().ref("/users");
    return ref.orderByChild("username").startAt(userSearch).endAt(userSearch+'\uf8ff').limitToFirst(10).once("value")
  }
    
}

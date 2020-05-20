import { Component, OnInit, Input } from '@angular/core';
import { DataService } from '../services/data.service';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { AngularFireAuth } from '@angular/fire/auth';


@Component({
  selector: 'app-omniwindow',
  templateUrl: './omniwindow.component.html',
  styleUrls: ['./omniwindow.component.css']
})
export class OmniwindowComponent implements OnInit {

  providers = AuthProvider;
  userData;
  constructor(private data: DataService, private afAuth: AngularFireAuth) { 
    this.afAuth.onAuthStateChanged((user) => {
      this.userData = user;
    });
  }

  ngOnInit() {}

}

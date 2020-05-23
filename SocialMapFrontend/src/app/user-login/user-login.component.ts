import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthProvider } from 'ngx-auth-firebaseui';
import { AngularFireDatabase } from '@angular/fire/database'; 

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  
  providers = AuthProvider;
  usernameText: string;
  usernameAvailable: boolean;

  constructor(public user: UserService, private db: AngularFireDatabase) { }

  
  checkUsername() {
    console.log(this.user.currentUser)
    console.log(this.user.hasUsername)
    this.user.checkUsername(this.usernameText).valueChanges().subscribe(username => {
      this.usernameAvailable = (username == null)
    })
  }

  updateUsername() {
    this.user.updateUsername(this.usernameText)
  }

  logout(){
    this.user.logout();
  }

}

import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/internal/Subscription';
import { AngularFireDatabase } from '@angular/fire/database'; 
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable()

export class UserService {

    user: object;

    constructor(private db: AngularFireDatabase, private afAuth: AngularFireAuth ) {
        this.afAuth.onAuthStateChanged((user) => {
            this.user = user;
          });
    }
}
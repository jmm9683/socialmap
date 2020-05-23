import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';



@Component({
  selector: 'app-omniwindow',
  templateUrl: './omniwindow.component.html',
  styleUrls: ['./omniwindow.component.css']
})
export class OmniwindowComponent implements OnInit {

  constructor(private data: DataService, private user: UserService) {}

  ngOnInit() {}

}

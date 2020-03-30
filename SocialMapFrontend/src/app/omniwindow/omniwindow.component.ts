import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-omniwindow',
  templateUrl: './omniwindow.component.html',
  styleUrls: ['./omniwindow.component.css']
})
export class OmniwindowComponent implements OnInit {

  constructor(private data: DataService) { }

  ngOnInit() {}

}

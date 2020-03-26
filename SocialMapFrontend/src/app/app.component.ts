import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<app-search></app-search>
              <app-map></app-map>`
})
export class AppComponent {
  title = 'SocialMapFrontend';
}

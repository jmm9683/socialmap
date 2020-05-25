import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkerbroadcastComponent } from './markerbroadcast.component';

describe('MarkerbroadcastComponent', () => {
  let component: MarkerbroadcastComponent;
  let fixture: ComponentFixture<MarkerbroadcastComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkerbroadcastComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkerbroadcastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

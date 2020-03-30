import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OmniwindowComponent } from './omniwindow.component';

describe('OmniwindowComponent', () => {
  let component: OmniwindowComponent;
  let fixture: ComponentFixture<OmniwindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OmniwindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OmniwindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

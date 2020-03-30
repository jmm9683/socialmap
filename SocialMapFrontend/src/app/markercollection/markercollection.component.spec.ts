import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkercollectionComponent } from './markercollection.component';

describe('MarkercollectionComponent', () => {
  let component: MarkercollectionComponent;
  let fixture: ComponentFixture<MarkercollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkercollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkercollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

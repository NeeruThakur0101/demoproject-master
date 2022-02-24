import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTrainingAttendeesComponent } from './view-training-attendees.component';

describe('ViewTrainingAttendeesComponent', () => {
  let component: ViewTrainingAttendeesComponent;
  let fixture: ComponentFixture<ViewTrainingAttendeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTrainingAttendeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTrainingAttendeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

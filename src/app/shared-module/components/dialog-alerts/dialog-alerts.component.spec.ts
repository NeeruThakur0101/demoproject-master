import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAlertsComponent } from './dialog-alerts.component';

describe('DialogAlertsComponent', () => {
  let component: DialogAlertsComponent;
  let fixture: ComponentFixture<DialogAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

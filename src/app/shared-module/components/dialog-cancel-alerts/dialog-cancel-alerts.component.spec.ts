import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCancelAlertsComponent } from './dialog-cancel-alerts.component';

describe('DialogCancelAlertsComponent', () => {
  let component: DialogCancelAlertsComponent;
  let fixture: ComponentFixture<DialogCancelAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogCancelAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogCancelAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

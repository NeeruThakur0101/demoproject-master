import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDeleteAlertsComponent } from './dialog-delete-alerts.component';

describe('DialogDeleteAlertsComponent', () => {
  let component: DialogDeleteAlertsComponent;
  let fixture: ComponentFixture<DialogDeleteAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogDeleteAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDeleteAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

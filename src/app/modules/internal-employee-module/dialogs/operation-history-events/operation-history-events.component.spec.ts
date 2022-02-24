import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationHistoryEventsComponent } from './operation-history-events.component';

describe('OperationHistoryEventsComponent', () => {
  let component: OperationHistoryEventsComponent;
  let fixture: ComponentFixture<OperationHistoryEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationHistoryEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationHistoryEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

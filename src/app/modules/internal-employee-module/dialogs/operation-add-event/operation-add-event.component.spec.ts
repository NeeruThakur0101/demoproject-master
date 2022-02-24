import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationAddEventComponent } from './operation-add-event.component';

describe('OperationAddEventComponent', () => {
  let component: OperationAddEventComponent;
  let fixture: ComponentFixture<OperationAddEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationAddEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationAddEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

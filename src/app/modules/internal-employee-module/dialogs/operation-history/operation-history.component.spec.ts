import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationHistoryComponent } from './operation-history.component';

describe('OperationHistoryComponent', () => {
  let component: OperationHistoryComponent;
  let fixture: ComponentFixture<OperationHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

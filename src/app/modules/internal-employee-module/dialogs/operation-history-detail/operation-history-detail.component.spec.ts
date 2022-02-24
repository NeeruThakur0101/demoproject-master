import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationHistoryDetailComponent } from './operation-history-detail.component';

describe('OperationHistoryDetailComponent', () => {
  let component: OperationHistoryDetailComponent;
  let fixture: ComponentFixture<OperationHistoryDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationHistoryDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationHistoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

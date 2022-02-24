import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationCorrectionRequestComponent } from './operation-correction-request.component';

describe('OperationCorrectionRequestComponent', () => {
  let component: OperationCorrectionRequestComponent;
  let fixture: ComponentFixture<OperationCorrectionRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationCorrectionRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationCorrectionRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

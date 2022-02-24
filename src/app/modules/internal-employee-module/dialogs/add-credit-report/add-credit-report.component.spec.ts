import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCreditReportComponent } from './add-credit-report.component';

describe('AddCreditReportComponent', () => {
  let component: AddCreditReportComponent;
  let fixture: ComponentFixture<AddCreditReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCreditReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCreditReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

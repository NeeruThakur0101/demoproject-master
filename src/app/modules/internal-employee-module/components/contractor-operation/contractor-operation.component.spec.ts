import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorOperationComponent } from './contractor-operation.component';

describe('ContractorOperationComponent', () => {
  let component: ContractorOperationComponent;
  let fixture: ComponentFixture<ContractorOperationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContractorOperationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractorOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

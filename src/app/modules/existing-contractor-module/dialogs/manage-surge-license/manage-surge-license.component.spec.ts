import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSurgeLicenseComponent } from './manage-surge-license.component';

describe('ManageSurgeLicenseComponent', () => {
  let component: ManageSurgeLicenseComponent;
  let fixture: ComponentFixture<ManageSurgeLicenseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSurgeLicenseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSurgeLicenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

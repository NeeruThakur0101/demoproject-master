import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectEmailAddressComponent } from './select-email-address.component';

describe('SelectEmailAddressComponent', () => {
  let component: SelectEmailAddressComponent;
  let fixture: ComponentFixture<SelectEmailAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectEmailAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectEmailAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

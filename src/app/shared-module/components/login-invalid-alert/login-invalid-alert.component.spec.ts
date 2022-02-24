import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginInvalidAlertComponent } from './login-invalid-alert.component';

describe('LoginInvalidAlertComponent', () => {
  let component: LoginInvalidAlertComponent;
  let fixture: ComponentFixture<LoginInvalidAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginInvalidAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginInvalidAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

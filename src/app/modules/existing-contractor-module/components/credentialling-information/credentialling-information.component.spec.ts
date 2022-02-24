import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CredentiallingInformationComponent } from './credentialling-information.component';

describe('CredentiallingInformationComponent', () => {
  let component: CredentiallingInformationComponent;
  let fixture: ComponentFixture<CredentiallingInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CredentiallingInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentiallingInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

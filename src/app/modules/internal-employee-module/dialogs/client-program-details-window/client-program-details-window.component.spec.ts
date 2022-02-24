import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProgramDetailsWindowComponent } from './client-program-details-window.component';

describe('ClientProgramDetailsWindowComponent', () => {
  let component: ClientProgramDetailsWindowComponent;
  let fixture: ComponentFixture<ClientProgramDetailsWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientProgramDetailsWindowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientProgramDetailsWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

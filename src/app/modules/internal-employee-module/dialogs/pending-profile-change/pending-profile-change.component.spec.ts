import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingProfileChangeComponent } from './pending-profile-change.component';

describe('PendingProfileChangeComponent', () => {
  let component: PendingProfileChangeComponent;
  let fixture: ComponentFixture<PendingProfileChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingProfileChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingProfileChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

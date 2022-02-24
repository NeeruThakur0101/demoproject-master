import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReassignContracrtorActionComponent } from './reassign-contracrtor-action.component';

describe('ReassignContracrtorActionComponent', () => {
  let component: ReassignContracrtorActionComponent;
  let fixture: ComponentFixture<ReassignContracrtorActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassignContracrtorActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassignContracrtorActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

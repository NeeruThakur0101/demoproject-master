import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CopyCoverageProfileComponent } from './copy-coverage-profile.component';

describe('CopyCoverageProfileComponent', () => {
  let component: CopyCoverageProfileComponent;
  let fixture: ComponentFixture<CopyCoverageProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyCoverageProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyCoverageProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchContractorComponent } from './search-contractor.component';

describe('SearchContractorComponent', () => {
  let component: SearchContractorComponent;
  let fixture: ComponentFixture<SearchContractorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchContractorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

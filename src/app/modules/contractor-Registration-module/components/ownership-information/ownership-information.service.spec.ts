import { TestBed } from '@angular/core/testing';

import { OwnershipInformationService } from './ownership-information.service';

describe('OwnershipInformationService', () => {
  let service: OwnershipInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnershipInformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

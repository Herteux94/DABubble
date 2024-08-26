import { TestBed } from '@angular/core/testing';

import { FindUserService } from './find-user.service';

describe('FindUserService', () => {
  let service: FindUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FindUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

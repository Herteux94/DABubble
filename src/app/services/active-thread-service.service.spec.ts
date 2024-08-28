import { TestBed } from '@angular/core/testing';

import { ActiveThreadService } from './active-thread-service.service';

describe('ActiveThreadServiceService', () => {
  let service: ActiveThreadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveThreadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

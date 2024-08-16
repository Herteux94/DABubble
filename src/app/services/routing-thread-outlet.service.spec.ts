import { TestBed } from '@angular/core/testing';

import { RoutingThreadOutletService } from './routing-thread-outlet.service';

describe('RoutingThreadOutletService', () => {
  let service: RoutingThreadOutletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoutingThreadOutletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

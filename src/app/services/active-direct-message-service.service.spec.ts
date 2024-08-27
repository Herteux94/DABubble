import { TestBed } from '@angular/core/testing';

import { ActiveDirectMessageService } from './active-direct-message-service.service';

describe('ActiveDirectMessageServiceService', () => {
  let service: ActiveDirectMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveDirectMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { NewDirectMessageService } from './new-direct-message.service';

describe('NewDirectMessageService', () => {
  let service: NewDirectMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewDirectMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

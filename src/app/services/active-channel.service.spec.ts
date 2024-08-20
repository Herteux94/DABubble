import { TestBed } from '@angular/core/testing';

import { ActiveChannelService } from './active-channel.service';

describe('ActiveChannelService', () => {
  let service: ActiveChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ScreenSizeService } from './screen-size-service.service';

describe('ScreenSizeServiceService', () => {
  let service: ScreenSizeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenSizeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

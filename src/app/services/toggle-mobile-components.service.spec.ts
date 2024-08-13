import { TestBed } from '@angular/core/testing';

import { ToggleMobileComponentsService } from './toggle-mobile-components.service';

describe('ToggleMobileComponentsService', () => {
  let service: ToggleMobileComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleMobileComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

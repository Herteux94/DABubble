import { TestBed } from '@angular/core/testing';

import { EmojiPreloadService } from './emoji-preload.service';

describe('EmojiPreloadService', () => {
  let service: EmojiPreloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmojiPreloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

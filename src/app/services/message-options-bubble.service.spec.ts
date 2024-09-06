import { TestBed } from '@angular/core/testing';

import { MessageOptionsBubbleService } from './message-options-bubble.service';

describe('MessageOptionsBubbleService', () => {
  let service: MessageOptionsBubbleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageOptionsBubbleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

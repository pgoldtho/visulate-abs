import { TestBed, inject } from '@angular/core/testing';

import { UsIndexService } from './us-index.service';

describe('UsIndexService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsIndexService]
    });
  });

  it('should be created', inject([UsIndexService], (service: UsIndexService) => {
    expect(service).toBeTruthy();
  }));
});

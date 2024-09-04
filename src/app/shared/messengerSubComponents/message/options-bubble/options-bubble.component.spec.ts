import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsBubbleComponent } from './options-bubble.component';

describe('OptionsBubbleComponent', () => {
  let component: OptionsBubbleComponent;
  let fixture: ComponentFixture<OptionsBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsBubbleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OptionsBubbleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

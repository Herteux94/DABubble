import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateDividerComponent } from './date-divider.component';

describe('DateDividerComponent', () => {
  let component: DateDividerComponent;
  let fixture: ComponentFixture<DateDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateDividerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DateDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

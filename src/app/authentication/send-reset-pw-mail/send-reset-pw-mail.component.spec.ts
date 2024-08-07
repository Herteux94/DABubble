import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendResetPwMailComponent } from './send-reset-pw-mail.component';

describe('SendResetPwMailComponent', () => {
  let component: SendResetPwMailComponent;
  let fixture: ComponentFixture<SendResetPwMailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendResetPwMailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendResetPwMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

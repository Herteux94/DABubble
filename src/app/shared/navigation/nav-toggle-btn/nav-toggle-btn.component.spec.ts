import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavToggleBtnComponent } from './nav-toggle-btn.component';

describe('NavToggleBtnComponent', () => {
  let component: NavToggleBtnComponent;
  let fixture: ComponentFixture<NavToggleBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavToggleBtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NavToggleBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

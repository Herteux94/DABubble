import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeInputFieldComponent } from './type-input-field.component';

describe('TypeInputFieldComponent', () => {
  let component: TypeInputFieldComponent;
  let fixture: ComponentFixture<TypeInputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeInputFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TypeInputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageFullscreenDialogComponent } from './image-fullscreen-dialog.component';

describe('ImageFullscreenDialogComponent', () => {
  let component: ImageFullscreenDialogComponent;
  let fixture: ComponentFixture<ImageFullscreenDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageFullscreenDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImageFullscreenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

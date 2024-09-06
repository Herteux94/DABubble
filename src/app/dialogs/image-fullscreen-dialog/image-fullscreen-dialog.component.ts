import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-fullscreen-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-fullscreen-dialog.component.html',
  styleUrl: './image-fullscreen-dialog.component.scss',
  animations: [
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.3)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
})
export class ImageFullscreenDialogComponent {
  URL: string;
  mobile!: boolean;
  dialogRef = inject(DialogRef);
  
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    public screenSizeService: ScreenSizeService,
    private http: HttpClient,
  ) {this.URL = data.URL;}
  
}

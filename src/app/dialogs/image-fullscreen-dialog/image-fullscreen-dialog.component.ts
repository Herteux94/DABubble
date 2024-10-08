import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-image-fullscreen-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-fullscreen-dialog.component.html',
  styleUrl: './image-fullscreen-dialog.component.scss',
  animations: [
    trigger('imageFadeIn', [
      state('loading', style({ opacity: 0, transform: 'scale(0.7)' })),
      state('loaded', style({ opacity: 1, transform: 'scale(1)' })),
      transition('loading => loaded', [animate('300ms ease-out')]),
      transition('loaded => loading', [animate('200ms ease-in')]),
    ]),
    trigger('dialogAnimationFadeIn', [
      state('void', style({ opacity: 0, transform: 'scale(0.75)' })),
      state('*', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [animate('200ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
})
export class ImageFullscreenDialogComponent {
  URL: string;
  mobile!: boolean;
  dialogRef = inject(DialogRef);
  imageLoaded: boolean = false;
  imageUrl!: string;
  url = '../../../assets/img/close.svg';

  /**
   * Constructor for the ImageFullscreenDialogComponent.
   *
   * @param data The URL of the image to be displayed. This is injected by the Angular CDK Dialog service.
   * @param screenSizeService The ScreenSizeService, which provides information about the current screen size.
   * @param storageService The StorageService, which provides methods for storing and retrieving data from the browser's local storage.
   */
  constructor(
    @Inject(DIALOG_DATA) public data: any,
    public screenSizeService: ScreenSizeService,
    public storageService: StorageService
  ) {
    this.URL = data.URL;
  }

  /**
   * Sets the imageLoaded flag to true when the image is loaded.
   * This flag is used to control the animation of the image.
   */
  onImageLoad() {
    this.imageLoaded = true;
  }
}

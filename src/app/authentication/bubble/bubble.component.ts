import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

/**
 * **BubbleComponent**
 *
 * This component displays a snackbar-style notification with a slide-in and slide-out animation.
 * It can be used to show temporary messages or alerts to users within the application.
 *
 * @component
 * @selector app-bubble
 * @standalone
 * @imports CommonModule
 *
 * @example
 * ```html
 * <app-bubble [message]="'This is a notification message!'"></app-bubble>
 * ```
 */
@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" @slideInOut class="snackbar" [innerHTML]="message"></div>
  `,
  styles: [
    `
      .snackbar {
        position: fixed;
        bottom: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        right: 16px;
        font-size: 20px;
        font-weight: 700;
        background-color: rgba(68, 77, 242, 1);
        color: white;
        padding: 24px;
        border-radius: 30px 30px 0 30px;
        box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.2);
      }
      .snackbar > img {
        vertical-align: middle;
        margin-right: 10px;
        height: 40px;
      }
    `,
  ],
  animations: [
    trigger('slideInOut', [
      state(
        'void',
        style({
          transform: 'translateY(100%)',
          opacity: 0,
        })
      ),
      state(
        '*',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void => *', [animate('500ms ease-in')]),
      transition('* => void', [animate('500ms ease-out')]),
    ]),
  ],
})
export class BubbleComponent {
  /**
   * The message to be displayed inside the snackbar.
   *
   * @type {string}
   * @default ''
   */
  @Input() message: string = '';

  /**
   * Controls the visibility of the snackbar.
   *
   * @type {boolean}
   * @default false
   */
  show = false;

  /**
   * Creates an instance of BubbleComponent.
   */
  constructor() {}

  /**
   * Displays the snackbar by setting `show` to `true`.
   * The snackbar will automatically hide after 2 seconds.
   *
   * @returns {void}
   */
  public showSnackbar(): void {
    this.show = true;
    setTimeout(() => {
      this.show = false;
    }, 2000);
  }
}

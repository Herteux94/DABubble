import { Component, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordService } from '../../services/reset-password.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { CommonModule } from '@angular/common';
import { BubbleComponent } from '../bubble/bubble.component';

/**
 * **SendResetPwMailComponent**
 *
 * This component handles the process of sending a password reset email to the user.
 * It includes form validation for the email input, error handling, and displays
 * confirmation messages upon successful email dispatch using the `BubbleComponent`.
 *
 * @component
 * @selector app-send-reset-pw-mail
 * @standalone
 * @imports RouterModule, FormsModule, HttpClientModule, FocusInputDirective, CommonModule, BubbleComponent
 *
 * @example
 * ```html
 * <app-send-reset-pw-mail></app-send-reset-pw-mail>
 * ```
 */
@Component({
  selector: 'app-send-reset-pw-mail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    HttpClientModule,
    FocusInputDirective,
    CommonModule,
    BubbleComponent,
  ],
  templateUrl: './send-reset-pw-mail.component.html',
  styleUrls: ['./send-reset-pw-mail.component.scss'],
})
export class SendResetPwMailComponent {
  /**
   * The email address entered by the user for password reset.
   *
   * @type {string}
   * @default ''
   */
  email: string = '';

  /**
   * The error message related to the email input field.
   *
   * @type {string}
   * @default ''
   */
  errorMessageEmail: string = '';

  /**
   * The message to be displayed in the snackbar component.
   *
   * @type {string | null}
   * @default null
   */
  message: string | null = null;

  /**
   * Flag indicating whether the form has been submitted.
   *
   * @type {boolean}
   * @default false
   */
  formSubmitted: boolean = false;

  /**
   * Reference to the `BubbleComponent` used for displaying messages.
   *
   * @type {BubbleComponent}
   */
  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  /**
   * Creates an instance of `SendResetPwMailComponent`.
   *
   * @param {ResetPasswordService} resetPasswordService - Service responsible for handling password reset operations.
   */
  constructor(private resetPasswordService: ResetPasswordService) {}

  /**
   * Handles the form submission for sending a password reset email.
   * Validates the email input and initiates the password reset email process.
   *
   * @returns {void}
   */
  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessageEmail = '';
    if (!this.email) {
      this.errorMessageEmail = 'Bitte geben Sie Ihre Emailadresse ein.';
      return;
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.email)) {
        this.errorMessageEmail = 'Bitte geben Sie eine gültige Emailadresse ein.';
        return;
      }
    }

    this.resetPasswordService
      .sendPasswordResetEmail(this.email)
      .then(() => {
        this.message =
          '<img src="assets/img/send.png" alt="Success Icon" class="sendIcon"/>  Email sent successfully.';
        this.bubbleComponent.message = this.message;
        this.bubbleComponent.showSnackbar();
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
          this.errorMessageEmail = 'Bitte geben Sie eine gültige Emailadresse ein.';
        } else {
          this.errorMessageEmail = 'Error: ' + error.message;
        }
        this.message = '';
      });
  }

  /**
   * Listens for the Enter key press on the document and triggers the form submission.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the Enter key.
   * @returns {void}
   */
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.onSubmit();
  }

  /**
   * Navigates the user back to the previous page in the browser history.
   *
   * @returns {void}
   */
  goBack(): void {
    history.back();
  }
}

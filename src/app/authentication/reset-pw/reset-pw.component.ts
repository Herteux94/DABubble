import { Component, HostListener, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { BubbleComponent } from '../bubble/bubble.component';

/**
 * **ResetPwComponent**
 *
 * This component handles the password reset process. It allows users to enter a new password,
 * confirm it, and submit the change using an out-of-band (OOB) code received via email.
 * Upon successful password reset, it displays a confirmation message and redirects the user to the login page.
 *
 * @component
 * @selector app-reset-pw
 * @standalone
 * @imports FormsModule, FocusInputDirective, BubbleComponent
 *
 * @example
 * ```html
 * <app-reset-pw></app-reset-pw>
 * ```
 */
@Component({
  selector: 'app-reset-pw',
  standalone: true,
  imports: [
    FormsModule,
    FocusInputDirective,
    BubbleComponent
  ],
  templateUrl: './reset-pw.component.html',
  styleUrls: ['./reset-pw.component.scss']
})
export class ResetPwComponent implements OnInit {
  /**
   * The first input value for the new password.
   *
   * @type {string}
   * @default ''
   */
  inputValue: string = '';

  /**
   * The second input value for confirming the new password.
   *
   * @type {string}
   * @default ''
   */
  inputValue2: string = '';

  /**
   * The out-of-band (OOB) code used for password reset, retrieved from query parameters.
   *
   * @type {string | null}
   * @default null
   */
  oobCode: string | null = null;

  /**
   * The message to be displayed in the snackbar component.
   *
   * @type {string | null}
   * @default null
   */
  message: string | null = null;

  /**
   * Reference to the BubbleComponent used for displaying messages.
   *
   * @type {BubbleComponent}
   */
  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  /**
   * Creates an instance of ResetPwComponent.
   *
   * @param {ActivatedRoute} route - Provides access to information about a route associated with a component loaded in an outlet.
   * @param {Router} router - The Angular Router service for navigating between routes.
   * @param {ResetPasswordService} resetPasswordService - Service handling password reset operations.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordService: ResetPasswordService
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Retrieves the OOB code from query parameters and redirects to an error page if not found.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (!this.oobCode) {
      this.router.navigate(['/error']);
    }
  }

  /**
   * Checks if the two password input values match and are not empty.
   *
   * @returns {boolean} - Returns true if the input values match and are not empty, otherwise false.
   */
  inputValuesMatch(): boolean {
    return this.inputValue === this.inputValue2 && this.inputValue !== '';
  }

  /**
   * Handles the form submission for password reset.
   * Validates input values and initiates the password reset process if valid.
   *
   * @returns {void}
   */
  handleSubmit(): void {
    if (this.inputValuesMatch() && this.oobCode) {
      this.resetPassword()
        .then(() => this.handleSuccessfulReset())
        .catch((error) => this.handleError(error));
    }
  }

  /**
   * Initiates the password reset process by calling the ResetPasswordService.
   *
   * @returns {Promise<void>} - A promise that resolves when the password reset is confirmed.
   */
  private async resetPassword(): Promise<void> {
    return this.resetPasswordService.confirmPasswordReset(this.oobCode!, this.inputValue);
  }

  /**
   * Handles actions to be taken upon a successful password reset.
   * Displays a success message and redirects the user to the login page.
   *
   * @returns {void}
   */
  private handleSuccessfulReset(): void {
    this.setMessage('Password erfolgreich geändert.');
    this.showBubbleMessage();
    this.redirectToLogin();
  }

  /**
   * Handles errors that occur during the password reset process.
   * Displays an error message in the snackbar component.
   *
   * @param {any} error - The error object received from the password reset service.
   * @returns {void}
   */
  private handleError(error: any): void {
    this.setMessage('Error: ' + error.message);
    this.showBubbleMessage();
  }

  /**
   * Sets the message to be displayed in the snackbar component.
   *
   * @param {string} message - The message to display.
   * @returns {void}
   */
  private setMessage(message: string): void {
    this.message = message;
    this.bubbleComponent.message = message;
  }

  /**
   * Triggers the snackbar component to display the current message.
   *
   * @returns {void}
   */
  private showBubbleMessage(): void {
    this.bubbleComponent.showSnackbar();
  }

  /**
   * Redirects the user to the login page after a successful password reset.
   * The redirection occurs after a 2-second delay to allow the user to read the confirmation message.
   *
   * @returns {void}
   */
  private redirectToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
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
    this.handleSubmit();
  }
}

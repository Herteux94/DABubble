import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { BubbleComponent } from '../bubble/bubble.component';

/**
 * **SignUpComponent**
 *
 * This component handles user registration by allowing users to create a new account.
 * It includes form validation for name, email, and password fields, error handling,
 * and displays confirmation messages upon successful account creation using the `BubbleComponent`.
 *
 * @component
 * @selector app-sign-up
 * @standalone
 * @imports CommonModule, FormsModule, FocusInputDirective, BubbleComponent
 *
 * @example
 * ```html
 * <app-sign-up></app-sign-up>
 * ```
 */
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, FocusInputDirective, BubbleComponent],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent {
  /**
   * The error message related to the name input field.
   *
   * @type {string}
   * @default ''
   */
  errorMessageName: string = '';

  /**
   * The error message related to the email input field.
   *
   * @type {string}
   * @default ''
   */
  errorMessageEmail: string = '';

  /**
   * The error message related to the password input field.
   *
   * @type {string}
   * @default ''
   */
  errorMessagePassword: string = '';

  /**
   * The password entered by the user.
   *
   * @type {string}
   * @default ''
   */
  password: string = '';

  /**
   * The user model instance holding user data.
   *
   * @type {User}
   */
  user = new User();

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
   * Creates an instance of `SignUpComponent`.
   *
   * @param {Auth} auth - Firebase Authentication service for handling authentication.
   * @param {Router} router - Angular Router service for navigation.
   * @param {ActiveUserService} activeUserService - Service managing the active user state.
   * @param {FirestoreService} firestoreService - Service for interacting with Firestore.
   */
  constructor(
    private auth: Auth,
    private router: Router,
    private activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  /**
   * Navigates the user back to the previous page in the browser history.
   *
   * @returns {void}
   */
  goBack(): void {
    history.back();
  }

  /**
   * Validates all input fields by clearing previous error messages and validating each field individually.
   *
   * @returns {void}
   */
  validateAll(): void {
    this.clearErrorMessages();
    this.validateName();
    this.validateEmail();
    this.validatePassword();
  }

  /**
   * Clears all error messages related to input validation.
   *
   * @returns {void}
   */
  private clearErrorMessages(): void {
    this.errorMessageName = '';
    this.errorMessageEmail = '';
    this.errorMessagePassword = '';
  }

  /**
   * Validates the name input field.
   * Sets an error message if the name is not provided.
   *
   * @returns {void}
   */
  private validateName(): void {
    if (!this.user.name) {
      this.errorMessageName = 'Please enter your name.';
    }
  }

  /**
   * Validates the email input field.
   * Sets error messages if the email is not provided or is invalid.
   *
   * @returns {void}
   */
  private validateEmail(): void {
    if (!this.user.email) {
      this.errorMessageEmail = 'Please enter your email address.';
    } else if (!this.isValidEmail(this.user.email)) {
      this.errorMessageEmail = 'Please enter a valid email address.';
    }
  }

  /**
   * Checks if the provided email matches the standard email pattern.
   *
   * @param {string} email - The email address to validate.
   * @returns {boolean} - Returns true if the email is valid, otherwise false.
   */
  private isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  /**
   * Validates the password input field.
   * Sets error messages if the password is not provided or is too short.
   *
   * @returns {void}
   */
  private validatePassword(): void {
    if (!this.password) {
      this.errorMessagePassword = 'Please enter a password.';
    } else if (this.password.length < 6) {
      this.errorMessagePassword = 'The password must be at least 6 characters long.';
    }
  }

  /**
   * Handles the sign-up process by validating inputs and creating a new user account.
   * Displays confirmation messages upon successful account creation.
   *
   * @returns {Promise<void>}
   */
  async signUp(): Promise<void> {
    this.formSubmitted = true;
    this.validateAll();

    if (this.hasValidationErrors()) return;

    try {
      await this.createUserAccount();
      this.handleSuccessfulSignUp();
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  }

  /**
   * Checks if there are any validation errors present.
   *
   * @returns {boolean} - Returns true if there are validation errors, otherwise false.
   */
  private hasValidationErrors(): boolean {
    return (
      !!this.errorMessageName || !!this.errorMessageEmail || !!this.errorMessagePassword
    );
  }

  /**
   * Creates a new user account using Firebase Authentication and stores user data in Firestore.
   *
   * @returns {Promise<void>}
   */
  private async createUserAccount(): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      this.user.email,
      this.password
    );
    const activeUserID = userCredential.user.uid;
    this.user.userID = activeUserID;
    this.user.lastOnline = Date.now();
    this.user.directMessages = [activeUserID];
    this.activeUserService.setActiveUserToLocalStorage(activeUserID);
    await this.firestoreService.addUser(this.user.toJSON(), activeUserID);
  }

  /**
   * Handles actions to be taken upon successful sign-up.
   * Clears error messages, updates user status, displays a success message, and redirects to the account creation page.
   *
   * @returns {void}
   */
  private handleSuccessfulSignUp(): void {
    this.clearErrorMessages();
    this.firestoreService.updateUser({ active: true }, this.user.userID);
    this.activeUserService.loadActiveUser(this.user.userID);
    this.showSuccessMessage();
    setTimeout(() => {
      this.router.navigate(['/createAccount']);
    }, 2000);
  }

  /**
   * Displays a success message using the `BubbleComponent`.
   *
   * @returns {void}
   */
  private showSuccessMessage(): void {
    this.bubbleComponent.message = 'Account successfully created!';
    this.bubbleComponent.showSnackbar();
  }

  /**
   * Listens for the Enter key press on the document and triggers the sign-up process.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the Enter key.
   * @returns {void}
   */
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.signUp();
  }
}

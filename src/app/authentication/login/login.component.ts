import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  Auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ActiveUserService } from '../../services/active-user.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { FirestoreService } from '../../services/firestore.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { RoutingThreadOutletService } from '../../services/routing-thread-outlet.service';

/**
 * **LoginComponent**
 *
 * This component handles user authentication, including logging in with email/password,
 * logging in with Google, and guest login. It manages user input validation, error handling,
 * and redirects upon successful login.
 *
 * @component
 * @selector app-login
 * @standalone
 * @imports CommonModule, RouterModule, FormsModule, FocusInputDirective
 *
 * @example
 *
html
 * <app-login></app-login>
 *

 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FocusInputDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  /**
   * The user's email address entered in the login form.
   *
   * @type {string}
   * @default ''
   */
  email: string = '';

  /**
   * The user's password entered in the login form.
   *
   * @type {string}
   * @default ''
   */
  password: string = '';

  /**
   * Flag indicating whether the current login attempt is for a new user.
   *
   * @type {boolean}
   * @default false
   */
  newUser: boolean = false;

  /**
   * The error message to display when a login attempt fails.
   *
   * @type {string}
   * @default ''
   */
  errorMessage: string = '';

  /**
   * The type of error encountered during login, either 'email', 'password', or null.
   *
   * @type {'email' | 'password' | null}
   * @default null
   */
  errorType: 'email' | 'password' | null = null;

  /**
   * Creates an instance of LoginComponent.
   *
   * @param {Auth} auth - Firebase Authentication service for handling authentication.
   * @param {Firestore} firestore - Firebase Firestore service for database operations.
   * @param {Router} router - Angular Router for navigation.
   * @param {ActiveUserService} activeUserService - Service managing the active user state.
   * @param {FirestoreService} firestoreService - Service for interacting with Firestore.
   * @param {RoutingThreadOutletService} threadRoutingService - Service for managing thread routing.
   */
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    public activeUserService: ActiveUserService,
    private firestoreService: FirestoreService,
    private threadRoutingService: RoutingThreadOutletService
  ) { }

  /**
   * Handles the login process using email and password.
   * Validates user input, attempts to sign in, and handles success or error responses.
   *
   * @returns {void}
   */
  login(): void {
    if (this.isEmailInvalid()) return;
    if (this.isPasswordInvalid()) return;
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async (userCredential) => {
        const activeUserID = userCredential.user.uid;
        await this.handleSuccessfulLogin(activeUserID);
      })
      .catch((error) => {
        this.handleLoginError(error);
      });
  }

  /**
   * Initiates the login process using Google as the authentication provider.
   * Handles the sign-in process, user profile creation if necessary, and navigation.
   *
   * @returns {void}
   */
  loginWithGoogle(): void {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then(async (result) => {
        const activeUserID = result.user.uid;
        const displayName = result.user.displayName ?? '';
        const email = result.user.email ?? '';
        await this.handleSuccessfulLogin(activeUserID, displayName, email);
        if (this.newUser) {
          this.router.navigate(['/createAccount']);
        }
      })
      .catch((error) => {
        this.handleLoginError(
          error,
          'Error signing in with Google. Please try again.'
        );
      });
  }

  /**
   * Performs a guest login by setting predefined credentials and initiating the login process.
   *
   * @returns {void}
   */
  guestLogin(): void {
    this.email = 'info@herteux-webentwicklung.de';
    this.password = 'Bewerbungen2024';
    this.login();
  }

  /**
   * Checks if a user profile exists in Firestore. If not, creates a new user profile.
   *
   * @param {string} activeUserID - The UID of the active user.
   * @param {string} [displayName] - The display name of the user (optional).
   * @param {string} [email] - The email address of the user (optional).
   * @returns {Promise<void>}
   */
  async checkOrCreateUserProfile(activeUserID: string, displayName?: string, email?: string): Promise<void> {
    const userRef = doc(this.firestore, users/${activeUserID});
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await this.createNewUserProfile(activeUserID, displayName, email);
    } else {
      this.updateExistingUserProfile(activeUserID);
    }
  }

  /**
   * Creates a new user profile in Firestore with the provided details.
   *
   * @param {string} activeUserID - The UID of the active user.
   * @param {string} [displayName] - The display name of the user (optional).
   * @param {string} [email] - The email address of the user (optional).
   * @returns {Promise<void>}
   */
  private async createNewUserProfile(activeUserID: string, displayName?: string, email?: string): Promise<void> {
    const user = new User();
    user.userID = activeUserID;
    user.directMessages = [activeUserID];
    user.name = displayName ?? '';
    user.email = email ?? '';
    user.lastOnline = Date.now();
    this.newUser = true;
    try {
      await this.firestoreService.addUser(user.toJSON(), activeUserID);
      console.log('New user profile created in Firestore:', user);
    } catch (error) {
      console.error('Error creating user profile in Firestore:', error);
    }
  }

  /**
   * Updates the existing user profile's last online timestamp and navigates to the messenger.
   *
   * @param {string} activeUserID - The UID of the active user.
   * @returns {void}
   */
  private updateExistingUserProfile(activeUserID: string): void {
    this.firestoreService.updateUser({ lastOnline: Date.now() }, activeUserID);
    this.router.navigate(['/messenger']);
  }

  /**
   * Listens for the Enter key press on the document and triggers the login process.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the Enter key.
   * @returns {void}
   */
  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent): void {
    event.preventDefault();
    this.login();
  }

  /**
   * Validates the email input field.
   * Sets error messages if the email is invalid.
   *
   * @returns {boolean} - Returns true if the email is invalid, otherwise false.
   */
  private isEmailInvalid(): boolean {
    if (!this.email) {
      this.setError('Please enter your email address.', 'email');
      return true;
    }
    const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.setError('Please enter a valid email address.', 'email');
      return true;
    }
    return false;
  }

  /**
   * Validates the password input field.
   * Sets error messages if the password is invalid.
   *
   * @returns {boolean} - Returns true if the password is invalid, otherwise false.
   */
  private isPasswordInvalid(): boolean {
    if (!this.password) {
      this.setError('Please enter your password.', 'password');
      return true;
    }
    return false;
  }

  /**
   * Sets the error message and error type based on validation failures.
   *
   * @param {string} message - The error message to display.
   * @param {'email' | 'password' | null} type - The type of error ('email', 'password', or null).
   * @returns {void}
   */
  private setError(message: string, type: 'email' | 'password' | null): void {
    this.errorMessage = message;
    this.errorType = type;
  }

  /**
   * Handles successful login by setting the active user, checking or creating user profiles,
   * updating user status, and navigating to the messenger.
   *
   * @param {string} activeUserID - The UID of the active user.
   * @param {string} [displayName] - The display name of the user (optional).
   * @param {string} [email] - The email address of the user (optional).
   * @returns {Promise<void>}
   */
  private async handleSuccessfulLogin(activeUserID: string, displayName?: string, email?: string): Promise<void> {
    this.activeUserService.setActiveUserToLocalStorage(activeUserID);
    await this.checkOrCreateUserProfile(activeUserID, displayName, email);
    this.errorMessage = '';
    this.errorType = null;
    this.firestoreService.updateUser({ active: true }, activeUserID);
    this.activeUserService.loadActiveUser(activeUserID);
    this.router.navigate(['/messenger']);
  }

  /**
   * Handles login errors by setting appropriate error messages based on error codes.
   *
   * @param {any} error - The error object returned from the authentication process.
   * @param {string} [customMessage] - An optional custom error message to display.
   * @returns {void}
   */
  private handleLoginError(error: any, customMessage?: string): void {
    console.error('Error logging in:', error);
    if (error.code === 'auth/invalid-credential') {
      this.setError(
        'Email address and password do not match.',
        'password'
      );
    } else {
      this.setError(
        customMessage || 'Error logging in. Please try again.',
        null
      );
    }
  }
}

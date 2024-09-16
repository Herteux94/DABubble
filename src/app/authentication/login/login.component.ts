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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FocusInputDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  newUser: boolean = false;
  errorMessage: string = '';
  errorType: 'email' | 'password' | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    public activeUserService: ActiveUserService,
    private firestoreService: FirestoreService,
    private threadRoutingService: RoutingThreadOutletService
  ) { }

  login() {
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

  loginWithGoogle() {
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
          'Fehler bei der Anmeldung mit Google. Bitte versuchen Sie es erneut.'
        );
      });
  }

  guestLogin() {
    this.email = 'info@herteux-webentwicklung.de';
    this.password = 'Bewerbungen2024';
    this.login();
  }

  async checkOrCreateUserProfile( activeUserID: string, displayName?: string, email?: string) {
    const userRef = doc(this.firestore, `users/${activeUserID}`);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await this.createNewUserProfile(activeUserID, displayName, email);
    } else {
      this.updateExistingUserProfile(activeUserID);
    }
  }

  private async createNewUserProfile( activeUserID: string, displayName?: string, email?: string) {
    const user = new User();
    user.userID = activeUserID;
    user.directMessages = [activeUserID];
    user.name = displayName ?? '';
    user.email = email ?? '';
    user.lastOnline = Date.now();
    this.newUser = true;
    try {
      await this.firestoreService.addUser(user.toJSON(), activeUserID);
      console.log('Neues Benutzerprofil in Firestore erstellt:', user);
    } catch (error) {
      console.error('Fehler beim Erstellen des Benutzerprofils in Firestore:', error);
    }
  }

  private updateExistingUserProfile(activeUserID: string) {
    this.firestoreService.updateUser({ lastOnline: Date.now() }, activeUserID);
    this.router.navigate(['/messenger']);
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.login();
  }

  private isEmailInvalid(): boolean {
    if (!this.email) {
      this.setError('Bitte gib deine E-Mail-Adresse ein.', 'email');
      return true;
    }
    const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      this.setError('Bitte gib eine gültige E-Mail-Adresse ein.', 'email');
      return true;
    }
    return false;
  }

  private isPasswordInvalid(): boolean {
    if (!this.password) {
      this.setError('Bitte gib dein Passwort ein.', 'password');
      return true;
    }
    return false;
  }

  private setError(message: string, type: 'email' | 'password' | null) {
    this.errorMessage = message;
    this.errorType = type;
  }

  private async handleSuccessfulLogin( activeUserID: string, displayName?: string, email?: string) {
    this.activeUserService.setActiveUserToLocalStorage(activeUserID);
    await this.checkOrCreateUserProfile(activeUserID, displayName, email);
    this.errorMessage = '';
    this.errorType = null;
    this.firestoreService.updateUser({ active: true }, activeUserID);
    this.activeUserService.loadActiveUser(activeUserID);
    this.threadRoutingService.closeThread();
    this.router.navigate(['/messenger']);
  }

  private handleLoginError(error: any, customMessage?: string) {
    console.error('Error logging in:', error);
    if (error.code === 'auth/invalid-credential') {
      this.setError(
        'E-Mail-Adresse und Passwort stimmen nicht überein.',
        'password'
      );
    } else {
      this.setError(
        customMessage || 'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.',
        null
      );
    }
  }
}

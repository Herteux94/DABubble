import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from '../authentication.component';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getAuth, signInAnonymously } from "firebase/auth";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    AuthenticationComponent,
    FocusInputDirective,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  errorMessage: string | null = null;
  errorType: 'email' | 'password' | null = null;

  constructor(private auth: Auth, private router: Router) {}

  // Methode für E-Mail/Passwort-Login
  login(email: string, password: string) {
    if (!email) {
      this.errorMessage = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
      this.errorType = 'email';
      return;
    }

    if (!password) {
      this.errorMessage = 'Bitte geben Sie Ihr Passwort ein.';
      this.errorType = 'password';
      return;
    }

    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        this.errorMessage = null;
        this.errorType = null;
        this.router.navigate(['/messenger']);
      })
      .catch((error) => {
        console.error('Error logging in:', error);

        // Fehlercode-Abfrage
        if (error.code === 'auth/invalid-credential') {
          this.errorMessage = 'E-Mail-Adresse und Passwort stimmen nicht überein.';
          this.errorType = 'password';
        } else {
          this.errorMessage = 'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.';
          this.errorType = null;
        }
      });
  }

  // Methode für Google-Login
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then((result) => {
        console.log('User signed in with Google:', result.user);
        this.errorMessage = null;
        this.errorType = null;
        this.router.navigate(['/messenger']);
      })
      .catch((error) => {
        console.error('Error during Google sign-in:', error);
        this.errorMessage = 'Fehler bei der Anmeldung mit Google. Bitte versuchen Sie es erneut.';
        this.errorType = null;
      });
  }
}

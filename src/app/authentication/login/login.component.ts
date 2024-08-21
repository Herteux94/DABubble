import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  @ViewChild('emailInput', { static: true }) emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput', { static: true }) passwordInput!: ElementRef<HTMLInputElement>;

  errorMessage: string | null = null;
  errorType: 'email' | 'password' | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    public activeUserService: ActiveUserService
  ) {}

  // Methode für E-Mail/Passwort-Login
  login() {
    const email = this.emailInput.nativeElement.value;
    const password = this.passwordInput.nativeElement.value;

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
      .then(async (userCredential) => {
        const activeUserID = userCredential.user.uid;
        await this.checkOrCreateUserProfile(activeUserID, userCredential.user.email);
        this.errorMessage = null;
        this.errorType = null;
        this.activeUserService.loadActiveUser(activeUserID);  // Setze den aktiven Benutzer
        this.router.navigate(['/messenger']);
      })
      .catch((error) => {
        console.error('Error logging in:', error);

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
      .then(async (result) => {
        const activeUserID = result.user.uid;
        await this.checkOrCreateUserProfile(activeUserID, result.user.email);
        this.errorMessage = null;
        this.errorType = null;
        this.activeUserService.loadActiveUser(activeUserID);  // Setze den aktiven Benutzer
        this.router.navigate(['/messenger']);
      })
      .catch((error) => {
        console.error('Error during Google sign-in:', error);
        this.errorMessage = 'Fehler bei der Anmeldung mit Google. Bitte versuchen Sie es erneut.';
        this.errorType = null;
      });
  }

  private async checkOrCreateUserProfile(activeUserID: string, email: string | null) {
    const userRef = doc(this.firestore, `users/${activeUserID}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      try {
        await setDoc(userRef, {
          name: '',
          profileImg: '',
          email: email,
          active: true,
          lastOnline: new Date().toISOString(),
          channels: [],
          directMessages: []
        });
        console.log('Neues Benutzerprofil in Firestore erstellt');
      } catch (error) {
        console.error('Fehler beim Erstellen des Benutzerprofils in Firestore:', error);
      }
    } else {
      console.log('Benutzerprofil existiert bereits:', userSnap.data());
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.login();
  }
}

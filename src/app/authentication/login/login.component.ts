import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { ActiveUserService } from '../../services/active-user.service';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { FirestoreService } from '../../services/firestore.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, FormsModule, FocusInputDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  errorMessage: string = '';
  errorType: 'email' | 'password' | null = null;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    public activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  // Methode für E-Mail/Passwort-Login
  login() {
    if (!this.email) {
      this.errorMessage = 'Bitte deine E-Mail-Adresse ein.';
      this.errorType = 'email';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Bitte gib dein Passwort ein.';
      this.errorType = 'password';
      return;
    }

    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async (userCredential) => {
        const activeUserID = userCredential.user.uid;
        this.activeUserService.setActiveUserToLocalStorage(activeUserID);
        await this.checkOrCreateUserProfile(activeUserID);
        this.errorMessage = '';
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
        await this.checkOrCreateUserProfile(activeUserID);
        this.errorMessage = '';
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

  async checkOrCreateUserProfile(activeUserID: string) {
    const userRef = doc(this.firestore, `users/${activeUserID}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      let user = new User();
      user.userID = activeUserID;
      user.email = this.email;
      user.lastOnline = Date.now();
      try {
        await this.firestoreService.addUser(user.toJSON());
        console.log('Neues Benutzerprofil in Firestore erstellt: ', user);
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

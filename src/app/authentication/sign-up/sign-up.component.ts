import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, FocusInputDirective],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  errorMessageName: string = '';
  errorMessageEmail: string = '';
  errorMessagePassword: string = '';
  errorMessageGeneral: string = '';
  password: string = '';
  user = new User();

  constructor(
    private auth: Auth,
    private router: Router,
    private activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  signUp() {
    let isValid = true;

    // Überprüfen, ob der Name eingegeben wurde
    if (!this.user.name) {
      this.errorMessageName = 'Bitte gib deinen Namen ein.';
      isValid = false;
    } else {
      this.errorMessageName = '';
    }

    // Überprüfen, ob die E-Mail-Adresse eingegeben wurde
    if (!this.user.email) {
      this.errorMessageEmail = 'Bitte gib deine E-Mail-Adresse ein.';
      isValid = false;
    } else {
      this.errorMessageEmail = '';
    }

    // Überprüfen, ob das Passwort eingegeben wurde
    if (!this.password) {
      this.errorMessagePassword = 'Bitte gib ein Passwort ein.';
      isValid = false;
    } else if (this.password.length < 6) {
      this.errorMessagePassword = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
      isValid = false;
    } else {
      this.errorMessagePassword = '';
    }

    if (!isValid) {
      return;
    }

    createUserWithEmailAndPassword(this.auth, this.user.email, this.password)
      .then(async (userCredential) => {
        const activeUserID = userCredential.user.uid;
        try {
          this.user.userID = activeUserID;
          this.user.lastOnline = Date.now();
          this.activeUserService.setActiveUserToLocalStorage(activeUserID);
          await this.firestoreService.addUser(this.user.toJSON());
          this.errorMessageName = '';
          this.errorMessageEmail = '';
          this.errorMessagePassword = '';
          this.errorMessageGeneral = '';
          console.log('User successfully signed up and profile created. User: ', this.user);
          this.activeUserService.loadActiveUser(activeUserID);
          this.router.navigate(['/createAccount']);
        } catch (error) {
          console.error('Error saving user profile to Firestore:', error);
          this.errorMessageGeneral = 'Fehler beim Speichern des Benutzerprofils. Bitte versuchen Sie es erneut.';
        }
      })
      .catch((error) => {
        console.error('Error during sign-up:', error);
        this.errorMessageGeneral = 'Fehler bei der Kontoerstellung. Bitte versuchen Sie es erneut.';
      });
  }

  goBack() {
    history.back();
  }
}

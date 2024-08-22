import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  errorMessage: string = '';
  password: string = '';
  user = new User;

  constructor(
    private auth: Auth,
    private router: Router,
    private activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  signUp() {
    if (!this.user.name) {
      this.errorMessage = 'Bitte gin deinen Namen ein.';
      return;
    }

    if (!this.user.email) {
      this.errorMessage = 'Bitte deine E-Mail-Adresse ein.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Bitte geben ein Passwort ein.';
      return;
    }

    createUserWithEmailAndPassword(this.auth, this.user.email, this.password)
      .then(async (userCredential) => {
        const activeUserID = userCredential.user.uid;
        try {
          this.user.userID = activeUserID;
          this.user.lastOnline = Date.now();
          this.activeUserService.setActiveUserToLocalStorage(this.user.userID);
          await this.firestoreService.addUser(this.user.toJSON());
          this.activeUserService.activeUser = this.user;
          this.errorMessage = '';
          console.log('User successfully signed up and profile created. ActiveUser: ');
          this.router.navigate(['/createAccount']);
        } catch (error) {
          console.error('Error saving user profile to Firestore:', error);
          this.errorMessage = 'Fehler beim Speichern des Benutzerprofils. Bitte versuchen Sie es erneut.';
        }
      })
      .catch((error) => {
        console.error('Error during sign-up:', error);
        this.errorMessage = 'Fehler bei der Kontoerstellung. Bitte versuchen Sie es erneut.';
      });
  }

  goBack() {
    history.back();
  }

}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  errorMessage: string | null = null;
  password: string = '';
  user = new User;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private activeUserService: ActiveUserService
  ) {}

  signUp() {
    if (!this.user.name) {
      this.errorMessage = 'Bitte geben Sie Ihren Namen ein.';
      return;
    }

    if (!this.user.email) {
      this.errorMessage = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Bitte geben Sie Ihr Passwort ein.';
      return;
    }

    createUserWithEmailAndPassword(this.auth, this.user.email, this.password)
      .then(async (userCredential) => {
        const activeUserID = userCredential.user.uid;
        try {
          await this.createUserProfile(activeUserID);
          this.user.userID = activeUserID;
          this.activeUserService.activeUser = this.user;
          this.errorMessage = null;
          console.log('User successfully signed up and profile created.');
          this.router.navigate(['/messenger']);
          console.log(this.activeUserService.activeUser);
          
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

  private async createUserProfile(activeUserID: string) {
    const userRef = doc(this.firestore, `users/${activeUserID}`);
    this.user.lastOnline = new Date().toISOString();
      await setDoc(userRef, this.user.toJSON());
    console.log('New user profile created in Firestore with activeUserID:', activeUserID);
  }
}

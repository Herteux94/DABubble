import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    RouterModule,
    FocusInputDirective,
    CommonModule,
    FormsModule 
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(private auth: Auth, private router: Router) {}

  signUp() {
    if (!this.name) {
      this.errorMessage = 'Bitte geben Sie Ihren Namen ein.';
      return;
    }

    if (!this.email) {
      this.errorMessage = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Bitte geben Sie Ihr Passwort ein.';
      return;
    }

    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then((userCredential) => {
        // Benutzer erfolgreich erstellt
        console.log('User signed up:', userCredential.user);

        // Optionale zusätzliche Logik (z.B. Speichern des Namens)
        // userCredential.user.updateProfile({
        //   displayName: this.name
        // });

        this.errorMessage = null;
        this.router.navigate(['/messenger']);
      })
      .catch((error) => {
        console.error('Error during sign-up:', error);

        // Fehlerbehandlung
        this.errorMessage = 'Fehler bei der Kontoerstellung. Bitte versuchen Sie es erneut.';
      });
  }
}

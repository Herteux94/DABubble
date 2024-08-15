import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from '../authentication.component';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    AuthenticationComponent,
    FocusInputDirective  // Jetzt korrekt importiert, da standalone
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  errorMessage: string | null = null;

  constructor(private auth: Auth, private router: Router) {}

  login(email: string, password: string) {
    if (!email || !password) {
      this.errorMessage = 'Bitte geben Sie sowohl Ihre E-Mail-Adresse als auch Ihr Passwort ein.';
      return;
    }

    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        console.log('User logged in:', userCredential.user);
        this.errorMessage = null;
        this.router.navigate(['/messenger']); // Weiterleitung zu /messenger nach erfolgreicher Anmeldung
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        this.errorMessage = 'Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.';
      });
  }
}

import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { ActiveUserService } from '../../services/active-user.service';
import { FirestoreService } from '../../services/firestore.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { BubbleComponent } from '../bubble/bubble.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, FocusInputDirective, BubbleComponent],
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

  validationStarted: boolean = false;

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(
    private auth: Auth,
    private router: Router,
    private activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  startValidation() {
    if (!this.validationStarted) {
      this.validationStarted = true;
      this.validateAll();
    }
  }

  validateAll() {
    if (this.validationStarted) {
      this.validateName();
      this.validateEmail();
      this.validatePassword();
    }
  }

  validateName() {
    if (!this.user.name) {
      this.errorMessageName = 'Bitte gib deinen Namen ein.';
    } else {
      this.errorMessageName = '';
    }
  }

  validateEmail() {
    if (!this.user.email) {
      this.errorMessageEmail = 'Bitte gib deine E-Mail-Adresse ein.';
    } else {
      this.errorMessageEmail = '';
    }
  }

  validatePassword() {
    if (!this.password) {
      this.errorMessagePassword = 'Bitte gib ein Passwort ein.';
    } else if (this.password.length < 6) {
      this.errorMessagePassword = 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    } else {
      this.errorMessagePassword = '';
    }
  }

  async signUp() {
    this.validateAll();

    if (this.errorMessageName || this.errorMessageEmail || this.errorMessagePassword) {
      return; // Wenn es Fehler gibt, wird der Sign-Up-Prozess abgebrochen.
    }

    try {
      this.bubbleComponent.message = 'Konto erfolgreich erstellt!';
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.user.email, this.password);
      const activeUserID = userCredential.user.uid;

      this.user.userID = activeUserID;
      this.user.lastOnline = Date.now();
      this.activeUserService.setActiveUserToLocalStorage(activeUserID);
      await this.firestoreService.addUser(this.user.toJSON());
      this.errorMessageGeneral = '';
      console.log('User successfully signed up and profile created. User: ', this.user);
      this.activeUserService.loadActiveUser(activeUserID);

      // Snackbar anzeigen
      this.bubbleComponent.showSnackbar();

      // Warten, bis die Snackbar-Animation abgeschlossen ist, bevor das Routing ausgeführt wird
      setTimeout(() => {
        this.router.navigate(['/createAccount']);
      }, 2000); // Dauer der Snackbar-Anzeige

    } catch (error) {
      console.error('Error during sign-up:', error);
      this.errorMessageGeneral = 'Fehler bei der Kontoerstellung. Bitte versuchen Sie es erneut.';
    }
  }

  goBack() {
    history.back();
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.signUp();
  }
}

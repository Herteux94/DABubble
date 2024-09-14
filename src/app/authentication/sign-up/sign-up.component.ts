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
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent {
  errorMessageName: string = '';
  errorMessageEmail: string = '';
  errorMessagePassword: string = '';

  password: string = '';
  user = new User();
  formSubmitted: boolean = false;

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(
    private auth: Auth,
    private router: Router,
    private activeUserService: ActiveUserService,
    private firestoreService: FirestoreService
  ) {}

  goBack() {
    history.back();
  }

  validateAll() {
    this.errorMessageName = '';
    this.errorMessageEmail = '';
    this.errorMessagePassword = '';
    if (!this.user.name) {
      this.errorMessageName = 'Bitte gib deinen Namen ein.';
    }
    if (!this.user.email) {
      this.errorMessageEmail = 'Bitte gib deine E-Mail-Adresse ein.';
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.user.email)) {
        this.errorMessageEmail = 'Bitte gib eine gültige E-Mail-Adresse ein.';
      }
    }
    if (!this.password) {
      this.errorMessagePassword = 'Bitte gib ein Passwort ein.';
    } else if (this.password.length < 6) {
      this.errorMessagePassword =
        'Das Passwort muss mindestens 6 Zeichen lang sein.';
    }
  }

  async signUp() {
    this.formSubmitted = true;
    this.validateAll();
    if (
      this.errorMessageName ||
      this.errorMessageEmail ||
      this.errorMessagePassword
    ) {
      return;
    }
    try {
      this.bubbleComponent.message = 'Konto erfolgreich erstellt!';
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        this.user.email,
        this.password
      );
      const activeUserID = userCredential.user.uid;
      this.user.userID = activeUserID;
      this.user.lastOnline = Date.now();
      this.user.directMessages = [activeUserID];
      this.activeUserService.setActiveUserToLocalStorage(activeUserID);
      await this.firestoreService.addUser(this.user.toJSON(), activeUserID);
      this.errorMessageName = '';
      this.errorMessageEmail = '';
      this.errorMessagePassword = '';
      this.firestoreService.updateUser({ active: true }, activeUserID);
      this.activeUserService.loadActiveUser(activeUserID);
      this.bubbleComponent.showSnackbar();
      setTimeout(() => {
        this.router.navigate(['/createAccount']);
      }, 2000);
    } catch (error) {
      console.error('Error during sign-up:', error);
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.signUp();
  }
}

import { Component, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordService } from '../../services/reset-password.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { CommonModule } from '@angular/common';
import { BubbleComponent } from '../bubble/bubble.component';

@Component({
  selector: 'app-send-reset-pw-mail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    HttpClientModule,
    FocusInputDirective,
    CommonModule,
    BubbleComponent,
  ],
  templateUrl: './send-reset-pw-mail.component.html',
  styleUrls: ['./send-reset-pw-mail.component.scss'],
})
export class SendResetPwMailComponent {
  email: string = '';
  errorMessageEmail: string = '';
  message: string | null = null;
  formSubmitted: boolean = false; 

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(private resetPasswordService: ResetPasswordService) {}

  onSubmit() {
    this.formSubmitted = true;
    this.errorMessageEmail = '';

    if (!this.email) {
      this.errorMessageEmail = 'Bitte gib deine E-Mail-Adresse ein.';
      return;
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(this.email)) {
        this.errorMessageEmail = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        return;
      }
    }

    this.resetPasswordService
      .sendPasswordResetEmail(this.email)
      .then(() => {
        this.message =
          '<img src="assets/img/send.png" alt="Success Icon" class="sendIcon"/>  E-Mail gesendet';
        this.bubbleComponent.message = this.message;
        this.bubbleComponent.showSnackbar();
      })
      .catch((error) => {
        if (error.code === 'auth/invalid-email') {
          this.errorMessageEmail = 'Bitte gib eine gültige E-Mail-Adresse ein.';
        } else {
          this.errorMessageEmail = 'Fehler: ' + error.message;
        }
        this.message = '';
      });
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.onSubmit();
  }

  goBack() {
    history.back();
  }
}

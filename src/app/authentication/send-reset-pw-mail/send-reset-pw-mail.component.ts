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
    BubbleComponent
  ],
  templateUrl: './send-reset-pw-mail.component.html',
  styleUrls: ['./send-reset-pw-mail.component.scss']
})
export class SendResetPwMailComponent {
  email: string = '';
  errorMessageEmail: string = '';  // Neue Variable für E-Mail-Fehlermeldung
  message: string | null = null;
  formSubmitted: boolean = false;  // Wird gesetzt, wenn das Formular abgeschickt wird

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(private resetPasswordService: ResetPasswordService) { }

  onSubmit() {
    this.formSubmitted = true;  // Formular wurde abgeschickt


    this.resetPasswordService.sendPasswordResetEmail(this.email)
      .then(() => {
        this.message = '<img src="assets/img/send.png" alt="Success Icon" class="sendIcon"/>  E-Mail gesendet';
        this.bubbleComponent.message = this.message;
        this.bubbleComponent.showSnackbar();  // Snackbar wird nur bei Erfolg aktiviert
      })
      .catch((error) => {
        // Überprüfen, ob es sich um einen invalid-email Fehler handelt und die Nachricht anpassen
        if (error.code === 'auth/invalid-email') {
          this.errorMessageEmail = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        } else {
          this.errorMessageEmail = 'Fehler: ' + error.message;
        }
        this.message = '';  // Keine Snackbar bei Fehlern
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

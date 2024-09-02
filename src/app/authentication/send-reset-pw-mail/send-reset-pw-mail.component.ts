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
  message: string | null = null;

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(private resetPasswordService: ResetPasswordService) { }

  onSubmit() {
    this.resetPasswordService.resetPassword(this.email)
      .then(() => {
        this.message = '<img src="assets/img/send.png" alt="Success Icon" class="sendIcon"/>  E-Mail gesendet';
        this.bubbleComponent.message = this.message;
        this.bubbleComponent.showSnackbar();  // Snackbar wird hier aktiviert
      })
      .catch((error) => {
        this.message = 'Error: ' + error.message;
        this.bubbleComponent.message = this.message;
        this.bubbleComponent.showSnackbar();  // Snackbar wird auch bei Fehler aktiviert
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

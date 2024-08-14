import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordService } from '../../services/reset-password.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';

@Component({
  selector: 'app-send-reset-pw-mail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    HttpClientModule,
    FocusInputDirective
  ],
  templateUrl: './send-reset-pw-mail.component.html',
  styleUrls: ['./send-reset-pw-mail.component.scss']
})
export class SendResetPwMailComponent {
  inputValue: string = '';

  constructor(private resetPasswordService: ResetPasswordService) {}

  sendResetEmail() {
    if (this.inputValue) {
      console.log('Sende E-Mail-Adresse:', this.inputValue);  // Debugging der gesendeten E-Mail-Adresse
      this.resetPasswordService.sendResetPasswordEmail(this.inputValue)
        .subscribe({
          next: (response) => console.log('Serverantwort:', response),
          error: (error) => console.error('Fehler bei der Anfrage:', error),
        });
    } else {
      console.error('E-Mail-Adresse ist leer.');
    }
  }
}

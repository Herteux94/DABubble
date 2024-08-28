import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResetPasswordService } from '../../services/reset-password.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-send-reset-pw-mail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    HttpClientModule,
    FocusInputDirective,
    CommonModule
  ],
  templateUrl: './send-reset-pw-mail.component.html',
  styleUrls: ['./send-reset-pw-mail.component.scss']
})
export class SendResetPwMailComponent {
  email: string = '';
  message: string | null = null;

  constructor(private resetPasswordService: ResetPasswordService) { }

  onSubmit() {
    this.resetPasswordService.resetPassword(this.email)
      .then(() => {
        this.message = 'Password reset email sent. Please check your inbox.';
      })
      .catch((error) => {
        this.message = 'Error: ' + error.message;
      });
  }

  goBack() {
    history.back();
  }
}

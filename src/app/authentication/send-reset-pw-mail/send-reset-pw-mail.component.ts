import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-send-reset-pw-mail',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule
  ],
  templateUrl: './send-reset-pw-mail.component.html',
  styleUrl: './send-reset-pw-mail.component.scss'
})
export class SendResetPwMailComponent {
  inputValue: string = '';
}

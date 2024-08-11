import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-pw',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './reset-pw.component.html',
  styleUrl: './reset-pw.component.scss'
})
export class ResetPwComponent {
  inputValue: string = '';
  inputValue2: string = '';

  inputValuesMatch(): boolean {
    return this.inputValue === this.inputValue2 && this.inputValue !== '';
  }
}

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    RouterModule,
    FocusInputDirective
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {

}

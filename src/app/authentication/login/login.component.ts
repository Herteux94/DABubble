import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from '../authentication.component';
import { FocusInputDirective } from '../../directives/focus-input.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    AuthenticationComponent,
    FocusInputDirective  // Jetzt korrekt importiert, da standalone
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

}

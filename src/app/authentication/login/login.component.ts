import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthenticationComponent } from '../authentication.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    AuthenticationComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}

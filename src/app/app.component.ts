import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { StartAnimationComponent } from './start-animation/start-animation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AuthenticationComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    StartAnimationComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'da-bubble';

  showAnimation: boolean = true;

  ngOnInit(): void {
    setTimeout(() => {
      this.showAnimation = false;
    }, 10000);
  }
}

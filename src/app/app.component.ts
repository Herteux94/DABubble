import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { RoutingThreadOutletService } from './services/routing-thread-outlet.service';

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
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'da-bubble';

  constructor(private routingThreadOutletService: RoutingThreadOutletService) {}
  ngOnInit(): void {
    // if (!this.routingThreadOutletService.threadOpenDesktop) {
    //   this.routingThreadOutletService.closeThread();
    // }
  }
}

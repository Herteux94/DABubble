import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationComponent } from './authentication/authentication.component';
import { FirestoreService } from './services/firestore.service';
import { ActiveUserService } from './services/active-user.service';

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
export class AppComponent {
  title = 'da-bubble';

  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
  ) {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // Set initial status
      this.updateOnlineStatus(navigator.onLine);

      // Listen for online and offline events
      window.addEventListener('online', () => this.updateOnlineStatus(true));
      window.addEventListener('offline', () => this.updateOnlineStatus(false));
    } else {
      console.log('navigator undefined');
    }
  }

  private updateOnlineStatus(isOnline: boolean) {
    const userID = this.activeUserService.activeUser?.userID;

    if (userID) {
      console.log(`User set ${isOnline ? 'online' : 'offline'}`);
      this.firestoreService.updateUser({ active: isOnline }, userID);
    }
  }
}

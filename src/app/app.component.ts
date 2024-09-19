import { Component, HostListener, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  title = 'da-bubble';

  /**
   * Constructor for the AppComponent.
   *
   * Injects the FirestoreService and ActiveUserService.
   *
   * If the browser is online, it sets the online status to true.
   * If the browser is offline, it sets the online status to false.
   *
   * It also sets up event listeners for the online and offline events.
   * When the online event is triggered, it sets the online status to true.
   * When the offline event is triggered, it sets the online status to false.
   *
   * @param firestoreService Injected service to interact with Firestore.
   * @param activeUserService Injected service to get the currently active user.
   */
  constructor(
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService
  ) {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      this.updateOnlineStatus(navigator.onLine);

      window.addEventListener('online', () => this.updateOnlineStatus(true));
      window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }
  }

  /**
   * Lifecycle hook that is called after the component is initialized.
   *
   * If there is an active user, it updates the user's document in Firestore
   * to set the active field to true.
   *
   * If there is no active user, it waits for 2 seconds and then checks again
   * whether there is an active user. If there is one, it updates the user's
   * document in Firestore to set the active field to true.
   */
  ngOnInit(): void {
    if (this.activeUserService.activeUser) {
      this.firestoreService.updateUser(
        { active: true },
        this.activeUserService.activeUser.userID
      );
    } else {
      setTimeout(() => {
        if (this.activeUserService.activeUser) {
          this.firestoreService.updateUser(
            { active: true },
            this.activeUserService.activeUser.userID
          );
        }
      }, 1000);
    }
  }

  /**
   * Updates the user's document in Firestore to set the active field to
   * the given boolean value. This is used to set the user's online status
   * in Firestore when the user's online status changes.
   *
   * @param isOnline Whether the user is online or not.
   */
  private updateOnlineStatus(isOnline: boolean) {
    const userID = this.activeUserService.activeUser?.userID;

    if (userID) {
      this.firestoreService.updateUser({ active: isOnline }, userID);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  /**
   * This function is called when the user closes the browser window or navigates
   * away from the app. It sets the user's online status in Firestore to false.
   * @param event The event object that triggered this function.
   */
  unloadHandler(event: Event) {
    this.firestoreService.updateUser(
      { active: false },
      this.activeUserService.activeUser.userID
    );
  }
}

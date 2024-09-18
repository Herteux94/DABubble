import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveChannelService } from './active-channel.service';

@Injectable({
  providedIn: 'root',
})
export class RoutingThreadOutletService {
  threadOpenDesktop!: boolean;
  animateThreadDesktop!: boolean;

  /**
   * Constructor for the RoutingThreadOutletService.
   *
   * @param router Injected service to navigate within the app.
   * @param route Injected service to get the active route.
   * @param activeChannelService Injected service to get the active channel.
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private activeChannelService: ActiveChannelService
  ) {}

  /**
   * Closes the thread view on the desktop.
   *
   * When called, it sets the threadOpenDesktop flag to false and
   * navigates to the main messenger view after a 350ms delay.
   */
  closeThread() {
    this.animateThreadDesktop = false;
    setTimeout(() => {
      this.threadOpenDesktop = false;
      this.router.navigate(['/messenger', { outlets: { thread: null } }], {
        relativeTo: this.route.parent,
      });
    }, 350);
  }

  /**
   * Opens the thread view on the desktop.
   *
   * When called, it sets the threadOpenDesktop flag to true.
   */
  openThread() {
    this.threadOpenDesktop = true;
    this.animateThreadDesktop = true;
  }

  /**
   * Navigates to the thread view on mobile devices.
   *
   * When called, it navigates to the thread view with the given messageID
   * and the active channel ID.
   * @param messageID The ID of the message to navigate to.
   */
  navigateToThreadMobile(messageID: string) {
    this.router.navigate([
      `/messenger/channel/${this.activeChannelService.activeChannel.channelID}/threadM`,
      messageID,
    ]);
  }

  /**
   * Navigates to the thread view on desktop devices.
   *
   * When called, it navigates to the thread view with the given messageID
   * and the active channel ID.
   * @param messageID The ID of the message to navigate to.
   */
  navigateToThreadDesktop(messageID: string) {
    this.router.navigate([
      '/messenger',
      { outlets: { thread: ['thread', messageID] } },
    ]);
  }
}

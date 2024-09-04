import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiveChannelService } from './active-channel.service';

@Injectable({
  providedIn: 'root',
})
export class RoutingThreadOutletService {
  threadOpenDesktop!: boolean;
  activeThreadChannelName!: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private activeChannelService: ActiveChannelService
  ) {}

  closeThread() {
    this.threadOpenDesktop = false;
    setTimeout(() => {
      this.router.navigate(['/messenger', { outlets: { thread: null } }], {
        relativeTo: this.route.parent,
      });
    }, 350);
  }

  openThread() {
    this.threadOpenDesktop = true;
    this.loadActiveThreadChannelName();
  }

  loadActiveThreadChannelName() {
    this.activeThreadChannelName = this.activeChannelService.activeChannel.name;
  }
}

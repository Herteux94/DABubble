import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoutingThreadOutletService {
  threadOpenDesktop!: boolean;

  constructor(private router: Router, private route: ActivatedRoute) {}

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
  }
}

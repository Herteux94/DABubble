import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';
import { ScreenSizeService } from '../../../services/screen-size-service.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  mobile!: boolean;
  dialog = inject(Dialog);
  
  @Input() isChannel!: boolean;

  constructor(public threadRoutingService: RoutingThreadOutletService, private screenSizeService: ScreenSizeService, private router: Router) {}

  openInviteDialog() {
    this.dialog.open(ProfileDialogComponent, {
    });
  }

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  navigateToThread() {
    if(this.mobile) {
      this.router.navigate(['/messenger/threadM']);
    } else {
      this.router.navigate(['/messenger', {outlets: {thread: ['thread']}}]);
    }

    this.threadRoutingService.openThread();
  }
}

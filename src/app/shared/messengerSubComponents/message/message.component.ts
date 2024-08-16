import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';
import { RoutingThreadOutletService } from '../../../services/routing-thread-outlet.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  dialog = inject(Dialog);
  
  @Input() isChannel!: boolean;

  constructor(public threadRoutingService: RoutingThreadOutletService) {}

  openInviteDialog() {
    this.dialog.open(ProfileDialogComponent, {
    });
  }
}

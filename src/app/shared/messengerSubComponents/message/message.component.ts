import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToggleMobileComponentsService } from '../../../services/toggle-mobile-components.service';
import { ProfileDialogComponent } from '../../../dialogs/profile-dialog/profile-dialog.component';
import { Dialog, DIALOG_DATA, DialogModule } from '@angular/cdk/dialog';

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

  constructor(public toggleMobileComService: ToggleMobileComponentsService) {}

  openInviteDialog() {
    this.dialog.open(ProfileDialogComponent, {
    });
  }
}

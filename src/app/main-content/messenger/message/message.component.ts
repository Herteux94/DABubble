import { Component } from '@angular/core';
import { ThreadServiceService } from '../../../services/thread-service.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ToggleMobileComponentsService } from '../../../services/toggle-mobile-components.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {

  constructor(public threadService: ThreadServiceService, public toggleMobileComService: ToggleMobileComponentsService) {}

}

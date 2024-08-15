import { Component, Input } from '@angular/core';
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

  @Input() isChannel!: boolean;

  constructor(public toggleMobileComService: ToggleMobileComponentsService) {}

}

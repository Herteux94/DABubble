import { Component } from '@angular/core';
import { ThreadServiceService } from '../../../services/thread-service.service';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent {

  constructor(public threadService: ThreadServiceService) {}

}

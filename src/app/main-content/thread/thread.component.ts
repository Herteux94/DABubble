import { Component } from '@angular/core';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';
import { ActiveChannelService } from '../../services/active-channel.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [SubHeaderComponent, MessageComponent, TypeInputFieldComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  constructor(public activeChannelService: ActiveChannelService) {}
}

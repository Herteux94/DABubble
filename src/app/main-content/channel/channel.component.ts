import { Component } from '@angular/core';
import { DateDividerComponent } from '../../shared/messengerSubComponents/date-divider/date-divider.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { OwnMessageComponent } from '../../shared/messengerSubComponents/own-message/own-message.component';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [DateDividerComponent, MessageComponent, OwnMessageComponent, SubHeaderComponent, TypeInputFieldComponent],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

}

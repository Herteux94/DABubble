import { Component } from '@angular/core';
import { SubHeaderComponent } from './sub-header/sub-header.component';
import { MessageComponent } from './message/message.component';
import { OwnMessageComponent } from './own-message/own-message.component';
import { TypeInputFieldComponent } from './type-input-field/type-input-field.component';
import { DateDividerComponent } from './date-divider/date-divider.component';

@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [SubHeaderComponent, MessageComponent, OwnMessageComponent, TypeInputFieldComponent, DateDividerComponent],
  templateUrl: './messenger.component.html',
  styleUrl: './messenger.component.scss'
})
export class MessengerComponent {

}

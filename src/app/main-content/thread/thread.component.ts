import { Component } from '@angular/core';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { MessageComponent } from '../../shared/messengerSubComponents/message/message.component';
import { OwnMessageComponent } from '../../shared/messengerSubComponents/own-message/own-message.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [SubHeaderComponent, MessageComponent, OwnMessageComponent, TypeInputFieldComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}

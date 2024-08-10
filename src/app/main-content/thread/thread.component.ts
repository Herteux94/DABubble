import { Component } from '@angular/core';
import { SubHeaderComponent } from '../messenger/sub-header/sub-header.component';
import { MessageComponent } from '../messenger/message/message.component';
import { OwnMessageComponent } from '../messenger/own-message/own-message.component';
import { TypeInputFieldComponent } from '../messenger/type-input-field/type-input-field.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [SubHeaderComponent, MessageComponent, OwnMessageComponent, TypeInputFieldComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

}

import { Component } from '@angular/core';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [SubHeaderComponent, TypeInputFieldComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {

}

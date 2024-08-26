import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent {
  @Input() attachments!: { content: string; senderName: string; time: string }; // Hinzufügen von message als Input

  @Input() isChannel!: boolean;

  constructor() {}

}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-own-message',
  standalone: true,
  imports: [],
  templateUrl: './own-message.component.html',
  styleUrl: './own-message.component.scss'
})
export class OwnMessageComponent {

  @Input() isChannel!: boolean;

  constructor() {}

}

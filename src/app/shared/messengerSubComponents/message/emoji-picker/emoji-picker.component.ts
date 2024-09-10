import { Component, EventEmitter, Output } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [
    PickerComponent
  ],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent {

  @Output() emojiSelect = new EventEmitter<string>(); // Gibt das ausgewählte Emoji nach außen weiter

  addEmoji(event: any) {
    const selectedEmoji = event.emoji.native; // Das ausgewählte Emoji
    this.emojiSelect.emit(selectedEmoji); // Gibt das Emoji an die Elternkomponente weiter
  }
}

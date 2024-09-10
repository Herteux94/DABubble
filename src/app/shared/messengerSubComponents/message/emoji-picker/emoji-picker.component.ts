import { Component, EventEmitter, Output } from '@angular/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [
    PickerModule
  ],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss']
})
export class EmojiPickerComponent {
  @Output() emojiSelect = new EventEmitter<string>();

  addEmoji(event: any) {
    console.log('Emoji event:', event);  // Überprüfe, was vom Event kommt
    const selectedEmoji = event.emoji.native; // Emoji wird aus dem Event extrahiert
    console.log('Selected Emoji:', selectedEmoji);  // Überprüfe das ausgewählte Emoji
    this.emojiSelect.emit(selectedEmoji);  // Emoji wird emittiert
  }
}

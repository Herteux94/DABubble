import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../../../../models/message.model';
import { RoutingThreadOutletService } from '../../../../services/routing-thread-outlet.service';
import { ScreenSizeService } from '../../../../services/screen-size-service.service';
import { ActiveThreadService } from '../../../../services/active-thread-service.service';

@Component({
  selector: 'app-options-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './options-bubble.component.html',
  styleUrls: ['./options-bubble.component.scss'],
})
export class OptionsBubbleComponent implements OnInit {
  @Input() ownMessage!: boolean;
  @Input() message!: Message;
  messageOptionsOpen!: boolean;
  showEmojis: boolean = false; // Steuert, ob die Emojis oder die SVGs sichtbar sind
  mobile!: boolean;

  // Emoji-Optionen
  options = [
    {
      icon: '😀',
      label: 'Grinning Face',
      action: () => this.react('grinning'),
    },
    {
      icon: '😂',
      label: 'Face with Tears of Joy',
      action: () => this.react('joy'),
    },
    { icon: '😍', label: 'Heart Eyes', action: () => this.react('heart_eyes') },
    {
      icon: '😎',
      label: 'Smiling Face with Sunglasses',
      action: () => this.react('cool'),
    },
    { icon: '😡', label: 'Angry Face', action: () => this.react('angry') },
    { icon: '😭', label: 'Crying Face', action: () => this.react('crying') },
    {
      icon: '😱',
      label: 'Screaming Face',
      action: () => this.react('screaming'),
    },

    // Gesten & Hände
    { icon: '👍', label: 'Thumbs Up', action: () => this.react('thumbs_up') },
    {
      icon: '👎',
      label: 'Thumbs Down',
      action: () => this.react('thumbs_down'),
    },
    { icon: '👏', label: 'Clapping Hands', action: () => this.react('clap') },
    { icon: '🙏', label: 'Folded Hands', action: () => this.react('pray') },
    { icon: '🤘', label: 'Rock On', action: () => this.react('rock_on') },

    // Herzen
    { icon: '❤️', label: 'Red Heart', action: () => this.react('red_heart') },
    {
      icon: '💔',
      label: 'Broken Heart',
      action: () => this.react('broken_heart'),
    },
    {
      icon: '💖',
      label: 'Sparkling Heart',
      action: () => this.react('sparkling_heart'),
    },
    { icon: '💙', label: 'Blue Heart', action: () => this.react('blue_heart') },

    // Tiere & Natur
    { icon: '🐶', label: 'Dog', action: () => this.react('dog') },
    { icon: '🐱', label: 'Cat', action: () => this.react('cat') },
    { icon: '🐻', label: 'Bear', action: () => this.react('bear') },
    { icon: '🐧', label: 'Penguin', action: () => this.react('penguin') },
    { icon: '🦄', label: 'Unicorn', action: () => this.react('unicorn') },

    // Objekte
    { icon: '🎉', label: 'Party Popper', action: () => this.react('party') },
    { icon: '📱', label: 'Mobile Phone', action: () => this.react('mobile') },
    { icon: '💻', label: 'Laptop', action: () => this.react('laptop') },
    { icon: '🎧', label: 'Headphones', action: () => this.react('headphones') },

    // Symbole
    { icon: '🔴', label: 'Red Circle', action: () => this.react('red_circle') },
    {
      icon: '🟢',
      label: 'Green Circle',
      action: () => this.react('green_circle'),
    },
    {
      icon: '⚪',
      label: 'White Circle',
      action: () => this.react('white_circle'),
    },
    { icon: '⬆️', label: 'Up Arrow', action: () => this.react('up_arrow') },
    { icon: '⬇️', label: 'Down Arrow', action: () => this.react('down_arrow') },
  ];

  constructor(
    public threadRoutingService: RoutingThreadOutletService,
    private screenSizeService: ScreenSizeService,
    private activeThreadService: ActiveThreadService
  ) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }

  // Zeigt die Emoji-Picker an und ersetzt die Aktionen durch Emojis
  showEmojiPicker() {
    this.showEmojis = true;
  }

  // Eine Beispielaktion, die etwas anderes macht
  someOtherAction() {
    console.log('Some other action triggered');
  }

  // Methode zum Handhaben der Reaktionen (Emojis)
  react(reaction: string) {
    console.log(`Reaction: ${reaction}`);
  }

  toggleMessageOptionsPopUp() {
    this.messageOptionsOpen = !this.messageOptionsOpen;
  }

  navigateToThread() {
    this.activeThreadService.loadActiveThreadAndMessages(
      this.message.messageID
    );

    this.threadRoutingService.openThread();

    if (this.mobile) {
      this.threadRoutingService.navigateToThreadMobile(this.message.messageID);
    } else {
      this.threadRoutingService.navigateToThreadDesktop(this.message.messageID);
    }
  }
}

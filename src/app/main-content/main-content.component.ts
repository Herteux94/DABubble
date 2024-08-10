import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ThreadComponent } from './thread/thread.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [HeaderComponent, NavigationComponent, MessengerComponent, ThreadComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}

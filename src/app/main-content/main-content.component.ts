import { Component } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { MessengerComponent } from './messenger/messenger.component';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [HeaderComponent, NavigationComponent, MessengerComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

}

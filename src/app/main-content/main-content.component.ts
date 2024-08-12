import { Component, ViewChild, ElementRef } from '@angular/core';
import { HeaderComponent } from '../shared/header/header.component';
import { NavigationComponent } from '../shared/navigation/navigation.component';
import { MessengerComponent } from './messenger/messenger.component';
import { ThreadComponent } from './thread/thread.component';
import { NavToggleBtnComponent } from '../shared/navigation/nav-toggle-btn/nav-toggle-btn.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [HeaderComponent, NavigationComponent, MessengerComponent, ThreadComponent, NavToggleBtnComponent, CommonModule],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

  isMenuOpen: boolean = true;

  onMenuOpenChange(isOpen: boolean) {
    this.isMenuOpen = isOpen;
  }
}

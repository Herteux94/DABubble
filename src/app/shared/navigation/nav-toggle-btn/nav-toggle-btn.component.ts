import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-toggle-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-toggle-btn.component.html',
  styleUrl: './nav-toggle-btn.component.scss'
})
export class NavToggleBtnComponent {

  menuOpen: boolean = true;
  text: string = this.menuOpen ? 'Workspace-Menü schließen' : 'Workspace-Menü öffnen';

  @Output() menuOpenChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() toggleClassDNone: EventEmitter<void> = new EventEmitter<void>();

  toggleMenuBtn() {
    this.menuOpen = !this.menuOpen;
    this.changeText();
    this.menuOpenChange.emit(this.menuOpen);
    
    if(this.menuOpen) {
      setTimeout(() => {
        this.toggleClassDNone.emit();
      }, 1000);
    } else {
      this.toggleClassDNone.emit();
    }
  }

  changeText() {
    this.text = this.menuOpen ? 'Workspace-Menü schließen' : 'Workspace-Menü öffnen';
  }

}

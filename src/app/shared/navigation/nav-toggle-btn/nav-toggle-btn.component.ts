import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-toggle-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-toggle-btn.component.html',
  styleUrl: './nav-toggle-btn.component.scss'
})
export class NavToggleBtnComponent {

  @Input() menuOpen!: boolean;

  navBtnTextopen: string = 'Workspace-Menü schließen';
  navBtnTextclosed: string = 'Workspace-Menü öffnen';


}

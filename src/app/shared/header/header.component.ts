import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  imageSrc: string = '../../../assets/img/keyboard_arrow_down.svg';

  changeImage(isHovering: boolean): void {
    if (isHovering) {
      this.imageSrc = '../../../assets/img/arrow_down_purple.svg';
    } else {
      this.imageSrc = '../../../assets/img/keyboard_arrow_down.svg';
    }
  }

}

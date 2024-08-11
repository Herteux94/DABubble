import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  imageSrcEditSquare: string = '../../../assets/img/edit_square_black.svg';
  imageSrcPlusIcon: string = '../../../assets/img/add_plus_black_icon.svg';

  changeImage(isHovering: boolean, element: string): void {
    if (isHovering && element == 'editSquare') {
      this.imageSrcEditSquare = '../../../assets/img/edit_square_purple.svg';
    } else if (isHovering && element == 'plusIcon') {
      this.imageSrcPlusIcon = '../../../assets/img/add_plus_purple_icon.svg';
    } else if (!isHovering && element == 'plusIcon') {
      this.imageSrcPlusIcon = '../../../assets/img/add_plus_black_icon.svg';
    } else {
      this.imageSrcEditSquare = '../../../assets/img/edit_square_black.svg';
    }
  }

}

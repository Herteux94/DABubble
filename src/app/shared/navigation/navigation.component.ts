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
  imageSrcCirclePlus: string = '../../../assets/img/add_circle_plus_icon_black.svg';

  changeImageEditSquare(isHovering: boolean): void {
    if (isHovering) {
      this.imageSrcEditSquare = '../../../assets/img/edit_square_purple.svg';
    } else {
      this.imageSrcEditSquare = '../../../assets/img/edit_square_black.svg';
    } 
  }

  changeImagePlus(isHovering: boolean): void {
    if (isHovering) {
      this.imageSrcPlusIcon = '../../../assets/img/add_plus_purple_icon.svg';
    } else {
      this.imageSrcPlusIcon = '../../../assets/img/add_plus_black_icon.svg';
    } 
  }

  changeImageCirclePlus(isHovering: boolean): void {
    if (isHovering) {
      this.imageSrcCirclePlus = '../../../assets/img/add_circle_plus_icon_purple.svg';
    } else {
      this.imageSrcCirclePlus = '../../../assets/img/add_circle_plus_icon_black.svg';
    } 
  }
    


}

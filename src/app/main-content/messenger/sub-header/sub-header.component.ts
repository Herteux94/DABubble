import { Component } from '@angular/core';

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss'
})
export class SubHeaderComponent {

  imageSrcArrow: string = '../../../../assets/img/keyboard_arrow_down.svg';
  imageSrcHashtag: string = '../../../../assets/img/hashtag-icon.svg';

  changeImageArrowHashtag(isHovering: boolean): void {
    if (isHovering) {
      this.imageSrcArrow = '../../../../assets/img/arrow_down_purple.svg';
      this.imageSrcHashtag = '../../../../assets/img/hashtag_purple.svg';
    } else {
      this.imageSrcArrow = '../../../../assets/img/keyboard_arrow_down.svg';
      this.imageSrcHashtag = '../../../../assets/img/hashtag-icon.svg';
    }
  }

}

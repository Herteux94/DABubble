import { Component, Input, OnInit } from '@angular/core';
import { ToggleMobileComponentsService } from '../../../services/toggle-mobile-components.service';
import { ScreenSizeService } from '../../../services/screen-size-service.service';

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss'
})
export class SubHeaderComponent implements OnInit {

  @Input() isChannel!: boolean;
  @Input() isThread!: boolean;
  @Input() isDM!: boolean;
  @Input() isNewMsg!: boolean;

  mobile!: boolean;


  constructor(public toggleMobileCompService: ToggleMobileComponentsService, public screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });
  }
  

}

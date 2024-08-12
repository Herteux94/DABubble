import { Component, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-dialog.component.html',
  styleUrl: './menu-dialog.component.scss'
})
export class MenuDialogComponent implements OnInit {

  mobile: boolean = false;

  constructor(private screenSizeService: ScreenSizeService) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }
}

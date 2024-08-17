import { Component, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent implements OnInit {
  mobile!: boolean;

  constructor(private screenSizeService: ScreenSizeService, private router: Router) {}

  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    if(this.mobile) {
      setTimeout(() => {
        this.router.navigate(['/messenger/navigation']);
      },2000);
    }
  }

}

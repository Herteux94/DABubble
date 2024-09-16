import { Component, OnInit } from '@angular/core';
import { ScreenSizeService } from '../../services/screen-size-service.service';
import { Router, RouterModule } from '@angular/router';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss',
})
export class HelloComponent implements OnInit {
  mobile!: boolean;

  /**
   * Constructor for the HelloComponent.
   *
   * @param screenSizeService Injected service to check for screen size.
   * @param router Injected service to navigate to other routes.
   * @param activeUserService Injected service to get the currently active user.
   */
  constructor(
    private screenSizeService: ScreenSizeService,
    private router: Router,
    public activeUserService: ActiveUserService
  ) {}

  /**
   * Initializes the component.
   * It checks if the screen size is mobile, and if it is, it navigates to
   * the navigation page after a delay of 2 seconds.
   */
  ngOnInit() {
    this.screenSizeService.isMobile().subscribe((isMobile) => {
      this.mobile = isMobile;
    });

    if (this.mobile) {
      setTimeout(() => {
        this.router.navigate(['/messenger/navigation']);
      }, 2000);
    }
  }
}

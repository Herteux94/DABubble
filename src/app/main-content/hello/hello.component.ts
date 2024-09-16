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
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Sets the mobile property to the value of the mobile property of the ScreenSizeService and
   * navigates to the navigation route if the mobile property is true after 2 seconds.
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

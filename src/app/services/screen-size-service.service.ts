import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private mobileSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  /**
   * Constructor for ScreenSizeService.
   *
   * When the service is constructed, it checks the screen size and
   * sets the `mobileSubject` accordingly. It also adds an event
   * listener to the window's `resize` event to update the
   * `mobileSubject` whenever the screen size changes.
   *
   * @param platformId The platform ID.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize(); // Initial check
      window.addEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  /**
   * Checks the screen size and updates the `mobileSubject` accordingly.
   *
   * This method is called once when the service is constructed, and
   * whenever the window is resized. It checks the screen width and
   * sets the `mobileSubject` to `true` if the width is less than 1025px,
   * and `false` otherwise.
   */
  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const screenWidth = window.innerWidth;
      this.mobileSubject.next(screenWidth < 1025);
    }
  }

  /**
   * Returns an observable that indicates whether the screen size is
   * currently mobile-sized (i.e. less than 1025px wide).
   *
   * The observable will emit a new value whenever the screen size changes.
   *
   * @returns An observable that emits a boolean indicating whether the
   * screen size is currently mobile-sized.
   */
  public isMobile(): Observable<boolean> {
    return this.mobileSubject.asObservable();
  }
}

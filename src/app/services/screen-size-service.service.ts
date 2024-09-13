import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private mobileSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    // if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize(); // Initial check
      window.addEventListener('resize', this.checkScreenSize.bind(this));
    // }
  }

  private checkScreenSize(): void {
    // if (isPlatformBrowser(this.platformId)) {
      const screenWidth = window.innerWidth;
      this.mobileSubject.next(screenWidth < 1025);
    // }
  }

  public isMobile(): Observable<boolean> {
    return this.mobileSubject.asObservable();
  }
}

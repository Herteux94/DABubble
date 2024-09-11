import { Injectable } from '@angular/core';
import { timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActualTimestampService {
  actualTimestamp!: any;

  constructor() {
    this.reloadTimestampEveryMinute();
  }

  reloadTimestampEveryMinute() {
    timer(0, 60000).subscribe(() => {
      this.actualTimestamp = Date.now();
      console.log('set Timestamp on Interval ', this.actualTimestamp);
    });
  }
}

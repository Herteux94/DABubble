import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private avatarUrlSubject = new BehaviorSubject<string>('../../../assets/img/avatars/avatar-4.svg'); // Standardbild

  avatarUrl$ = this.avatarUrlSubject.asObservable();

  setAvatarUrl(url: string) {
    this.avatarUrlSubject.next(url);
  }
}

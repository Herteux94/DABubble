import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class FindUserService {
  constructor(private firestoreService: FirestoreService) {}

  findUser(userID: string | null) {
    let user = this.firestoreService.allUsers.find(
      (users) => users.userID === userID
    );
    return user;
  }
}

import { Injectable, signal } from '@angular/core';
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
    try {
      let user = this.firestoreService.allUsers.find(
        (users) => users.userID === userID
      );
      return user;
    } catch (err) {
      console.log('no User found: ', err);
      return err;
    }
  }

  findUsers(userIDs: string[] | null) {
    if (!userIDs) return [];

    // Verwende filter(), um alle passenden Nutzer basierend auf den userIDs zu finden
    let users = this.firestoreService.allUsers.filter((user) =>
      userIDs.includes(user.userID)
    );

    return users;
  }

  findUsersWithName(name: string) {
    return this.firestoreService.allUsers.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}

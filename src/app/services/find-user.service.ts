import { Injectable, signal } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class FindUserService {
  private allUsers = signal<User[]>([]);

  constructor(private firestoreService: FirestoreService) {
    this.allUsers.set(this.firestoreService.allUsers);
  }

  findUser(userID: string | null) {
    let user = this.firestoreService.allUsers.find(
      (users) => users.userID === userID
    );
    return user;
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
    return this.allUsers().filter(user =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
  }
}

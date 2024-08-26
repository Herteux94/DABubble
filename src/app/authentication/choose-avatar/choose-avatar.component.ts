import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveUserService } from '../../services/active-user.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss']
})
export class ChooseAvatarComponent {
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;
  avatarUrl: string = '../../../assets/img/Profile.svg'; // Standardbild
  userID = this.activeUserService.activeUser.userID;

  constructor(
    private storageService: StorageService,
    private firestoreService: FirestoreService,
    private activeUserService: ActiveUserService,
    private router: Router,
  ) {}

  uploadAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.storageService.uploadAvatar(file).then((downloadURL) => {
        this.avatarUrl = downloadURL; // Lokale Variable aktualisieren

        // this.userProfileService.setAvatarUrl(downloadURL); // URL im UserProfileService setzen
        console.log('File available at', downloadURL);
      }).catch((error) => {
        console.error('Upload failed', error);
      });
    }
  }
  
  selectAvatar(url: string) { //////////// UserID mitgeben
    this.avatarUrl = url; // Lokale Variable aktualisieren
    // this.userProfileService.setAvatarUrl(url); // URL im UserProfileService setzen
  }
  
  saveAvatar() {
    const userID = this.activeUserService.activeUser.userID;
    this.storageService.deleteOldAvatars(this.avatarUrl)
      .then(() => {
        return this.firestoreService.updateUser({ profileImg: this.avatarUrl }, userID); // Nur das Profilbild aktualisieren
      })
      .then(() => {
        console.log('Avatar updated and old avatars deleted');
      })
      .catch((error) => {
        console.error('Error saving avatar', error);
      });
  }
  

  // saveAvatar() {
  //   const userID = this.activeUserService.activeUser.userID;
  //   this.storageService.deleteOldAvatars(this.avatarUrl)
  //     .then(() => {
  //       return this.firestoreService.updateUser({ profileImg: this.avatarUrl }, userID);
  //       return this.firestoreService.updateUser({ profileImg: this.avatarUrl }, userID);
  //     })
  //     .then(() => {
  //       console.log('Avatar updated and old avatars deleted');
  //     })
  //     .catch((error) => {
  //       console.error('Error saving avatar', error);
  //     });
  // }

  // saveAvatar() {
  //   // Alle Bilder ausser das aktuelle Profilbild aus dem Storage löschen!
  //   this.firestoreService.updateUser(this.avatarUrl, this.userID) 
  // }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  routingMessenger(){
    this.router.navigate(['/messenger']);
  }

  goBack() {
    history.back();
  }
}

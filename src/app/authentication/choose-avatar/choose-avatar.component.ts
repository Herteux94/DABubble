import { Component, ViewChild, ElementRef, inject, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveUserService } from '../../services/active-user.service';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss'],
})
export class ChooseAvatarComponent {
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;
  avatarUrl: string = '../../../assets/img/Profile.svg';
  userID = this.activeUserService.activeUser.userID;
  dialog = inject(Dialog);
  isDialog = false;
  errorMessage: string | null = null; // Variable für Fehlermeldung

  constructor(
    private storageService: StorageService,
    private firestoreService: FirestoreService,
    public activeUserService: ActiveUserService,
    private router: Router,
    @Optional() public dialogRef: DialogRef,
    @Optional() @Inject(DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.isDialog = this.data.isDialog;
    }
  }

  uploadAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.storageService
        .uploadAvatar(file)
        .then((downloadURL) => {
          this.avatarUrl = downloadURL; // Lokale Variable aktualisieren
          this.errorMessage = null; // Fehlermeldung zurücksetzen, wenn erfolgreich
        })
        .catch((error) => {
          this.errorMessage = error; // Fehlermeldung setzen
        });
    }
  }

  selectAvatar(url: string) {
    this.avatarUrl = url; // Lokale Variable aktualisieren
  }

  saveAvatar() {
    const userID = this.activeUserService.activeUser.userID;
    this.storageService
      .deleteOldAvatars(this.avatarUrl)
      .then(() => {
        return this.firestoreService.updateUser(
          { profileImg: this.avatarUrl },
          userID
        ); // Nur das Profilbild aktualisieren
      })
      .then(() => {
        console.log('Avatar updated and old avatars deleted');
      })
      .catch((error) => {
        console.error('Error saving avatar', error);
      });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  routingMessenger() {
    this.router.navigate(['/messenger']);
  }

  goBack() {
    history.back();
  }

  safeAndExit() {
    if (this.isDialog) {
      this.saveAvatar();
      this.dialogRef.close();
    } else {
      this.saveAvatar();
      this.routingMessenger();
    }
  }
}

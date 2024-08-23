import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { UserProfileService } from '../../services/user-profile.service';
import { Router } from '@angular/router';

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

  constructor(
    private storageService: StorageService,
    private userProfileService: UserProfileService,
    private router: Router,
  ) {}

  uploadAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.storageService.uploadAvatar(file).then((downloadURL) => {
        this.avatarUrl = downloadURL; // Lokale Variable aktualisieren
        this.userProfileService.setAvatarUrl(downloadURL); // URL im UserProfileService setzen
        console.log('File available at', downloadURL);
      }).catch((error) => {
        console.error('Upload failed', error);
      });
    }
  }

  selectAvatar(url: string) {
    this.avatarUrl = url; // Lokale Variable aktualisieren
    this.userProfileService.setAvatarUrl(url); // URL im UserProfileService setzen
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  routingMessenger(){
    this.router.navigate(['/messenger']);
  }
}

import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss']
})
export class ChooseAvatarComponent {

  @ViewChild('fileInput') fileInput!: ElementRef;
  avatarUrl: string | null = null;

  constructor(private storageService: StorageService) {}

  uploadAvatar(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.storageService.uploadAvatar(file).then(downloadURL => {
        this.avatarUrl = downloadURL;
        console.log('File available at', downloadURL);
      }).catch(error => {
        console.error("Upload failed", error);
      });
    }
  }

  triggerFileInput() {
    console.log('File input triggered');
    this.fileInput.nativeElement.click();
  }
}

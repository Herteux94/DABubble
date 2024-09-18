import { Component, ViewChild, ElementRef, inject, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { ActiveUserService } from '../../services/active-user.service';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

/**
 * **ChooseAvatarComponent**
 *
 * This component allows users to choose, upload, and save their avatar/profile image.
 * It provides functionalities to select an existing avatar, upload a new one, and handle
 * the avatar saving process, including deleting old avatars if necessary.
 *
 * @component
 * @selector app-choose-avatar
 * @standalone
 * @imports CommonModule
 *
 * @example
 * ```html
 * <app-choose-avatar></app-choose-avatar>
 * ```
 */
@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss'],
})
export class ChooseAvatarComponent {
  /**
   * Reference to the hidden file input element used for uploading avatars.
   *
   * @type {ElementRef}
   */
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef;

  /**
   * The URL of the currently selected or uploaded avatar.
   *
   * @type {string}
   * @default '../../../assets/img/Profile.svg'
   */
  avatarUrl: string = '../../../assets/img/Profile.svg';

  /**
   * The user ID of the currently active user.
   *
   * @type {string}
   */
  userID = this.activeUserService.activeUser.userID;

  /**
   * Injected Dialog service for handling dialog operations.
   *
   * @type {Dialog}
   */
  dialog = inject(Dialog);

  /**
   * Flag indicating whether the component is being used within a dialog.
   *
   * @type {boolean}
   * @default false
   */
  isDialog = false;

  /**
   * Holds any error message that occurs during avatar upload.
   *
   * @type {string | null}
   * @default null
   */
  errorMessage: string | null = null;

  /**
   * Creates an instance of ChooseAvatarComponent.
   *
   * @param {StorageService} storageService - Service for handling storage operations.
   * @param {FirestoreService} firestoreService - Service for interacting with Firestore.
   * @param {ActiveUserService} activeUserService - Service managing the active user state.
   * @param {Router} router - Angular Router for navigation.
   * @param {DialogRef} [dialogRef] - Reference to the dialog if the component is used within one.
   * @param {any} [data] - Optional data passed to the dialog.
   */
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

  /**
   * Handles the avatar upload process when a user selects a file.
   * Uploads the selected file to storage and updates the avatar URL upon success.
   *
   * @param {Event} event - The file input change event.
   * @returns {void}
   */
  uploadAvatar(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.storageService
        .uploadAvatar(file)
        .then((downloadURL) => {
          this.avatarUrl = downloadURL;
          this.errorMessage = null;
        })
        .catch((error) => {
          this.errorMessage = error;
        });
    }
  }

  /**
   * Sets the selected avatar URL.
   *
   * @param {string} url - The URL of the selected avatar.
   * @returns {void}
   */
  selectAvatar(url: string): void {
    this.avatarUrl = url;
  }

  /**
   * Saves the selected or uploaded avatar by updating the user's profile in Firestore.
   * Also deletes old avatars from storage to free up space.
   *
   * @returns {void}
   */
  saveAvatar(): void {
    const userID = this.activeUserService.activeUser.userID;
    this.storageService
      .deleteOldAvatars(this.avatarUrl)
      .then(() => {
        return this.firestoreService.updateUser(
          { profileImg: this.avatarUrl },
          userID
        );
      })
      .then(() => {
      })
      .catch((error) => {
        console.error('Fehler beim Speichern des Avatars', error);
      });
  }

  /**
   * Programmatically triggers the hidden file input element to open the file picker dialog.
   *
   * @returns {void}
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Navigates the user to the messenger page.
   *
   * @returns {void}
   */
  routingMessenger(): void {
    this.router.navigate(['/messenger']);
  }

  /**
   * Navigates the user back to the previous page in the browser history.
   *
   * @returns {void}
   */
  goBack(): void {
    history.back();
  }

  /**
   * Saves the avatar and either closes the dialog or navigates to the messenger
   * depending on whether the component is used within a dialog.
   *
   * @returns {void}
   */
  safeAndExit(): void {
    if (this.isDialog) {
      this.saveAvatar();
      this.dialogRef?.close();
    } else {
      this.saveAvatar();
      this.routingMessenger();
    }
  }
}

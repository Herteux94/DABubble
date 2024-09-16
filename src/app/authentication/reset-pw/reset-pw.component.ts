import { Component, HostListener, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password.service';
import { FocusInputDirective } from '../../directives/focus-input.directive';
import { BubbleComponent } from '../bubble/bubble.component';

@Component({
  selector: 'app-reset-pw',
  standalone: true,
  imports: [
    FormsModule,
    FocusInputDirective,
    BubbleComponent
  ],
  templateUrl: './reset-pw.component.html',
  styleUrls: ['./reset-pw.component.scss']
})
export class ResetPwComponent implements OnInit {
  inputValue: string = '';
  inputValue2: string = '';
  oobCode: string | null = null;
  message: string | null = null;

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordService: ResetPasswordService
  ) {}

  ngOnInit(): void {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    if (!this.oobCode) {
      this.router.navigate(['/error']);
    }
  }

  inputValuesMatch(): boolean {
    return this.inputValue === this.inputValue2 && this.inputValue !== '';
  }

  handleSubmit() {
    if (this.inputValuesMatch() && this.oobCode) {
      this.resetPassword()
        .then(() => this.handleSuccessfulReset())
        .catch((error) => this.handleError(error));
    }
  }

  private async resetPassword() {
    return this.resetPasswordService.confirmPasswordReset(this.oobCode!, this.inputValue);
  }

  private handleSuccessfulReset() {
    this.setMessage('Passwort erfolgreich geändert');
    this.showBubbleMessage();
    this.redirectToLogin();
  }

  private handleError(error: any) {
    this.setMessage('Fehler: ' + error.message);
    this.showBubbleMessage();
  }

  private setMessage(message: string) {
    this.message = message;
    this.bubbleComponent.message = message;
  }

  private showBubbleMessage() {
    this.bubbleComponent.showSnackbar();
  }

  private redirectToLogin() {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.handleSubmit();
  }
}

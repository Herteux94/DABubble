import { Component, HostListener, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordService } from '../../services/reset-password.service'; // Service importieren
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
  oobCode: string | null = null; // Der Reset-Code aus der URL
  message: string | null = null;

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resetPasswordService: ResetPasswordService // Service injizieren
  ) {}

  ngOnInit(): void {
    // OOB-Code aus der URL holen
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    if (!this.oobCode) {
      // Kein OOB-Code gefunden, zur Fehlerseite weiterleiten
      this.router.navigate(['/error']);
    }
  }

  inputValuesMatch(): boolean {
    return this.inputValue === this.inputValue2 && this.inputValue !== '';
  }

  handleSubmit() {
    if (this.inputValuesMatch() && this.oobCode) {
      this.resetPasswordService.confirmPasswordReset(this.oobCode, this.inputValue)
        .then(() => {
          this.message = 'Passwort erfolgreich geändert';
          this.bubbleComponent.message = this.message;
          this.bubbleComponent.showSnackbar();

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000); // Snackbar-Anzeigezeit
        })
        .catch((error) => {
          this.message = 'Fehler: ' + error.message;
          this.bubbleComponent.message = this.message;
          this.bubbleComponent.showSnackbar();
        });
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.handleSubmit();
  }
}

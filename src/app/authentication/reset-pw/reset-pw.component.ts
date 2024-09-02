import { Component, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class ResetPwComponent {
  inputValue: string = '';
  inputValue2: string = '';

  @ViewChild(BubbleComponent) bubbleComponent!: BubbleComponent;

  constructor(private router: Router) {}

  inputValuesMatch(): boolean {
    return this.inputValue === this.inputValue2 && this.inputValue !== '';
  }

  handleSubmit() {
    if (this.inputValuesMatch()) {
      // Snackbar anzeigen
      this.bubbleComponent.message = 'Anmelden';
      this.bubbleComponent.showSnackbar();

      // Warten, bis die Snackbar-Animation abgeschlossen ist, bevor das Routing ausgeführt wird
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000); // Dauer der Snackbar-Anzeige
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnterKey(event: KeyboardEvent) {
    event.preventDefault();
    this.handleSubmit();
  }
}

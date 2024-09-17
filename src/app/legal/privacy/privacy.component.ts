import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterModule } from '@angular/router';

/**
 * **PrivacyComponent**
 *
 * This component displays the privacy policy of the application.
 * It utilizes Angular Material's card components to structure the content.
 *
 * @component
 * @selector app-privacy
 * @standalone
 * @imports CommonModule, RouterModule, MatCard, MatCardContent
 *
 * @example
 * ```html
 * <app-privacy></app-privacy>
 * ```
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCard, MatCardContent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
})
export class PrivacyComponent {
  /**
   * Creates an instance of PrivacyComponent.
   *
   * @constructor
   */
  constructor() {}
}

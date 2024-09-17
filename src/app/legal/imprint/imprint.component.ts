import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { RouterModule } from '@angular/router';

/**
 * **ImprintComponent**
 *
 * This component displays the imprint (legal disclosure) information of the application.
 * It utilizes Angular Material's card components to structure and present the content
 * in a clean and organized manner.
 *
 * **Usage Example:**
 * ```html
 * <app-imprint></app-imprint>
 * ```
 *
 * In the above example, the `ImprintComponent` is used to render the imprint information
 * within the application.
 *
 * @component
 * @selector app-imprint
 * @standalone
 * @imports CommonModule, RouterModule, MatCard, MatCardContent
 *
 * @example
 * ```html
 * <app-imprint></app-imprint>
 * ```
 */
@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCard, MatCardContent],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
})
export class ImprintComponent {
  /**
   * Creates an instance of ImprintComponent.
   *
   * @constructor
   */
  constructor() {}
}

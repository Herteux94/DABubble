import { Component } from '@angular/core';
import { SubHeaderComponent } from '../../shared/messengerSubComponents/sub-header/sub-header.component';
import { TypeInputFieldComponent } from '../../shared/messengerSubComponents/type-input-field/type-input-field.component';

/**
 * **NewMessageComponent**
 *
 * This component provides the interface for composing and sending a new message within the application.
 * It incorporates a sub-header for navigation and context, along with a type input field for message entry.
 * The component leverages shared sub-components to maintain consistency and reusability across the application.
 *
 * **Usage Example:**
 * ```html
 * <app-new-message></app-new-message>
 * ```
 *
 * In the above example, the `NewMessageComponent` is used to render the new message interface within the application.
 *
 * @component
 * @selector app-new-message
 * @standalone
 * @imports SubHeaderComponent, TypeInputFieldComponent
 *
 * @example
 * ```html
 * <app-new-message></app-new-message>
 * ```
 */
@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [SubHeaderComponent, TypeInputFieldComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent {
  /**
   * Creates an instance of NewMessageComponent.
   *
   * @constructor
   */
  constructor() {}
}

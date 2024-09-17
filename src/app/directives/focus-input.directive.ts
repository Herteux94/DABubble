import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * **FocusInputDirective**
 *
 * This directive enables focusing on an `<input>` element within the host element when the host is clicked.
 * It simplifies the process of directing user attention to input fields, enhancing user experience by
 * automatically focusing the desired input when the surrounding element is interacted with.
 *
 * **Usage Example:**
 * ```html
 * <div appFocusInput>
 *   <input type="text" placeholder="Clicking here focuses the input">
 * </div>
 * ```
 *
 * In the above example, clicking anywhere within the `<div>` will focus the `<input>` element inside it.
 *
 * @directive
 * @selector [appFocusInput]
 * @standalone
 */
@Directive({
  selector: '[appFocusInput]',
  standalone: true  
})
export class FocusInputDirective {
  /**
   * Creates an instance of FocusInputDirective.
   *
   * @param {ElementRef} el - Reference to the host DOM element.
   */
  constructor(private el: ElementRef) {}

  /**
   * Listens for click events on the host element.
   * When the host is clicked, it searches for an `<input>` element within the host and focuses it.
   *
   * @returns {void}
   */
  @HostListener('click')
  onClick(): void {
    const input = this.el.nativeElement.querySelector('input');
    if (input) {
      input.focus();
    }
  }
}

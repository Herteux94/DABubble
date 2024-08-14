import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFocusInput]',
  standalone: true  // Hier die Direktive als standalone deklarieren
})
export class FocusInputDirective {

  constructor(private el: ElementRef) {}

  @HostListener('click')
  onClick() {
    const input = this.el.nativeElement.querySelector('input');
    if (input) {
      input.focus();
    }
  }

}

import { FocusInputDirective } from './focus-input.directive';
import { ElementRef } from '@angular/core';

describe('FocusInputDirective', () => {
  let elementRefMock: ElementRef;

  beforeEach(() => {
    // Erstelle ein Mock-ElementRef mit einem div-Element
    const mockElement = document.createElement('div');
    elementRefMock = new ElementRef(mockElement);
  });

  it('should create an instance', () => {
    const directive = new FocusInputDirective(elementRefMock);
    expect(directive).toBeTruthy();
  });

  it('should focus the input element when the container is clicked', () => {
    // Füge ein Input-Feld zum Mock-Element hinzu
    const inputElement = document.createElement('input');
    elementRefMock.nativeElement.appendChild(inputElement);

    const directive = new FocusInputDirective(elementRefMock);

    // Simuliere den Klick auf das Container-Element
    directive.onClick();

    // Überprüfe, ob das Input-Feld fokussiert wurde
    expect(document.activeElement).toBe(inputElement);
  });
});

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-date-divider',
  standalone: true,
  imports: [],
  templateUrl: './date-divider.component.html',
  styleUrl: './date-divider.component.scss',
})
export class DateDividerComponent {
  @Input() date: string = '';
}

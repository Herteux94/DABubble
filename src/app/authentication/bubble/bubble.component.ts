import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" @slideInOut class="snackbar" [innerHTML]="message"></div>
  `,
  styles: [`
    .snackbar {
      position: fixed;
      bottom: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      right: 16px;
      font-size: 36px;
      font-weight: 700;
      background-color: rgba(68, 77, 242, 1);
      color: white;
      padding: 50px;
      border-radius: 30px 30px 0 30px;
      box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.2);
    }
    .snackbar  {
      >img{
      vertical-align: middle;
      margin-right: 10px;
      height: 40px;
    }}
  `],
  animations: [
    trigger('slideInOut', [
      state('void', style({
        transform: 'translateY(100%)',
        opacity: 0,
      })),
      state('*', style({
        transform: 'translateY(0)',
        opacity: 1,
      })),
      transition('void => *', [
        animate('500ms ease-in')
      ]),
      transition('* => void', [
        animate('500ms ease-out')
      ])
    ])
  ]
})

export class BubbleComponent {
  @Input() message: string = '';
  show = false;

  constructor() { }

  public showSnackbar() {
    this.show = true;
    setTimeout(() => {
      this.show = false;
    }, 2000);
  }
}

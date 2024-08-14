import { Component, Input } from '@angular/core';
import { ThreadServiceService } from '../../../services/thread-service.service';

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss'
})
export class SubHeaderComponent {

  @Input() isChannel!: boolean;
  @Input() isThread!: boolean;
  @Input() isDM!: boolean;
  @Input() isNewMsg!: boolean;


  constructor(public threadService: ThreadServiceService) {}

  

}

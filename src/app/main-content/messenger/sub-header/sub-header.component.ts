import { Component } from '@angular/core';
import { ThreadServiceService } from '../../../services/thread-service.service';

@Component({
  selector: 'app-sub-header',
  standalone: true,
  imports: [],
  templateUrl: './sub-header.component.html',
  styleUrl: './sub-header.component.scss'
})
export class SubHeaderComponent {

  constructor(public threadService: ThreadServiceService) {}

  

}

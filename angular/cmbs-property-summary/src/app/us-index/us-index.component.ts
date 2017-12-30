import { Component, OnInit } from '@angular/core';
import { UsIndexService } from '../us-index.service';
import { UsSummary } from '../us-summary';

@Component({
  selector: 'app-us-index',
  templateUrl: './us-index.component.html',
  styleUrls: ['./us-index.component.css']
})
export class UsIndexComponent implements OnInit {
  usSummary: UsSummary[];

  constructor(private usIndexService: UsIndexService) { }

  ngOnInit() {
    this.getIndex();
  }

  getIndex(): void {


    this.usIndexService.getUsSummary()
    .subscribe(UsSummary => this.usSummary = UsSummary);
  }

}

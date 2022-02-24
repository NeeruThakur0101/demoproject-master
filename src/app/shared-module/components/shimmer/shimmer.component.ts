import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'cc-shimmer',
  templateUrl: './shimmer.component.html',
  styleUrls: ['./shimmer.component.scss']
})
export class ShimmerComponent implements OnInit {

  @Input() rows = 1;
  @Input() showImage = false;
  @Input() twoLines = false;
  numbers = [1];

  constructor() { }

  ngOnInit() {
    this.numbers = Array(this.rows).fill(0).map((x,i)=>i);
  }


}

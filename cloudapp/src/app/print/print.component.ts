import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AlmaService } from '../services/alma.service';
import { PrintService } from '../services/print.service';
import { Item } from '../models/item';
import { tap } from 'rxjs/operators';
import { chunk } from 'lodash';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
})
export class PrintComponent implements OnInit {
  items = new Array<Array<Item>>();

  constructor(
    private printService: PrintService,
    private alma: AlmaService,
  ) { }

  ngOnInit() {
  }

  load() {
    return forkJoin(Array.from(this.printService.items).map(i=>this.alma.getItem(i)))
    .pipe(
      tap(results => this.items = chunk(results, this.layout.perPage))
    )
  }

  get layout() {
    return this.printService.layout;
  }

}

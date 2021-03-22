import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Layout, Template } from '../models/configuration';
import { AlmaService } from './alma.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  setId: string;
  items = new Set<string>();
  layout: Layout;
  template: Template;
  offset: number = 0;

  constructor( 
    private alma: AlmaService,
  ) {  }

  loadItems() {
    return this.alma.getItemsFromSet(this.setId)
    .pipe(
      tap(results=>this.items=new Set((results.member||[]).map(m=>m.link)))
    )
  }

  clear() {
    this.items.clear();
    this.setId = '';
  }

}
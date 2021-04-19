import { Injectable } from '@angular/core';
import { CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { tap } from 'rxjs/operators';
import { Layout, Template } from '../models/configuration';
import { AlmaService } from './alma.service';

export const STORE_SCANNED_BARCODES = 'ScannedBarcodes';
export const STORE_SELECTED_ENTITIES = 'SelectedEntities';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  setId: string;
  items = new Set<string>();
  layout: Layout;
  template: Template;
  offset: number = 0;
  gridlines = false;

  constructor( 
    private alma: AlmaService,
    private store: CloudAppStoreService,
  ) {  }

  loadItems() {
    return this.alma.getItemsFromSet(this.setId)
    .pipe(
      tap(results=>this.items=new Set((results.member||[]).map(m=>m.link)))
    )
  }

  async clear() {
    this.items.clear();
    this.setId = '';
    await this.store.remove(STORE_SCANNED_BARCODES).toPromise();
    await this.store.remove(STORE_SELECTED_ENTITIES).toPromise();
  }

}
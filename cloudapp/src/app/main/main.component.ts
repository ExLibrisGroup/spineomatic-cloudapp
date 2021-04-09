import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AlertService, CloudAppEventsService, CloudAppStoreService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Set } from '../models/set';
import { SelectSetComponent } from '../select-set/select-set.component';
import { SelectEntitiesComponent } from 'eca-components';
import { ConfigService } from '../services/config.service';
import { PrintService, STORE_SCANNED_BARCODES } from '../services/print.service';
import { AlmaService } from '../services/alma.service';
import { TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs/operators';
import { Item } from '../models/item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  loading = new Set<string>();
  scannedEntities: Entity[] = [];
  selectedEntities = new Array<Entity>();
  listType: ListType = ListType.SCAN;
  @ViewChild('selectSet', {static: false}) selectSetComponent: SelectSetComponent;
  @ViewChild('selectEntities', {static: false}) selectEntitiesComponent: SelectEntitiesComponent;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;
  entityTypes = [ EntityType.ITEM ];
  count = 0;
  scanning = false;

  constructor(
    private eventsService: CloudAppEventsService,
    public configService: ConfigService,
    private alert: AlertService,
    private alma: AlmaService,
    public printService: PrintService,
    private translate: TranslateService,
    private router: Router,
    private store: CloudAppStoreService,
  ) { }

  ngOnInit() {
    /* Check if app is configured */
    this.configService.get().subscribe(config=>{
      if (Object.keys(config.layouts).length==0 ||
          Object.keys(config.templates).length==0) {
        this.eventsService.getInitData().pipe(
          switchMap(initData=>this.translate.get('Main.NoConfig', 
            { isAdmin: initData.user.isAdmin }))
        )
        .subscribe(text=>this.alert.warn(text));
      }
    })
    /* Reload scanned barcodes */
    this.store.get(STORE_SCANNED_BARCODES)
    .subscribe(barcodes => this.scannedEntities = barcodes || []);
  }

  ngOnDestroy(): void {
  }

  onListTypeChange() {
    setTimeout(()=>{
      if (this.listType!=ListType.SET) {
        this.printService.setId = null;
      }
      if (this.barcode && this.listType==ListType.SCAN)
        this.barcode.nativeElement.focus();
     });
  }

  onSetSelected(set: Set) {
    this.printService.clear();
    this.printService.setId = set.id;
  }

  readFile(files: File[]) {
    const file = files[0];
    console.log('here', file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const file = event.target.result;
      if (typeof file != 'string') return;
      const items = file.split(/\r\n|\n/)
      .reverse() /* Preserve order */
      .filter(barcode => !!barcode) /* Skip blank lines */
      .map(barcode =>
        this.alma.getBarcode(barcode.trim()).toPromise()
        .then(this.onItemScanned)
        .catch(e => this.scanBarcodeError(e, barcode))
      );
      /* Scan synchronously to preserve order of file */  
      this.scanning = true;
      for await (let item of items) {
      }
      this.scanning = false;
      (document.getElementById('file') as HTMLInputElement).value = null;
    };
    reader.onerror = (event) => {
        console.error(event.target.error.name);
    };
    reader.readAsText(file);
  }

  scan() {
    const barcode = this.barcode.nativeElement.value;
    if (barcode) {
      this.loading.add(barcode);
      this.alma.getBarcode(barcode)
      .pipe(finalize(()=>this.loading.delete(barcode)))
      .subscribe({
        next: this.onItemScanned,
        error: e => this.scanBarcodeError(e, barcode),
      })
      this.barcode.nativeElement.value = "";
    }
  }

  scanBarcodeError(e: Error, barcode: string) {
    console.error('e', e);
    this.alert.warn(this.translate.instant('Main.BarcodeError', 
      { barcode: barcode, message: e.message }), { autoClose: true });
  }

  onItemScanned = (item: Item) => {
    if (!this.scannedEntities.find(e=>e.link==item.link)) {
      this.scannedEntities.unshift(this.itemToEntity(item));
    } else {
      this.alert.warn(this.translate.instant('Main.BarcodeAlreadyLoaded', 
        { barcode: item.item_data.barcode }), { autoClose: true });
    }
    this.saveScannedBarcodes();
  }

  itemToEntity = (item: Item): Entity => (
    {
      id: item.item_data.pid,
      link: item.link,
      description: item.item_data.barcode,
      type: EntityType.ITEM
    }
  )
  
  remove(i: number) {
    this.scannedEntities.splice(i, 1);
    this.saveScannedBarcodes();
    if (this.barcode) this.barcode.nativeElement.focus();
  }

  clear() {
    this.scannedEntities = [];
    this.printService.clear();
    if (this.selectEntitiesComponent) this.selectEntitiesComponent.clear();
  }

  saveScannedBarcodes() {
    this.store.set(STORE_SCANNED_BARCODES, this.scannedEntities)
    .subscribe();
  }

  next() {
    if (this.listType == ListType.SCAN) {
      this.printService.items = new Set(this.scannedEntities.map(e=>e.link));
    } else if (this.listType == ListType.SELECT) {
      this.printService.items = new Set(this.selectedEntities.map(e=>e.link));
    }
    this.router.navigate(['labels']);
  }

  get isValid() {
    return (
      ( (this.listType==ListType.SET && this.printService.setId != null) ||
        (this.listType==ListType.SELECT && this.selectedEntities.length != 0) ||
        (this.listType==ListType.SCAN && this.scannedEntities.length != 0) 
      ) 
      && this.loading.size == 0
    );
  }

}

export enum ListType {
  SET = 'SET',
  SELECT = 'SELECT',
  SCAN = 'SCAN'
}
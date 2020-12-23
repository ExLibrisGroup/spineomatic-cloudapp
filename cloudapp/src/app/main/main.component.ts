import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AlertService, CloudAppEventsService, Entity, EntityType, PageInfo } from '@exlibris/exl-cloudapp-angular-lib';
import { Set } from '../models/set';
import { SelectSetComponent } from '../select-set/select-set.component';
import { SelectEntitiesComponent } from '../select-entities/select-entities.component';
import { ConfigService } from '../services/config.service';
import { PrintService } from '../services/print.service';
import { AlmaService } from '../services/alma.service';
import { TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs/operators';
import { Item } from '../models/item';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  private pageLoad$: Subscription;
  loading = new Set<string>();
  scannedEntities: Entity[] = [];
  entities: Entity[];
  listType: ListType = ListType.SET;
  @ViewChild('selectSet', {static: false}) selectSetComponent: SelectSetComponent;
  @ViewChild('selectBibs', {static: false}) selectBibsComponent: SelectEntitiesComponent;
  @ViewChild('barcode', {static: false}) barcode: ElementRef;

  constructor(
    private eventsService: CloudAppEventsService,
    public configService: ConfigService,
    private alert: AlertService,
    private alma: AlmaService,
    public printService: PrintService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
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
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  onListTypeChange() {
    setTimeout(()=>{
      if (this.barcode && this.listType==ListType.SCAN)
        this.barcode.nativeElement.focus();
     });
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.entities = (pageInfo.entities||[])
      .filter(e=>[EntityType.ITEM].includes(e.type));
    if (this.entities.length == 0) {
      this.listType = ListType.SCAN;
    } else {
      this.listType = ListType.SELECT;
    }
    this.onListTypeChange();
  }

  onSetSelected(set: Set) {
    this.printService.setId = set.id;
  }

  scan() {
    const barcode = this.barcode.nativeElement.value;
    if (barcode) {
      this.loading.add(barcode);
      this.alma.getBarcode(barcode)
      .pipe(finalize(()=>this.loading.delete(barcode)))
      .subscribe({
        next: this.onItemScanned,
        error: e => {
          console.error('e', e);
          this.alert.warn(this.translate.instant('Main.BarcodeError', 
            { barcode: barcode, message: e.message }), { autoClose: true });
        },
      })
      this.barcode.nativeElement.value = "";
    }
  }

  onItemScanned = (item: Item) => {
    if (!this.printService.items.has(item.link)) {
      this.printService.items.add(item.link);
      let entity: Entity = {
        id: item.item_data.pid,
        link: item.link,
        description: item.item_data.barcode,
        type: EntityType.ITEM
      };
      this.scannedEntities.unshift(entity);
    } else {
      this.alert.warn(this.translate.instant('Main.BarcodeAlreadyLoaded', 
        { barcode: item.item_data.barcode }), { autoClose: true });
    }
  }

  remove(i: number) {
    this.printService.items.delete(this.scannedEntities[i].link);
    this.scannedEntities.splice(i, 1);
    if (this.barcode) this.barcode.nativeElement.focus();
  }

  onItemSelected(event: {entity: Entity, checked: boolean}) {
    if (event.checked) this.printService.items.add(event.entity.link);
    else this.printService.items.delete(event.entity.link);
  }

  get isValid() {
    return (
      ( (this.listType==ListType.SET && this.printService.setId!=null) ||
        ([ListType.SELECT, ListType.SCAN].includes(this.listType) && this.printService.items.size!=0) 
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
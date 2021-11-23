import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AlertService, CloudAppEventsService, CloudAppStoreService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Set } from '../models/set';
import { AutoCompleteComponent, SelectEntitiesComponent } from 'eca-components';
import { ConfigService } from '../services/config.service';
import { PrintService, STORE_SCANNED_BARCODES, STORE_SELECTED_ENTITIES } from '../services/print.service';
import { AlmaService } from '../services/alma.service';
import { TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ScanComponent } from './scan/scan.component';
import { canConfigure } from '../models/alma';
import { AppService } from '../app.service';
import { iif, of } from 'rxjs';

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
  @ViewChild(AutoCompleteComponent) selectSet: AutoCompleteComponent;
  @ViewChild('selectEntities', {static: false}) selectEntitiesComponent: SelectEntitiesComponent;
  @ViewChild(ScanComponent) scanComponent: ScanComponent;
  entityTypes = [ EntityType.ITEM ];
  private _count = 0;

  constructor(
    private eventsService: CloudAppEventsService,
    public  configService: ConfigService,
    private alert: AlertService,
    public  alma: AlmaService,
    public  printService: PrintService,
    private translate: TranslateService,
    private router: Router,
    private store: CloudAppStoreService,
    public appService: AppService,
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
    /* Check if user has admin role */
    this.eventsService.getInitData()
    .pipe(
      switchMap(initData => iif(
        () => initData.user.isAdmin,
        of(true),
        this.alma.getUser(initData.user.primaryId)
        .pipe(map(user => canConfigure(user)))
      ))
    )
    .subscribe(result => this.appService.canConfigure = result);
    /* Reload scanned barcodes */
    this.store.get(STORE_SCANNED_BARCODES)
    .subscribe(barcodes => this.scannedEntities = barcodes || []);
    /* Reload selected entities */
    this.store.get(STORE_SELECTED_ENTITIES)
    .subscribe(entities => this.selectedEntities = entities || []);
  }

  ngOnDestroy(): void {
  }

  onListTypeChange() {
    setTimeout(()=>{
      if (this.listType!=ListType.SET) {
        this.printService.setId = null;
      }
      if (this.scanComponent && this.listType==ListType.SCAN)
        this.scanComponent.focus();
     });
  }

  onSetSelected(set: Set) {
    this.printService.clear();
    if (set) this.printService.setId = set.id;
  }

  clear() {
    this.scannedEntities = [];
    this.selectSet.clear();
    this.printService.clear();
    if (this.selectEntitiesComponent) this.selectEntitiesComponent.clear();
  }

  next() {
    if (this.listType == ListType.SCAN) {
      this.printService.items = new Set(this.scannedEntities.map(e=>e.link));
    } else if (this.listType == ListType.SELECT) {
      this.printService.items = new Set(this.selectedEntities.map(e=>e.link));
      this.store.set(STORE_SELECTED_ENTITIES, this.selectedEntities).subscribe();
    }
    this.router.navigate(['labels']);
  }

  get isValid() {
    return (
      ( (this.listType==ListType.SET && !!this.printService.setId) ||
        (this.listType==ListType.SELECT && this.selectedEntities.length != 0) ||
        (this.listType==ListType.SCAN && this.scannedEntities.length != 0) 
      ) 
      && this.loading.size == 0
    );
  }

  set count(val: number) { 
    this._count = val;
    this.listType = val > 0
      ? ListType.SELECT
      : ListType.SCAN;
  }

  get count() {
    return this._count;
  }
}

export enum ListType {
  SET = 'SET',
  SELECT = 'SELECT',
  SCAN = 'SCAN'
}
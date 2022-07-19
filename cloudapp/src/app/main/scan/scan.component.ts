import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AlertService, CloudAppStoreService, Entity, EntityType } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateService } from "@ngx-translate/core";
import { finalize } from "rxjs/operators";
import { Item } from "../../models/item";
import { AlmaService } from "../../services/alma.service";
import { STORE_SCANNED_BARCODES } from "../../services/print.service";

@Component({
  selector: 'app-scan',
  templateUrl: './scan.component.html',
  styleUrls: ['./scan.component.scss']
})
export class ScanComponent implements OnInit, OnDestroy {
  @Input() scannedEntities: Entity[] = [];
  scanning = false;
  loading = new Set<string>();
  @ViewChild('barcode', {static: false}) barcode: ElementRef;

  constructor(
    public alma: AlmaService,
    private alert: AlertService,
    private translate: TranslateService,
    private store: CloudAppStoreService,
  ) {}
  
  ngOnInit() {
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit() {
    this.focus();
  }

  readFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const file = event.target.result;
      if (typeof file != 'string') return;
      const barcodes = file.split(/\r\n|\n/)
      .filter(barcode => !!barcode); /* Skip blank lines */
      /* Scan synchronously to preserve order of file */  
      this.scanning = true;
      for (let barcode of barcodes) {
        let fixedBarcode = encodeURIComponent(barcode);   //URM-159774
        await this.alma.getBarcode(fixedBarcode.trim()).toPromise()
          .then(this.onItemScanned)
          .catch(e => this.scanBarcodeError(e, barcode))
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
    const fixedBarcode = encodeURIComponent(barcode);  //URM-159774
    if (fixedBarcode) {
      this.loading.add(barcode);
      this.alma.getBarcode(fixedBarcode)
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
      this.scannedEntities.push(this.itemToEntity(item));
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

  saveScannedBarcodes() {
    this.store.set(STORE_SCANNED_BARCODES, this.scannedEntities)
    .subscribe();
  }

  focus() {
    if (this.barcode) {
      setTimeout(() => this.barcode.nativeElement.focus());
    }
  }
}
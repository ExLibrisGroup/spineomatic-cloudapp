import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { AlmaService } from '../services/alma.service';
import { PrintService } from '../services/print.service';
import { Item } from '../models/item';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { chunk } from 'lodash';
import { ConfigService } from '../services/config.service';
import { Config, Layout, Prefix } from '../models/configuration';
import * as dot from 'dot-object';
import { NgxBarcodeComponent } from 'ngx-barcode';
import { itemExample } from '../models/item-example';
import { callNumberParsers } from '../models/call-number-parsers';

const INCH_IN_PIXELS = 96, CM_IN_PIXELS = 37.8, PREVIEW_WIDTH = 250;

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styles: [
    'p { margin-top: 0; }',
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class PrintComponent implements OnInit {
  items = new Array<Array<Item>>();
  config: Config;
  @ViewChild(NgxBarcodeComponent)
  barcodeComponent: NgxBarcodeComponent;
  private itemsLoaded = 0;
  percentLoaded = 0;
  private _preview: Layout;
  @Input() set preview(val: Layout) {
    try {
      const scale = PREVIEW_WIDTH / (val.pageWidth * (val.measure == 'in' ? INCH_IN_PIXELS : CM_IN_PIXELS));
      let newval = {...val};
      ['topMargin', 'leftMargin', 'pageWidth', 'width', 'height', 'horizontalGap', 'verticalGap', 'leftPadding']
      .forEach(m=>newval[m]=newval[m]*scale);
      this._preview = newval;
      const perPage = (typeof this.layout.perPage == 'string') ? parseInt(this.layout.perPage) || 0 : this.layout.perPage;
      this.items = [new Array(perPage).fill(itemExample)];
    } catch(e) {
      console.warn('Could not display preview', e.message);
      this.items = [];
    }
  }

  constructor(
    public printService: PrintService,
    private alma: AlmaService,
    private configService: ConfigService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
  }

  load() {
    return this.configService.get()
    .pipe(
      tap(config=>this.config = config),
      switchMap(()=>forkJoin(Array.from(this.printService.items).map(i=>this.getItem(i)))),
      tap(items => items.unshift(...new Array(this.printService.offset))),
      tap(items => this.items = chunk(items, this.layout.perPage)),
      finalize(()=>{
        this.percentLoaded = 0; this.itemsLoaded = 0;
      }),
    )
  }

  getItem(link: string) {
    return this.alma.getItem(link).pipe(
      tap(()=>{
        this.itemsLoaded++
        this.percentLoaded = 
          Math.round((this.itemsLoaded/this.printService.items.size)*100);
      }),
      catchError(e => of(e)),
    )
  }

  get layout() {
    return this._preview || this.printService.layout;
  }

  get template() {
    return this.printService.template;
  }

  contents(item: Item) {
    if (this._preview) return '<p>X</p>';
    else if (!item) return '';
    let body = this.printService.template.contents
    .replace(/{{ *(\S*:\S*) *}}/g, (match, str) => {
      const [ cmd, detail ] = str.split(':');
      if (cmd == 'image') {
        return this.getImage(detail);
      } else {
        const val = dot.pick(detail, item);
        switch (detail) {
          case 'item_data.barcode':
            return this.getBarCode(val);
          case 'item_data.alt_call_no':
          case 'item_data.call_no':
          case 'holding_data.call_number':
          case 'holding_data.permanent_call_number':
          case 'holding_data.temp_call_number':
            return this.getCallNo(val);
          case 'bib_data.title':
            return this.getTitle(val);
          case 'prefix':
           return this.getPrefix(item);
          default:
            return val == undefined ? '' : val;
        }
      }
    })
    .replace(/(<br\s*\/?>){2,}/gmi, '<br>'); /* Suppress multiple line breaks */
    return this.sanitizer.bypassSecurityTrustHtml(body);
  }

  getBarCode(val: string) {
    if (!this.printService.template.asBarcode) return val; 
    this.barcodeComponent.value = val;
    let chars = Number(this.template.barcodeWidth);
    if (chars > 0) {
      this.barcodeComponent.width = chars;
    }
    chars = Number(this.template.barcodeHeight);
    if (chars > 0) {
      this.barcodeComponent.height = chars;
    }
    let barcodeFontSizeStart = this.printService.template.contents.indexOf("font-size");
    if (barcodeFontSizeStart > -1) {
       barcodeFontSizeStart = barcodeFontSizeStart + 11;
       let barcodeFontSizeEnd =  this.printService.template.contents.indexOf("pt;");
       if (barcodeFontSizeEnd > -1) {
          let barcodeFontSize = this.printService.template.contents.substr(barcodeFontSizeStart, barcodeFontSizeEnd - barcodeFontSizeStart);
          if (!isNaN(Number(barcodeFontSize))) {
             this.barcodeComponent.fontSize = Number(barcodeFontSize);
          }
       }
    }
    //force left margin - URM-159857
    this.barcodeComponent.marginLeft = 1;
    this.barcodeComponent.bcElement.nativeElement.innerHTML = "";
    this.barcodeComponent.createBarcode();
    return this.barcodeComponent.bcElement.nativeElement.innerHTML;
  }

  getCallNo(val: string | Array<string>) {
    if (!val) return "";
    if (callNumberParsers[this.template.callNumberParser]) {
      val = callNumberParsers[this.template.callNumberParser](val);
    }
    return Array.isArray(val) ?
      val.filter(v=>!!v) /* Suppress blank lines */
      .join(this.template.callNumberLineBreaks ? '<br>' : ' ') : 
      val;
  }

  getTitle(val: string) {
    const chars = Number(this.template.truncateTitleCharacters);
    if (chars > 0) {
      return val.substr(0, chars);
    }
    return val;
  }

  getImage(key: string) {
    return this.config.images[key] 
      ? `<img src="${this.config.images[key].url}" style="max-height: ${this.printService.layout.height*.25}${this.printService.layout.measure}">`
      : '';  
  }

  getPrefix(item: Item) {
    let val = '';
    if (
        this.template.prefixes 
        && this.template.prefixes.length > 0
        && item.item_data.library
        && item.item_data.location
    ) {
      const library = item.item_data.library.value;
      const location = item.item_data.location.value;
      const prefix = this.template.prefixes.find(p => p.library == library && (p.location == location || !!!p.location))
      if (prefix) val = prefix.text;
    }
    return val;
  }
}

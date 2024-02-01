import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { AlmaService } from '../services/alma.service';
import { PrintService } from '../services/print.service';
import { Item } from '../models/item';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { chunk } from 'lodash';
import { ConfigService } from '../services/config.service';
import { Config, Layout } from '../models/configuration';
import * as dot from 'dot-object';
import { NgxBarcodeComponent } from '@joshmweisman/ngx-barcode';
import { itemExample } from '../models/item-example';
import { callNumberParsers } from '../models/call-number-parsers';
import { checksums } from '../models/checksums';
import { getLocaleDateFormat } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
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
    return this.alma.getItemForLabel(link).pipe(
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
          case 'raw_barcode':
            /* Return barcode without processing; allows printing text and code on label */
            let val2 = dot.pick('item_data.barcode', item);
            if (this.template.blankFields && !val2) return " <BR>";
            return dot.pick('item_data.barcode', item);          
          case 'item_data.barcode':
            return this.getBarCode(val, null);
          case 'item_data.alt_call_no':
          case 'item_data.call_no':
          case 'holding_data.call_number':
          case 'holding_data.permanent_call_number':
          case 'holding_data.temp_call_number':
            return this.getCallNo(val, item);
          case 'bib_data.title':
            return this.getTitle(val);
          case 'prefix':
           return this.getPrefix(item);
          case 'holding_data.copy_id':
            return this.getCopyNumber(val);
          case 'raw_call_no':
            return this.getRawCallNo(val, item);
          case 'item_data.description':
            return this.getDescription(val);
          case 'item_data.call_no_1':
          case 'item_data.call_no_2':
          case 'item_data.call_no_3':
          case 'item_data.call_no_4':
          case 'item_data.call_no_5':
          case 'item_data.call_no_6':
          case 'item_data.call_no_7':
          case 'item_data.call_no_8':
          case 'item_data.call_no_9':
          case 'item_data.call_no_10':            
            const callNoVal = dot.pick('item_data.call_no', item);
            if (!callNoVal || !Array.isArray(callNoVal)) {
              if (this.template.blankFields) 
                return " <BR>";
              else 
                return '';
            }
            if (detail.substring(18) - 1 < callNoVal.length)
              return this.getCallNoPart(callNoVal, detail.substring (18) - 1);  
            else {
              //Remove this "if" statement to try to get alignment better for call number parts
              //if (this.template.blankFields) 
              //  return " <BR>";
              //else 
                return '';   
            }
          case 'holdings_data.due_back_date:':
          case 'item_data.arrival_date':
          case 'item_data.expected_arrival_date':
          case 'item_data.inventory_date':
          case 'item_data.weeding_date':
            return this.getFormattedDate(val);
          default:
            let rdata;
            if (val == undefined) 
              rdata = '';
            else
              rdata = val;
            if (this.template.blankFields && rdata.length == 0) return " <BR>";
            return rdata;
        }
      }
    })
    .replace(/(<br\s*\/?>){2,}/gmi, '<br>'); /* Suppress multiple line breaks */
    return this.sanitizer.bypassSecurityTrustHtml(body);
  }

  getBarCode(val: string, displayString: string) {
    if (this.template.blankFields && !val) return " <BR>";
    if (!this.printService.template.asBarcode) return val; 
    this.barcodeComponent.value = !!checksums[this.template.barcodeChecksum]
      ? val.concat(checksums[this.template.barcodeChecksum](val))
      : val;
    if (displayString) 
      this.barcodeComponent.text = displayString;
    else
      this.barcodeComponent.text = val;
    let chars = Number(this.template.barcodeWidth);
    if (chars > 0) {
      this.barcodeComponent.width = chars;
    }
    chars = Number(this.template.barcodeHeight);
    if (chars > 0) {
      this.barcodeComponent.height = chars;
    }
    //Keep original barcode font size code....but it gets overridden in the new code.
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
    //New barcode font size code. 
    if (this.printService.template.showBarcodeValue) {
      if (!isNaN(Number(this.printService.template.barcodeFontSize))) {
        if (Number(this.printService.template.barcodeFontSize) > 0) 
          this.barcodeComponent.fontSize = Number(this.printService.template.barcodeFontSize);
      }
    }
    //force left margin - URM-159857
    this.barcodeComponent.marginLeft = 1;
    // CIL additions to override default settings in barcode. 
    // TODO implement these in settings in the template interface
    this.barcodeComponent.marginTop = this.printService.CIL ? 1 : 10;
    this.barcodeComponent.marginRight = this.printService.CIL ? 1 : 10;
    this.barcodeComponent.marginBottom = this.printService.CIL ? 1 : 10;
    this.barcodeComponent.textMargin = this.printService.CIL ? 1 : 2;
    this.barcodeComponent.bcElement.nativeElement.innerHTML = "";
    this.barcodeComponent.createBarcode();
    return this.barcodeComponent.bcElement.nativeElement.innerHTML;
  }

  getCallNoPart(val: Array<string>, part_number) {
    if (val[part_number] != undefined) {
      if (this.template.blankFields && val[part_number] == '') {
        return " <BR>";
      }
      return val[part_number];
    }
    else {
      if (this.template.blankFields) {
        return " <BR>";
      }
      else 
        return '';
    }
  }

  getFormattedDate(val) {
    //Keep only numbers and hyphen
    let dateString = val.replace(/[^\d-]/g, '')
    let dateParts = dateString.split('-');
    if (dateParts.length != 3) {
      // If we don't have year-month-day, just return value
      return val;
    }
    // Assume 3 parts are year-month-day 
    // dateParts[0]  year
    // dateParts[1]  month
    // dateParts[2]  day

    //Set which month to translate in case we need it.
    const transMonth = "Configuration.Months." + dateParts[1] * 1;

    switch (this.template.dateFormat) {
      case 'd m yyyy':
        val = dateParts[2] * 1 + this.template.dateSeparator + dateParts[1] * 1 + this.template.dateSeparator + dateParts[0]; 
        return val;
      case 'dd mm yyyy': 
        //Alma should be returning two character days and months...no need to pad
        val = dateParts[2] + this.template.dateSeparator + dateParts[1] + this.template.dateSeparator + dateParts[0]; 
        return val;
      case 'yyyy m d':
        val = dateParts[0] + this.template.dateSeparator + dateParts[1] * 1 + this.template.dateSeparator + dateParts[2] * 1; 
        return val;
      case 'yyyy mm dd':
        //Alma should be returning two character days and months...no need to pad
        val = dateParts[0] + this.template.dateSeparator + dateParts[1] + this.template.dateSeparator + dateParts[2];
        return val;
      case 'm d yyyy':
        val = dateParts[1] * 1 + this.template.dateSeparator + dateParts[2] * 1 + this.template.dateSeparator + dateParts[0];
        return val;
      case 'mm dd yyyy':
        //Alma should be returning two character days and months...no need to pad
        val = dateParts[1] + this.template.dateSeparator + dateParts[2] + this.template.dateSeparator + dateParts[0];        
        return val;
      case 'd mmm yyyy':
        let truncMonth = this.translate.instant (transMonth).substring(0,3);
        val = dateParts[2] * 1 + this.template.dateSeparator + truncMonth + this.template.dateSeparator + dateParts[0];
        return val;
      case 'd mmmmm yyyy':
        val = dateParts[2] * 1 + this.template.dateSeparator + this.translate.instant (transMonth) + this.template.dateSeparator + dateParts[0];
        return val;
      case 'mmmmm d yyyy':
        val = this.translate.instant (transMonth) + ' ' + dateParts[2] * 1 + this.template.dateSeparator + ' '  + dateParts[0];
        return val;
      default:
        return val;     
    }
  }

  getCallNo(val: string | Array<string>, item: Item) {
    if (this.template.blankFields && !val) return " <BR>";
    if (!val) return "";
    let originalCallNumber = "";
    if (Array.isArray(val)) 
      originalCallNumber = val.join('');
    else
      originalCallNumber = val;
    if (callNumberParsers[this.template.callNumberParser]) {
      val = callNumberParsers[this.template.callNumberParser](val, item, this.template.decimalCharacter);
    }
    // If displaying call number as a barcode... 
    if (this.template.callNumberAsBarcode) {
      console.log ('Show call number as barcode checked.')
      let workingString2 = "";
      workingString2 = this.getBarCode(originalCallNumber, val.toString());
      return workingString2;
    }

    console.log ('Do not show call number as barcode.');

    //If characters are to be removed, split them into groups and remove each sequentially
    let charactersToRemove = this.template.removeCharactersFromCallNo;
    if (charactersToRemove.length > 0) {
      let segments = charactersToRemove.split(' ');
      let wasArray = false;
      if (Array.isArray(val)) {
        val = val.join(' ');
        wasArray = true;
      }
      for (const i in segments) {
        const pattern = new RegExp(segments[i],'g');
        //console.log ('Pattern to replace =  ' + pattern);
        val = val.replace(pattern, "");
      }
      if (wasArray) {
        val = val.split(' ');
      }
    } 

    if (this.template.hideCutterDecimal) {
      let decimalCharacter = this.template.decimalCharacter;
      if (decimalCharacter.length == 0) {
        decimalCharacter = '.';
      }
      let wasArray = false;
      if (Array.isArray(val)) {
        val = val.join(' ');
        wasArray = true;
      }
      let workingString = val;
      let period = workingString.indexOf(decimalCharacter);
      while (period != -1) {
        // Cutter defined to be decimal followed by an alphabetic followed by either an alphabetic or a digit
        if (/^[a-z]/i.test(workingString.charAt(period + 1)) &&  (/^[a-z]/i.test(workingString.charAt(period + 2)) || /^[0-9]$/.test(workingString.charAt(period + 2)))) {
          //We found the cutter
          workingString = workingString.substring(0, period) + workingString.substring(period + 1);
          period = -1;
        } else {
          period = workingString.indexOf(decimalCharacter, period + 1);
        }
      }
      if (wasArray)
        val = workingString.split(' ');
      else
        val = workingString;
    }

    /* Start of GitHub issue #94 */
    if (Array.isArray(val)) {
      if (this.template.callNumberLineBreaks) {
        if (this.template.numberOfCallNumberLines > 0 && this.template.numberOfCallNumberLines < val.length) {
          return val.filter(v=>!!v) /* Suppress blank lines */
          .slice(0, this.template.numberOfCallNumberLines).join ('<br>')
        }
        else return val.filter(v=>!!v) /* Suppress blank lines */
        .join ('<br>')
      }
      else return val.filter(v=>!!v) /* Suppress blank lines */
      .join(' ')
    }
    else return val;
    /* End of GitHub issue #94 */
  }

  getRawCallNo(val: string | Array<string>, item: Item) {
    val = dot.pick('holding_data.call_number', item);
    if (this.template.blankFields && !val) return " <BR>";
    if (!val) return "";
    if (callNumberParsers[this.template.callNumberParser]) {
      val = callNumberParsers[this.template.callNumberParser](val, item, this.template.decimalCharacter);
    }
    return Array.isArray(val) ?
      val.filter(v=>!!v) /* Suppress blank lines */
      .join(' ') : 
      val;
  }

  getTitle(val: string) {
    if (this.template.blankFields && !val) return " <BR>";
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

  getCopyNumber(copyNumber: string) {
    if (this.template.blankFields && !copyNumber.length) return " <BR>";
    if (!copyNumber.length)
      return "";
    var suppressCopyNumbersArray = this.template.suppressCopyNumbers.split(',');
    for (var index in suppressCopyNumbersArray) {
      suppressCopyNumbersArray[index] = suppressCopyNumbersArray[index].trim();
    }
    if (suppressCopyNumbersArray.indexOf(copyNumber.trim()) == -1)
      return this.template.copyNumberLabel + copyNumber;
    if (this.template.blankFields) 
      return " <BR>";
    return "";
  }
  
  getDescription(val: string) {
    if (this.template.blankFields && !val) return " <BR>";
    if (!val) return "";
    if (this.template.descriptionLineBreaks) {
      //Replace all whitespace with single blank
      val = val.replace(/\s\s+/g, ' ');
      //Now replace single space with a break
      val = val.replace(/\s/g, '<br>');
    }
    return val;
  }
  

}

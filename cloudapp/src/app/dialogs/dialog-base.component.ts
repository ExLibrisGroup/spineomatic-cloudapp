import { Inject } from "@angular/core";
import { Component } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { DEFAULT_DIALOG_OPTIONS, DialogData } from "./dialog";

@Component({
  selector: 'base-dialog',
  template: ''
})
export class BaseDialog {
  text: string;
  defaultOptions = DEFAULT_DIALOG_OPTIONS;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<DialogData>,
    public translate: TranslateService,
  ) {}

  ngAfterContentInit() {
    this.data = Object.assign({...this.defaultOptions}, this.data);
    let text: string, options: any;
    if (Array.isArray(this.data.text)) {
      [text, options] = this.data.text;
    } else {
      text = this.data.text;
    }
    if(!!text) this.text = this.translate.instant(text, options);
  }
}
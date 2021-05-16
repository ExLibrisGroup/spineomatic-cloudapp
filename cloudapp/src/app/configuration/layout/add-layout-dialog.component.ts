import { ElementRef, Inject, ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { capitalize } from "lodash";
import { BaseLayouts } from "../../models/base-layouts";
import { PromptDialog, PromptDialogData  } from "eca-components";

export interface AddLayoutDialogResult {
  name: string;
  basedOn: string;
}
@Component({
  selector: 'add-layout-dialog',
  templateUrl: './add-layout-dialog.component.html',
  styles: [ '.mat-form-field { display: block; }' ]
})
export class AddLayoutDialog extends PromptDialog {
  baseLayouts = BaseLayouts;
  startCase = (str: string) => str.replace(/_/g, ' ').replace(/\w+/g, capitalize);
  @ViewChild('input') inputElement: ElementRef;
  result: AddLayoutDialogResult = { name: "", basedOn: ""};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<PromptDialogData>,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PromptDialog>
  ) {
    super(data,translate,dialogRef);
  }

  onNgInit() {
    this.result = { basedOn: "", name: this.data.val };
  }

  ngAfterViewInit() {
    setTimeout(()=>this.inputElement.nativeElement.focus());
  }
}
import { Inject, ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { AutoCompleteComponent, GetAllOptionsSettings, PromptDialog, PromptDialogData } from "eca-components";
import { Prefix } from "../../../models/configuration";
import { FormControl, FormGroup, Validators } from "@angular/forms";

export interface AddLayoutDialogResult {
  name: string;
  basedOn: string;
}
@Component({
  selector: 'add-prefix-dialog',
  templateUrl: './add-prefix-dialog.component.html',
  styles: [
    '.mat-form-field { display: block; }',
    'eca-auto-complete { display: block; }',
  ]
})
export class AddPrefixDialog extends PromptDialog {
  result = prefixFormGroup(new Prefix());
  @ViewChild('locations') selectLocations: AutoCompleteComponent;
  getLibraries: GetAllOptionsSettings = {
    request: '/conf/libraries',
    value: i => i.code
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<PromptDialogData>,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PromptDialog>
  ) {
    super(data,translate,dialogRef);
  }

  ngAfterViewInit() {
    if (this.data.val) {
      setTimeout(() => {
        this.getLocations(this.data.val.library);
        this.result = prefixFormGroup(this.data.val);
      });
    }
  }

  librarySelected(code: string) {
    this.result.patchValue({ location: null });
    this.getLocations(code);
  }

  getLocations(libCode: string) {
    this.selectLocations.data = {
      request: `/conf/libraries/${libCode}/locations`,
      value: i => i.code
    }
  }
}

const prefixFormGroup = (prefix: Prefix) => {
  return new FormGroup({
    library: new FormControl(prefix.library, Validators.required),
    location: new FormControl(prefix.location),
    text: new FormControl(prefix.text, Validators.required)
  })
}
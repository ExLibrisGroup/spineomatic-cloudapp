import { Inject } from "@angular/core";
import { Component } from "@angular/core";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { BaseDialog } from "./dialog-base.component";
import { DialogData } from "./dialogs";

export interface ConfirmDialogData extends DialogData {
  
}

@Component({
  selector: 'confirmation-dialog',
  template: `<h2 mat-dialog-title translate>{{data.title}}</h2>
  <mat-dialog-content>
    <p>{{text}}</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-flat-button color="secondary" *ngIf="data.type=='ok-cancel'" mat-dialog-close>{{data.cancel | translate}}</button>
    <button mat-flat-button color="secondary" [mat-dialog-close]="true" cdkFocusInitial>{{data.ok | translate}}</button>
  </mat-dialog-actions>`
})
export class ConfirmDialog extends BaseDialog {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<ConfirmDialogData>,
    public translate: TranslateService,
  ) {
    super(data,translate);
  }
}
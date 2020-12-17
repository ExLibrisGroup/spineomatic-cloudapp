import { Inject } from "@angular/core";
import { Component } from "@angular/core";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  title: string;
  text: string;
  cancel: string;
  ok: string;
}

@Component({
  selector: 'style-confirmation-dialog',
  template: `<h2 mat-dialog-title translate>{{data.title}}</h2>
  <mat-dialog-content>
    <p translate>{{data.text}}</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-flat-button color="secondary" mat-dialog-close>{{data.cancel | translate}}</button>
    <button mat-flat-button color="secondary" [mat-dialog-close]="true" cdkFocusInitial>{{data.ok | translate}}</button>
  </mat-dialog-actions>`
})
export class ConfirmationDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}
}
import { ElementRef, Inject, ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { BaseDialog } from './dialog-base.component';
import { DEFAULT_DIALOG_OPTIONS, DialogData } from "./dialogs";

export interface PromptDialogData extends DialogData {
  prompt: string;
  val: string;
}

@Component({
  selector: 'prompt-dialog',
  template: `<h2 mat-dialog-title translate>{{data.title}}</h2>
  <mat-dialog-content>
    <p *ngIf="text">{{text}}</p>
    <mat-form-field>
      <mat-label>{{data.prompt | translate}}</mat-label>
      <input matInput #input [(ngModel)]="val" 
        (keyup.enter)="dialogRef.close(val)"
      >
    </mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-flat-button color="secondary" *ngIf="data.type=='ok-cancel'" mat-dialog-close>{{data.cancel | translate}}</button>
    <button mat-flat-button color="secondary" [mat-dialog-close]="val" cdkFocusInitial>{{data.ok | translate}}</button>
  </mat-dialog-actions>`
})
export class PromptDialog extends BaseDialog {
  val: any;
  @ViewChild('input') inputElement: ElementRef;
  defaultOptions: PromptDialogData = 
    Object.assign(DEFAULT_DIALOG_OPTIONS, { prompt: '', val: '' });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Partial<PromptDialogData>,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PromptDialog>
  ) {
    super(data,translate);
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.val = this.data.val;
      const elem = this.inputElement.nativeElement as HTMLInputElement;
      elem.focus();
      elem.select(); /* this doesn't seem to work */
    });
  }
}
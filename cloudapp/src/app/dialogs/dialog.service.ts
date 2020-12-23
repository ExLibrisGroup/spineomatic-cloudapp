import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BaseDialog } from './dialog-base.component';
import { ConfirmDialog, ConfirmDialogData } from './confirm.component';
import { DialogType } from './dialog';
import { PromptDialog, PromptDialogData } from './prompt.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor( 
    private dialog: MatDialog
  ) {}

  confirm(data: Partial<ConfirmDialogData>) {
    return this.dialog.open(ConfirmDialog, {
      data: data,
      autoFocus: data.type == DialogType.OK
    })
  }

  prompt(data: Partial<PromptDialogData>): MatDialogRef<BaseDialog>;
  prompt(component: Type<BaseDialog>, data: Partial<PromptDialogData>): MatDialogRef<BaseDialog>;
  prompt(componentOrData: Type<BaseDialog> | Partial<PromptDialogData>, data?: Partial<PromptDialogData>) {
    let component: Type<BaseDialog>;
    if (componentOrData instanceof Type) {
      component = componentOrData;
    } else {
      component = PromptDialog;
      data = componentOrData;
    }
    return this.dialog.open(component, {
      data: data,
    });
  }
}
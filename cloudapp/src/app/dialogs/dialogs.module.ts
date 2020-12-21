import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmDialog } from './confirm.component';
import { PromptDialog } from './prompt.component';
import { MaterialModule } from '@exlibris/exl-cloudapp-angular-lib';
import { getTranslateModuleWithICU } from '../utils';
import { FormsModule } from '@angular/forms';
import { AddLayoutDialog } from './add-layout-dialog.component';
import { BaseDialog } from './dialog-base.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    getTranslateModuleWithICU()
  ],
  declarations: [BaseDialog,ConfirmDialog,PromptDialog,AddLayoutDialog],
  entryComponents: [BaseDialog,ConfirmDialog,PromptDialog,AddLayoutDialog],
})
export class DialogsModule { }
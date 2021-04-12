import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateModule } from "@ngx-translate/core";
import { DialogModule } from 'eca-components';
import { AddLayoutDialog } from "./configuration/layout/add-layout-dialog.component";

@NgModule({
  imports: [
    DialogModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    TranslateModule,
  ],
  declarations: [AddLayoutDialog],
  entryComponents: [AddLayoutDialog],
})
export class AppDialogModule { }
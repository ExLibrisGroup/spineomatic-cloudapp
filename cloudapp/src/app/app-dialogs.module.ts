import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateModule } from "@ngx-translate/core";
import { AutoCompleteModule, DialogModule } from 'eca-components';
import { AddLayoutDialog } from "./configuration/layout/add-layout-dialog.component";
import { AddPrefixDialog } from "./configuration/template/prefix/add-prefix-dialog.component";

@NgModule({
  imports: [
    DialogModule,
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AutoCompleteModule,
  ],
  declarations: [ AddLayoutDialog, AddPrefixDialog ],
  entryComponents: [ AddLayoutDialog, AddPrefixDialog ],
})
export class AppDialogModule { }
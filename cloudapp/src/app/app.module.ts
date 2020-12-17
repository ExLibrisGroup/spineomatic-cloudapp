import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MaterialModule, AlertModule, LazyTranslateLoader } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateICUParser } from 'ngx-translate-parser-plural-select';
import { TranslateLoader, TranslateModule, TranslateParser } from '@ngx-translate/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainComponent } from './main/main.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from './configuration/layout/layout.component';
import { TemplateComponent } from './configuration/template/template.component';
import { ImageComponent } from './configuration/image/image.component'; 
import { SelectEntitiesComponent } from './select-entities/select-entities.component';
import { SelectSetComponent } from './select-set/select-set.component';
import { LabelsComponent } from './labels/labels.component';
import { PrintComponent } from './print/print.component';
import { ConfirmationDialog } from './labels/dialog.component';

export function getTranslateModuleWithICU() {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: (LazyTranslateLoader)
    },
    parser: {
      provide: TranslateParser,
      useClass: TranslateICUParser
    }
  });
}

@NgModule({
  declarations: [					
    AppComponent,
    MainComponent,
    ConfigurationComponent,
    LayoutComponent,
    TemplateComponent,
    ImageComponent,
    SelectEntitiesComponent,
    SelectSetComponent,
    LabelsComponent,
    PrintComponent,
    ConfirmationDialog,
   ],
  imports: [
    MaterialModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    getTranslateModuleWithICU(),
    FormsModule,
    ReactiveFormsModule,    
  ],
  entryComponents: [
    ConfirmationDialog,
  ],
  providers: [
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

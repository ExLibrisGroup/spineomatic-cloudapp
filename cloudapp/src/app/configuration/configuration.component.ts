import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CanDeactivate } from '@angular/router';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { startCase } from 'lodash';
import { Observable, of } from 'rxjs';
import { DialogService } from '../dialogs/dialog.service';
import { configFormGroup } from '../models/configuration';
import { ConfigService } from '../services/config.service';
import { MatTabChangeEvent } from '@angular/material/tabs'

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  form: FormGroup;
  startCase = startCase;
  saving = false;
  @ViewChild('tabGroup', { static: false }) tabGroup: any;
  activeTabIndex: number;

  constructor(
    private configService: ConfigService,
    private alert: AlertService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.load();
  }

  ngAfterViewInit() {
    setTimeout(()=>this.activeTabIndex = 0);
  }

  load() {
    this.configService.get().subscribe(config => {
      this.form = configFormGroup(config);
    });
  }

  handleTabChange(e: MatTabChangeEvent) {
    this.activeTabIndex = e.index;
  }

  save() {
    this.saving = true;
    let val = this.form.value;
    this.configService.set(val).subscribe(
      () => {
        this.alert.success(this.translate.instant('Configuration.Success'));
        this.form.markAsPristine();
      },
      err => this.alert.error(err.message),
      ()  => this.saving = false
    );
  }  

}

@Injectable({
  providedIn: 'root',
})
export class ConfigurationGuard implements CanDeactivate<ConfigurationComponent> {
  constructor(
    private dialog: DialogService,
  ) {}

  canDeactivate(component: ConfigurationComponent): Observable<boolean> {
    if(!component.form.dirty) return of(true);
    const dialogRef = this.dialog.confirm({ 
      text: 'Configuration.Discard',
      ok: 'Configuration.DiscardOk'
    });
    return dialogRef.afterClosed();
  }
}
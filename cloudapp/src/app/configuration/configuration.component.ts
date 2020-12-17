import { Component, Injectable, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CanDeactivate } from '@angular/router';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { startCase } from 'lodash';
import { configFormGroup } from '../models/configuration';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  form: FormGroup;
  startCase = startCase;
  saving = false;

  constructor(
    private configService: ConfigService,
    private alert: AlertService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.configService.get().subscribe(config => {
      console.log('config', config)
      this.form = configFormGroup(config);
    });
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
    private translate: TranslateService
  ) {}

  canDeactivate(component: ConfigurationComponent): boolean {
    if(component.form.dirty) {
      return confirm(this.translate.instant('Configuration.Discard'));
    }
    return true;
  }
}
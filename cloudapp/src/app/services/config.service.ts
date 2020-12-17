import { Injectable } from "@angular/core";
import { CloudAppConfigService } from "@exlibris/exl-cloudapp-angular-lib";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Config, Layout } from "../models/configuration";
import { merge } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  _config: Config;

  constructor( 
    private configService: CloudAppConfigService
  ) {  }

  get(): Observable<Config> {
    if (this._config) {
      return of(this._config);
    } else {
      return this.configService.get()
        .pipe(
          map((config: Config) => this.migrate(config)),
          tap(config=>this._config=config)
        );
    }
  }

  set(val: Config) {
    this._config = val;
    return this.configService.set(val);
  }

  migrate(config: Config) {
    if (Object.keys(config).length == 0)
      return new Config();
    else {
      /* Update layouts */
      const defaultLayout = new Layout();
      Object.keys(config.layouts).forEach(key=>{
        config.layouts[key] = merge({...defaultLayout}, config.layouts[key])
      });
      return config;
    }
  }
}

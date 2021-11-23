
import { Injectable } from '@angular/core';
import { InitService } from '@exlibris/exl-cloudapp-angular-lib';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    canConfigure = false;
    
    constructor(private initService: InitService) {}

}
import { Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Config } from '../models/configuration';
import { ConfigService } from '../services/config.service';
import { PrintService } from '../services/print.service';
import { snakeCase, startCase, isEqual } from 'lodash';
import { AlertService, CloudAppStoreService } from '@exlibris/exl-cloudapp-angular-lib';
import { PrintComponent } from '../print/print.component';
import { map, switchMap, tap } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from './dialog.component';
import { Router } from '@angular/router';

const LABELS_STICKY = "labelsSticky";
const dialogData = {
  title: 'Labels.Dialog.title',
  text: 'Labels.Dialog.text',
  cancel: 'Labels.Dialog.cancel',
  ok: 'Labels.Dialog.ok'
}

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent implements OnInit {
  config: Config;
  startCase = startCase;
  @ViewChild('iframe', { read: ElementRef }) iframe: ElementRef;
  loading = false;
  isEqual = isEqual;

  constructor(
    public printService: PrintService,
    private configService: ConfigService,
    private resolver: ComponentFactoryResolver,
    private vcref: ViewContainerRef,
    private alert: AlertService,   
    private store: CloudAppStoreService, 
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit() {
    this.configService.get()
    .pipe(
      tap(config => this.config = config),
      switchMap(() => this.store.get(LABELS_STICKY)),
      tap(sticky => {
        if (sticky) {
          if (sticky.template) this.printService.template = this.config.templates[sticky.template];
          if (sticky.layout) this.printService.layout = this.config.layouts[sticky.layout];
        }
      }),
    )
    .subscribe();
    this.loadItemsFromSet();
  }

  loadItemsFromSet = () => {
    if (!!this.printService.setId) {
      this.loading = true;
      this.printService.loadItems()
      .subscribe({
        complete: () => this.loading = false
      })
    }
  }

  get valid() {
    return !!this.printService.layout && this.printService.items.size > 0;
  }

  print() {
    const componentFactory = this.resolver.resolveComponentFactory(PrintComponent);
    const componentRef = this.vcref.createComponent(componentFactory);
    const doc = this.iframe.nativeElement.contentDocument || this.iframe.nativeElement.contentWindow;
    doc.body.innerHTML = "";
    doc.body.appendChild(componentRef.location.nativeElement);
    this.loading = true;
    componentRef.instance.load()
    .subscribe({
      next: () => {
        setTimeout(()=>{
          this.iframe.nativeElement.contentWindow.print();
          const dialogRef = this.dialog.open(ConfirmationDialog, {
            autoFocus: false,
            data: dialogData
          });
          dialogRef.afterClosed().subscribe(result => {
            if (!result) return;
            this.printService.clear();
            this.router.navigate(['/']);
          });
        }, 100)
      },
      error: e => this.alert.error('An error occurred: ' + e),
      complete: () => this.loading = false
    });
  }  

  onSettingsChanged(event: MatSelectChange, val: string) {
    this.store.get(LABELS_STICKY).pipe(
      map(sticky=>sticky || {}),
      map(sticky=>{
        sticky[val] = snakeCase(event.source.triggerValue);
        return sticky;
      }),
      switchMap(sticky=>this.store.set(LABELS_STICKY, sticky))
    )
    .subscribe();
  }
}

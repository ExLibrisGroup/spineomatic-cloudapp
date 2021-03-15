import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { startCase } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { AddLayoutDialog } from '../../dialogs/add-layout-dialog.component';
import { DialogService } from '../../dialogs/dialog.service';
import { layoutFormGroup, Layouts } from '../../models/configuration'
import { BaseLayouts } from '../../models/base-layouts';
import { ConfigurationBaseComponent } from '../configuration-base.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent extends ConfigurationBaseComponent {
  @Input() form: FormGroup;
  selected: string;
  startCase = startCase;
  addDialog = AddLayoutDialog;
  defaultForm = (basedOn: string) => layoutFormGroup(BaseLayouts[basedOn]);
  valueChanges$ = new BehaviorSubject<Layouts>(null);

  constructor(
    public dialog: DialogService,
  ) { 
    super(dialog);
  }

  ngOnInit() {
    this.selected = this.keys[0];
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      debounceTime(500), 
      map(val=>val[this.selected]),
    )
    .subscribe(this.valueChanges$);
  }

  ngOnDestroy(): void {
    this.valueChanges$.unsubscribe();
  }

  get keys() { 
    return Object.keys(this.form.value) 
  }
}

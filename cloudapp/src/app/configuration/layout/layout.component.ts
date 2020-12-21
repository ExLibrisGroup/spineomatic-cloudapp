import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { startCase } from 'lodash';
import { AddLayoutDialog } from '../../dialogs/add-layout-dialog.component';
import { DialogService } from '../../dialogs/dialog.service';
import { layoutFormGroup } from '../../models/configuration'
import { LayoutExamples } from '../../models/layout-examples';
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
  defaultForm = (basedOn: string) => layoutFormGroup(LayoutExamples[basedOn]);

  constructor(
    public dialog: DialogService,
  ) { 
    super(dialog);
  }

  ngOnInit() {
    this.selected = this.keys[0];
  }

  get keys() { 
    return Object.keys(this.form.value) 
  }
}

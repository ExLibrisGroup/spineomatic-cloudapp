import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { snakeCase, startCase } from 'lodash';
import { layoutFormGroup } from '../../models/configuration'

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  @Input() form: FormGroup;
  selectedLayout: string;
  startCase = startCase;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.selectedLayout = this.layoutKeys[0];
  }

  get layoutKeys() { 
    return Object.keys(this.form.value) 
  }

  addLayout() {
    let name = snakeCase(prompt(this.translate.instant('Configuration.Layouts.LayoutName')));
    if (!!name) {
      if (this.layoutKeys.includes(name)) {
        return alert(this.translate.instant('Configuration.Layouts.LayoutExists',{name: name}));
      } else {
        this.form.addControl(name, layoutFormGroup());
        this.selectedLayout = name;
        this.form.markAsDirty();  
      }
    }
  }

  deleteLayout() {
    if (confirm(this.translate.instant('Configuration.Layouts.ConfirmDeleteLayout', {name: startCase(this.selectedLayout)}))) {
      this.form.removeControl(this.selectedLayout);
      this.selectedLayout = this.layoutKeys[0];
      this.form.markAsDirty();
    }
  }

  renameLayout() {
    let name = snakeCase(prompt(this.translate.instant('Configuration.Layouts.RenameLayout'), startCase(this.selectedLayout)));
    if (!!name) {
      if (this.layoutKeys.includes(name)) {
        return alert(this.translate.instant('Configuration.Layouts.LayoutExists',{name: startCase(name)}));
      } else {
        this.form.addControl(name, this.form.get(this.selectedLayout));
        this.form.removeControl(this.selectedLayout);
        this.selectedLayout = name;
        this.form.markAsDirty();
      }
    }
  }
}

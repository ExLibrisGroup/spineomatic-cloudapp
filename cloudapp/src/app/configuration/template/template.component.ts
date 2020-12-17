import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { snakeCase, startCase } from 'lodash';
import { templateFormGroup } from '../../models/configuration';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {
  @Input() form: FormGroup;
  selectedTemplate: string;
  startCase = startCase;

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.selectedTemplate = this.templateKeys[0];
  }

  get templateKeys() { 
    return Object.keys(this.form.value) 
  }

  addTemplate() {
    let name = snakeCase(prompt(this.translate.instant('Configuration.Templates.TemplateName')));
    if (!!name) {
      if (this.templateKeys.includes(name)) {
        return alert(this.translate.instant('Configuration.Templates.TemplateExists',{name: name}));
      } else {
        this.form.addControl(name, templateFormGroup());
        this.selectedTemplate = name;
        this.form.markAsDirty();  
      }
    }
  }

  deleteTemplate() {
    if (confirm(this.translate.instant('Configuration.Templates.ConfirmDeleteTemplate', {name: startCase(this.selectedTemplate)}))) {
      this.form.removeControl(this.selectedTemplate);
      this.selectedTemplate = this.templateKeys[0];
      this.form.markAsDirty();
    }
  }

  renameTemplate() {
    let name = snakeCase(prompt(this.translate.instant('Configuration.Templates.RenameTemplate'), startCase(this.selectedTemplate)));
    if (!!name) {
      if (this.templateKeys.includes(name)) {
        return alert(this.translate.instant('Configuration.Templates.TemplateExists',{name: startCase(name)}));
      } else {
        this.form.addControl(name, this.form.get(this.selectedTemplate));
        this.form.removeControl(this.selectedTemplate);
        this.selectedTemplate = name;
        this.form.markAsDirty();
      }
    }
  }
}

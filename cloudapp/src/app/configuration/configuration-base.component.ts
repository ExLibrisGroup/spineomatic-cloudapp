import { Component, OnInit, Type } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { snakeCase, startCase } from "lodash";
import { AddLayoutDialogResult } from "../dialogs/add-layout-dialog.component";
import { BaseDialog } from "../dialogs/dialog-base.component";
import { DialogService } from "../dialogs/dialog.service";
import { DialogType } from "../dialogs/dialog";
import { PromptDialog } from "../dialogs/prompt.component";

@Component({
  selector: 'app-config-base',
  template: '',
})
export class ConfigurationBaseComponent implements OnInit {
  form: FormGroup;
  selected: string;
  defaultForm: (param?: any) => FormGroup;
  afterAdd: (name: string) => void;
  addDialog: Type<BaseDialog> = PromptDialog;

  constructor(
    public dialog: DialogService,
  ) { }

  ngOnInit() {
  }
  
  get keys() {
    return [];
  };

  add() {
    this.dialog.prompt(this.addDialog, {
      title: 'Configuration.Add',
      prompt: 'Configuration.Name'
    })
    .afterClosed().subscribe( (result: string | AddLayoutDialogResult ) => {
      if (!result) return;
      const name = snakeCase(typeof result == 'string' ? result : result.name);
      const basedOn = typeof result == 'string' ? undefined : result.basedOn;
      if (!name) return;
      if (this.keys.includes(name)) {
        return this.dialog.confirm({
          text: ['Configuration.Exists', { name: startCase(name) }],
          type: DialogType.OK
        });
      } 
      this.form.addControl(name, this.defaultForm(basedOn));
      this.selected = name;
      this.form.markAsDirty();
      if (!!this.afterAdd) setTimeout(()=>this.afterAdd(name));
    })
  }

  delete(key?: string) {
    key = key || this.selected;
    this.dialog.confirm({
      text: ['Configuration.ConfirmDelete', { name: startCase(key) }] 
    })
    .afterClosed().subscribe(result => {
      if (!result) return;
      this.form.removeControl(key);
      this.selected = this.keys[0];
      this.form.markAsDirty();
    });
  }

  rename(key?: string) {
    key = key || this.selected;
    this.dialog.prompt({
      title: 'Configuration.Rename',
      prompt: 'Configuration.Name',
      val: startCase(key)
    })
    .afterClosed().subscribe( (result: string) => {
      const name = snakeCase(result);
      if (!name || name == key) return;
      if (this.keys.includes(name)) {
        return this.dialog.confirm({
          text: ['Configuration.Exists', { name: startCase(name) }],
          type: DialogType.OK
        });
      } 
      this.form.addControl(name, this.form.get(key));
      this.form.removeControl(key);
      this.selected = name;
      this.form.markAsDirty();
    });
  }
}
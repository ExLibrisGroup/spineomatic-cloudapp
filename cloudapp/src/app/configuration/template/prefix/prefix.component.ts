import { Component, Input } from "@angular/core";
import { FormArray, FormGroup } from "@angular/forms";
import { FormGroupUtil } from "@exlibris/exl-cloudapp-angular-lib";
import { DialogService } from "eca-components";
import { Prefix } from "../../../models/configuration";
import { AddPrefixDialog } from "./add-prefix-dialog.component";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-prefix',
  templateUrl: './prefix.component.html',
  styleUrls: ['./prefix.component.scss'],
})
export class PrefixComponent {
  @Input() form: FormGroup;

  constructor(
    private dialog: DialogService,
  ) {}

  deletePrefix(index: number) {
    this.prefixes.removeAt(index);
    this.form.markAsDirty();
  }

  editPrefix(index: number) {
    this.dialog.prompt(AddPrefixDialog, {
      title: 'Configuration.Templates.EditPrefix',
      val: this.prefixes.at(index).value,
    })
    .subscribe((prefix: Prefix) => {
      if (!prefix) return;
      if (prefix.library && prefix.text) {
        this.prefixes.at(index).patchValue(prefix);
        this.form.markAsDirty();
      }
    })
  }

  addPrefix() {
    this.dialog.prompt(AddPrefixDialog, {
      title: 'Configuration.Templates.AddPrefix',
    })
    .subscribe((prefix: Prefix) => {
      if (!prefix) return;
      if (prefix.library && prefix.text) {
        this.prefixes.push(FormGroupUtil.toFormGroup(prefix));
        this.form.markAsDirty();
      }
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    let array = this.prefixes.value;
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    this.form.patchValue({ prefixes: array });
    this.form.markAsDirty();
  }

  get prefixes() {
    return this.form.controls.prefixes as FormArray
  }
}
import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { startCase } from 'lodash';
import { Editor } from '../../../assets/tinymce/tinymce';
import { DialogService } from '../../dialogs/dialog.service';
import { barcodeFormats, Images, templateFormGroup } from '../../models/configuration';
import { LABEL_FIELDS } from '../../models/item';
import { ConfigurationBaseComponent } from '../configuration-base.component';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent extends ConfigurationBaseComponent {
  @Input() form: FormGroup;
  @Input() images: Images;
  selected: string;
  startCase = startCase;
  defaultForm = templateFormGroup;
  barcodeFormats = barcodeFormats;

  constructor(
    private translate: TranslateService,
    public dialog: DialogService,
  ) { 
    super(dialog)
  }

  ngOnInit() {
    this.selected = this.keys[0];
  }

  get keys() { 
    return Object.keys(this.form.value) 
  }
  
  initmce = (editor: Editor) => {
    editor.ui.registry.addSplitButton('addimage', {
      icon: 'image',
      text: this.translate.instant('Configuration.Templates.AddImage'),
      tooltip: this.translate.instant('Configuration.Templates.AddImage'),
      fetch: this.imageList,
      onAction: () => null,
      onItemAction: (api, value) =>
         editor.insertContent(`{{image:${value}}}`)
    });
    editor.ui.registry.addSplitButton('addfield', {
      icon: 'template',
      text: this.translate.instant('Configuration.Templates.AddField'),
      tooltip: this.translate.instant('Configuration.Templates.AddField'),
      fetch: this.fieldList,
      onAction: () => null,
      onItemAction: (api, value) =>
         editor.insertContent(`{{field:${value}}}`)
    });
  }

  imageList = (cb: (items: any[]) => void) => {
    const images = Object.keys(this.images).map(key=>({
      type: 'choiceitem', 
      text: key,
      value: key
    }));
    cb(images);
  }

  fieldList = (cb: (items: any[]) => void) => {
    const fields = LABEL_FIELDS.map(key=>({
      type: 'choiceitem', 
      text: this.translate.instant('Configuration.Templates.Fields.'+key),
      value: key
    }));
    cb(fields);
  }

  get asBarcode(): boolean {
    return (this.form.get(this.selected) as FormGroup).controls.asBarcode.value
  }
}


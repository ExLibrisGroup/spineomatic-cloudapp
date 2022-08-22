import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { startCase } from 'lodash';
import * as dot from 'dot-object'
import { Editor } from '../../../assets/tinymce/tinymce';
import { DialogService } from 'eca-components';
import { barcodeFormats, Images, templateFormGroup } from '../../models/configuration';
import { LABEL_FIELDS } from '../../models/item';
import { ConfigurationBaseComponent } from '../configuration-base.component';
import { itemExample } from '../../models/item-example';
import { resizeImage } from '../image/image-utils';
import { callNumberParsers } from '../../models/call-number-parsers';
import { checksums } from '../../models/checksums';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
})
export class TemplateComponent extends ConfigurationBaseComponent {
  @Input() form: FormGroup;
  @Input() images: Images;
  selected: string;
  startCase = startCase;
  defaultForm = templateFormGroup;
  barcodeFormats = barcodeFormats;
  callNumberParsers = Object.keys(callNumberParsers);
  checksums = Object.keys(checksums);
  
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
    this.addImageIcons(editor);

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
      value: key,
      icon: key,
    }));
    cb(images);
  }

  fieldList = (cb: (items: any[]) => void) => {
    const fields = LABEL_FIELDS
    .map(key=>({
      type: 'choiceitem', 
      text: this.translate.instant('Configuration.Templates.Fields.'+key),
      value: key
    }));
    const otherFields = Object.keys(dot.dot(itemExample))
    .sort().map(key=>({
      type: 'choiceitem', 
      text: key,
      value: key
    }))
    cb(fields.concat(otherFields));
  }

  addImageIcons(editor: Editor) {
    Object.entries(this.images)
    .forEach(([key, value])=>{
      resizeImage(value.url, 24)
      .then(result=>{
        const image = 
          `<svg height="${result.height}" width="${result.width}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <image height="${result.height}" width="${result.width}" xlink:href="${result.data}"></image>
          </svg>`;
        editor.ui.registry.addIcon(key, image);
      })
      .catch(error=>console.error('Error reading image. ' + error));
    })
  }

  get asBarcode(): boolean {
    return (this.form.get(this.selected) as FormGroup).controls.asBarcode.value
  }

  get showBarcodeValue(): boolean {
    return (this.form.get(this.selected) as FormGroup).controls.showBarcodeValue.value  
  }

  get callNumberLineBreaks(): boolean {
    return (this.form.get(this.selected) as FormGroup).controls.callNumberLineBreaks.value
  }

  get hideCutterDecimal(): boolean {
    return (this.form.get(this.selected) as FormGroup).controls.hideCutterDecimal.value
  }

  get removeCharactersFromCallNo(): string {
    return (this.form.get(this.selected) as FormGroup).controls.removeCharactersFromCallNo.value
  }

  get selectedTemplate() {
    return this.form.get(this.selected) as FormGroup;
  }
}


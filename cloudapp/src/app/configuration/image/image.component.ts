import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { startCase } from 'lodash';
import { DialogService } from '../../dialogs/dialog.service';
import { imageFormGroup } from '../../models/configuration';
import { ConfigurationBaseComponent } from '../configuration-base.component';
import { resizeImage } from './image-utils';

const MAX_IMAGE_SIZE = 250;

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent extends ConfigurationBaseComponent {
  @Input() form: FormGroup;
  startCase = startCase;
  defaultForm = imageFormGroup;
  afterAdd = (name: string) => document.getElementById('files-'+ name).click();

  constructor(
    private alert: AlertService,
    public dialog: DialogService,
  ) { 
    super(dialog)
  }

  ngOnInit() {
  }

  url(key: string) {
    return (this.form.get(key) as FormGroup).controls.url.value;
  }

  get keys() {
    return Object.keys(this.form.value) 
  }

  fileChangeEvent(files: File[], key: string) {
    resizeImage(files[0], MAX_IMAGE_SIZE)
    .then(result=>this.form.get(key).patchValue({url: result}))
    .catch(error=>this.alert.error('Error reading image' + error));
  }

}

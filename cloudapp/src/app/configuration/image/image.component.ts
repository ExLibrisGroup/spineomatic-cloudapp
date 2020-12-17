import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { snakeCase, startCase } from 'lodash';
import { imageFormGroup } from '../../models/configuration';
import { resizeImage } from './utils';

const MAX_IMAGE_SIZE = 300;

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ImageComponent implements OnInit {
  @Input() form: FormGroup;
  startCase = startCase;

  constructor(
    private alert: AlertService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  add() {
    let name = snakeCase(prompt(this.translate.instant('Configuration.Images.ImageName')));
    if (!!name) {
      if (this.imageKeys.includes(name)) {
        return alert(this.translate.instant('Configuration.Images.ImageExists',{name: name}));
      } else {
        this.form.addControl(name, imageFormGroup());
        //this.selectedLayout = name;
        this.form.markAsDirty();  
      }
    }
  }

  rename(key: string) {
    let name = snakeCase(prompt(this.translate.instant('Configuration.Images.RenameImage'), startCase(key)));
    if (!!name) {
      if (this.imageKeys.includes(name)) {
        return alert(this.translate.instant('Configuration.Images.ImageExists',{name: startCase(name)}));
      } else {
        this.form.addControl(name, this.form.get(key));
        this.form.removeControl(key);
        this.form.markAsDirty();
      }
    }
  }

  delete(key) {
    if (confirm(this.translate.instant('Configuration.Images.ConfirmDeleteImage', {name: startCase(key)}))) {
      this.form.removeControl(key);
      this.form.markAsDirty();
    }
  }

  url(key: string) {
    return (this.form.get(key) as FormGroup).controls.url.value;
  }

  get imageKeys() {
    return Object.keys(this.form.value) 
  }

  fileChangeEvent(files: File[], key: string) {
    resizeImage(files[0], MAX_IMAGE_SIZE)
    .then(result=>this.form.get(key).patchValue({url: result}))
    .catch(error=>this.alert.error('Error reading image' + error));
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { PrintService } from '../services/print.service';
import { Router } from '@angular/router';
import { Editor } from '../../assets/tinymce/tinymce';
import { EditorComponent } from '@tinymce/tinymce-angular'
import { TinyMCE } from '../../assets/tinymce/tinymce';
import { LABEL_FIELDS } from '../models/item';
import { TranslateService } from '@ngx-translate/core';
import { itemExample } from '../models/item-example';
import * as dot from 'dot-object'

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  @ViewChild('editor', { static: true }) editor: EditorComponent;
  constructor(
    private translate: TranslateService,
    public printService: PrintService,
    private router: Router,
  ) { }
  
  initmce = (editor: Editor) => {
    editor.on('init', () => {
      this.loadLabels()  // set editor content
    })
  }
  
  ngOnInit(): void {
  }

  loadLabels() {
    if (this.editor && this.editor.editor) {
      this.editor.editor.setContent(this.printService.rawLabels);
    }  
  }
  
  reset() {
    this.printService.clear()
    .then(() => this.router.navigate(['/']));
  }
}

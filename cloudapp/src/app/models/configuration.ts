import { FormGroupUtil } from "@exlibris/exl-cloudapp-angular-lib"

export class Config {
  layouts: Layouts = {};
  templates: Templates = {};
  images: Images = {};
}

export interface Layouts {
  [key: string]: Layout
}

export class Templates {
  [key: string]: Template
}

export const barcodeFormats = ['CODE128' , 'CODE128A' , 'CODE128B' , 'CODE128C' , 'EAN13' , 'UPC' , 'EAN8' , 'EAN5' , 'EAN2' , 'CODE39' , 'ITF14' , 'MSI' , 'MSI10' , 'MSI11' , 'MSI1010' , 'MSI1110' , 'pharmacode' , 'codabar'] as const;
type BarcodeFormats = typeof barcodeFormats[number];

export class Template {
  contents: string = "";
  asBarcode: boolean = false;
  showBarcodeValue: boolean = true;
  barcodeEncoding: BarcodeFormats = 'codabar';
  callNumberLineBreaks: boolean = false;
  callNumberParser: string = "";
}

export class Images {
  [key: string]: Image
}

export class Image {
  url: string = "";
}

export class Layout {
  measure: 'in' | 'cm' = 'in';
  topMargin: number = 0;
  leftMargin: number = 0;
  pageWidth: number = 8.5;
  orientation: 'portrait' | 'landscape' = 'portrait';
  width: number = 0;
  height: number = 0;
  horizontalGap: number = 0;
  verticalGap: number = 0;
  perPage: number = 12;
  leftPadding: number = 0.05;
}

export const layoutFormGroup = (layout: Layout = new Layout()) => FormGroupUtil.toFormGroup(layout);
export const templateFormGroup = (template: Template = new Template()) => FormGroupUtil.toFormGroup(template);
export const imageFormGroup = (image: Image = new Image()) => FormGroupUtil.toFormGroup(image);
export const configFormGroup = (config: Config) => FormGroupUtil.toFormGroup(Object.assign(new Config(), config));
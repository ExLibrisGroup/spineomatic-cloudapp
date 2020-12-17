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

export class Template {
  font: string = "";
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
}

export const layoutFormGroup = (layout: Layout = new Layout()) => FormGroupUtil.toFormGroup(layout);
export const templateFormGroup = (template: Template = new Template()) => FormGroupUtil.toFormGroup(template);
export const imageFormGroup = (image: Image = new Image()) => FormGroupUtil.toFormGroup(image);
export const configFormGroup = (config: Config) => FormGroupUtil.toFormGroup(Object.assign(new Config(), config));

/*
Avery 5163
https://www.worldlabel.com/Pages/wl-ol125.htm
Top Margin: 0.5
Left Margin: 0.18
Page width: 8.5
Orientation: Portrait
Label width: 4
Label height: 2
Horizontal Gap: 0.14
Vertical gap: 0
Labels per page: 10

Avery 5160
https://www.worldlabel.com/Pages/wl-ol875.htm
Top Margin: 0.5
Left margin: 0.21975
Page width: 8.5
Orientation: Landscape
Label width: 2.625
Label height: 1
Horizontal gap: 0.14
Vertical gap: 0
Labels- 30
*/